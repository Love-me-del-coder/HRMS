import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authorizeRoles, hasSelfOrAdminAccess } from '../middleware/auth';
import { sendEmail } from '../services/email.service';

const router = Router();

const hrRoles = ['company_admin', 'hr_manager', 'manager'];

// ---- Leave Types ----
router.get('/types', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.leaveType.findMany({
      where: { companyId: req.company!.id }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leave types' });
  }
});

// ---- Leave Requests ----
router.get('/requests', async (req: AuthRequest, res: Response) => {
  try {
    const isAdminOrHr = ['company_admin', 'hr_manager'].includes(req.user!.role);
    
    // If not HR/Admin, they only see their own requests
    const employeeIdFilter = isAdminOrHr ? undefined : req.user!.employeeId;

    const items = await prisma.leaveRequest.findMany({
      where: { 
        companyId: req.company!.id,
        ...(employeeIdFilter ? { employeeId: employeeIdFilter } : {})
      },
      include: { employee: true, leaveType: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leave requests' });
  }
});

router.post('/requests', async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = req.user!.employeeId;
    if (!employeeId) return res.status(400).json({ success: false, error: 'User is not linked to an employee profile' });

    const newItem = await prisma.leaveRequest.create({
      data: {
        companyId: req.company!.id,
        employeeId,
        leaveTypeId: req.body.leaveTypeId,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        days: req.body.days,
        reason: req.body.reason,
        status: 'pending',
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create leave request' });
  }
});

// BUSINESS LOGIC: Transactional Approval
router.post('/requests/:id/approve', authorizeRoles(...hrRoles), async (req: AuthRequest, res: Response) => {
  try {
    const requestItem = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
    if (!requestItem || requestItem.companyId !== req.company!.id) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    if (requestItem.status === 'approved') {
      return res.status(400).json({ success: false, error: 'Leave request is already approved' });
    }

    // Run mathematically sound deduction in a strict database transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Get current balance
      const balance = await tx.leaveBalance.findFirst({
        where: {
          employeeId: requestItem.employeeId,
          leaveTypeId: requestItem.leaveTypeId
        }
      });

      if (!balance) {
        throw new Error('Leave balance record not found for this employee');
      }

      // Check if this type of leave requires balance tracking (e.g. unpaid might not)
      // Assuming all leaves in this simple system track balance.
      if (balance.available < requestItem.days) {
        throw new Error(`Insufficient leave balance. Requested: ${requestItem.days}, Available: ${balance.available}`);
      }

      // 2. Deduct balance
      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: {
          available: balance.available - requestItem.days,
          used: balance.used + requestItem.days
        }
      });

      // 3. Mark request as approved
      const updatedReq = await tx.leaveRequest.update({
        where: { id: requestItem.id },
        data: {
          status: 'approved',
          approvedBy: req.user!.id,
          comments: req.body.comments,
        },
        include: { employee: { include: { user: true } } }
      });
      return updatedReq;
    });

    // Send Email Notification in the background
    if (updated.employee?.user?.[0]?.email) {
      const email = updated.employee.user[0].email;
      sendEmail(
        email, 
        'Leave Request Approved', 
        `<h3>Good news!</h3><p>Your leave request for ${requestItem.days} days has been approved.</p>`
      ).catch(console.error);
    }

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to approve leave' });
  }
});

router.post('/requests/:id/reject', authorizeRoles(...hrRoles), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    
    if (item.status === 'approved') {
      // In a real system, rejecting an approved leave should refund the balance
      return res.status(400).json({ success: false, error: 'Cannot reject an already approved leave without refunding manually.' });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        approvedBy: req.user!.id,
        comments: req.body.comments,
      }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reject leave' });
  }
});

// ---- Leave Balances ----
router.get('/balances', async (req: AuthRequest, res: Response) => {
  try {
    // Determine which employee to query
    let empId = req.user!.employeeId;
    
    // If Admin/HR, they can specify an employeeId in query
    if (['company_admin', 'hr_manager'].includes(req.user!.role) && req.query.employeeId) {
      empId = String(req.query.employeeId);
    }

    if (!empId) return res.json({ success: true, data: [] });

    const items = await prisma.leaveBalance.findMany({
      where: { employeeId: empId },
      include: { leaveType: true }
    });
    
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch balances' });
  }
});

// ---- Leave Calendar ----
router.get('/calendar', async (req: AuthRequest, res: Response) => {
  try {
    // Everyone can see the calendar (approved leaves) so they know who is out of office
    const items = await prisma.leaveRequest.findMany({
      where: { 
        companyId: req.company!.id,
        status: 'approved'
      },
      include: { employee: true, leaveType: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch calendar' });
  }
});

export default router;
