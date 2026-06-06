import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import PDFDocument from 'pdfkit';
import { AuthRequest, authorizeRoles, hasSelfOrAdminAccess } from '../middleware/auth';
import { sendEmail } from '../services/email.service';
import * as payrollService from '../services/payroll.service';

const router = Router();

const payrollRoles = ['company_admin', 'hr_manager', 'finance_manager'];

// ---- Payroll Runs (Admins/HR/Finance only) ----
router.get('/runs', authorizeRoles(...payrollRoles), async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.payrollRun.findMany({
      where: { companyId: req.company!.id },
      orderBy: { runDate: 'desc' }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch payroll runs' });
  }
});

router.get('/runs/:id', authorizeRoles(...payrollRoles), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.payrollRun.findUnique({
      where: { id: req.params.id as string },
      include: { payslips: { include: { employee: true } } }
    });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch payroll run' });
  }
});

router.post('/runs', authorizeRoles(...payrollRoles), async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.payrollRun.create({
      data: {
        companyId: req.company!.id,
        periodStart: new Date(req.body.periodStart),
        periodEnd: new Date(req.body.periodEnd),
        runDate: new Date(req.body.runDate),
        currency: req.body.currency || 'LKR', // Default to LKR for Sri Lanka
        status: 'draft',
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create payroll run' });
  }
});

// BUSINESS LOGIC: Payroll Generation Engine
router.post('/runs/:id/process', authorizeRoles(...payrollRoles), async (req: AuthRequest, res: Response) => {
  try {
    const runId = req.params.id as string;
    const companyId = req.company!.id;

    const run = await prisma.payrollRun.findUnique({ where: { id: runId } });
    if (!run || run.companyId !== companyId) {
      return res.status(404).json({ success: false, error: 'Payroll run not found' });
    }

    if (run.status !== 'draft') {
      return res.status(400).json({ success: false, error: `Cannot process a run in ${run.status} status` });
    }

    // 1. Fetch all active employees
    const employees = await prisma.employee.findMany({
      where: { companyId, status: 'active' }
    });

    if (employees.length === 0) {
      return res.status(400).json({ success: false, error: 'No active employees found to process' });
    }

    // 2. Process all payslips in a mathematically sound transaction
    const result = await prisma.$transaction(async (tx) => {
      
      // Clear any existing payslips for this run (if re-processing)
      await tx.payslip.deleteMany({
        where: { payrollRunId: runId }
      });

      const payslipsToCreate = employees.map(emp => {
        const calc = payrollService.calculatePayslip(emp.salary);

        return {
          companyId,
          employeeId: emp.id,
          payrollRunId: runId,
          periodStart: run.periodStart,
          periodEnd: run.periodEnd,
          basic: calc.basic,
          earnings: { allowances: calc.allowanceAmount },
          deductions: { epf: calc.epfDeduction, paye: calc.payeTax },
          grossPay: calc.grossPay,
          totalDeductions: calc.totalDeductions,
          netPay: calc.netPay,
          currency: run.currency,
          status: 'generated'
        };
      });

      // Bulk create payslips
      await tx.payslip.createMany({
        data: payslipsToCreate
      });

      // Update run status
      return await tx.payrollRun.update({
        where: { id: runId },
        data: { 
          status: 'processing', 
          processedBy: req.user!.id
        }
      });
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to process run' });
  }
});

router.post('/runs/:id/approve', authorizeRoles(...payrollRoles), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.payrollRun.findUnique({ where: { id: req.params.id as string } });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    
    // In a real system, this might trigger emails to employees with their PDF payslips attached
    const updated = await prisma.payrollRun.update({
      where: { id: req.params.id as string },
      data: { status: 'completed', approvedBy: req.user!.id }
    });

    // Send Payslip emails asynchronously
    prisma.payslip.findMany({
      where: { payrollRunId: req.params.id as string },
      include: { employee: { include: { user: true } } }
    }).then(payslips => {
      payslips.forEach(p => {
        const email = p.employee?.user?.email;
        if (email) {
          sendEmail(
            email,
            'Your New Payslip is Ready',
            `<h3>Payroll Processed</h3><p>Your net pay for this period is ${p.netPay}. Log in to the HRMS to view your full payslip.</p>`
          ).catch(console.error);
        }
      });
    }).catch(console.error);

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to approve run' });
  }
});

// ---- Payslips ----
router.get('/runs/:runId/payslips', authorizeRoles(...payrollRoles), async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.payslip.findMany({
      where: { 
        companyId: req.company!.id,
        payrollRunId: req.params.runId as string
      },
      include: { employee: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch payslips' });
  }
});

router.get('/payslips/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.payslip.findUnique({
      where: { id: req.params.id as string },
      include: { employee: true, payrollRun: true }
    });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    
    if (!hasSelfOrAdminAccess(req, item.employeeId)) {
      res.status(403).json({ success: false, error: 'Forbidden: You can only view your own payslips' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch payslip' });
  }
});

router.get('/payslips/:id/pdf', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.payslip.findUnique({
      where: { id: req.params.id as string },
      include: { employee: true, payrollRun: true }
    });
    
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    
    if (!hasSelfOrAdminAccess(req, item.employeeId)) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${item.id}.pdf`);
    
    doc.pipe(res);
    
    // Draw the PDF
    doc.fontSize(20).text('HRMS SaaS Platform', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('OFFICIAL PAYSLIP', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Employee Name: ${item.employee.firstName} ${item.employee.lastName}`);
    doc.text(`Employee ID: ${item.employee.id}`);
    doc.text(`Payroll Date: ${item.payrollRun.runDate.toDateString()}`);
    doc.moveDown();
    
    doc.text(`Basic Salary: ${item.basic.toString()} LKR`);
    doc.text(`Earnings: ${JSON.stringify(item.earnings)} LKR`);
    doc.text(`Total Deductions (EPF/PAYE): ${item.totalDeductions.toString()} LKR`);
    doc.moveDown();
    
    doc.fontSize(14).text(`NET PAY: ${item.netPay.toString()} LKR`, { underline: true });
    
    doc.end();
    
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate PDF' });
  }
});

// ---- Structures ----
router.get('/structures', authorizeRoles(...payrollRoles), async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.payrollStructure.findMany({
      where: { companyId: req.company!.id }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch structures' });
  }
});

export default router;
