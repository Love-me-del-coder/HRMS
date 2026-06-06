import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authorizeRoles, hasSelfOrAdminAccess } from '../middleware/auth';

const router = Router();

// List all employees - accessible to everyone, but we could strip sensitive data
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { companyId: req.company!.id },
      include: { department: true }
    });
    
    const isAdminOrHr = ['company_admin', 'hr_manager'].includes(req.user!.role);

    const sanitizedEmployees = employees.map(emp => {
      if (isAdminOrHr) return emp;

      // Strip sensitive fields for normal users
      const { salary, ...publicData } = emp;
      return publicData;
    });

    res.json({ success: true, data: sanitizedEmployees });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
});

// View specific employee
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id as string },
      include: { department: true }
    });
    
    if (!employee || employee.companyId !== req.company!.id) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }

    if (!hasSelfOrAdminAccess(req, employee.id)) {
      res.status(403).json({ success: false, error: 'Forbidden: You can only view your own full profile' });
      return;
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch employee' });
  }
});

// Create employee (Admin/HR only)
router.post('/', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, companyId: req.company!.id };
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);
    if (data.hireDate) data.hireDate = new Date(data.hireDate);
    
    const result = await prisma.$transaction(async (tx) => {
      const newEmployee = await tx.employee.create({ data });

      // Initialize Leave Balances for all active leave types
      const leaveTypes = await tx.leaveType.findMany({
        where: { companyId: req.company!.id, isActive: true }
      });

      const balances = leaveTypes.map(lt => ({
        employeeId: newEmployee.id,
        leaveTypeId: lt.id,
        total: lt.daysPerYear,
        used: 0,
        pending: 0,
        available: lt.daysPerYear
      }));

      if (balances.length > 0) {
        await tx.leaveBalance.createMany({ data: balances });
      }

      return newEmployee;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create employee' });
  }
});

// Update employee (Admin/HR only)
router.put('/:id', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id as string } });
    if (!employee || employee.companyId !== req.company!.id) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }
    
    const data = { ...req.body };
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);
    if (data.hireDate) data.hireDate = new Date(data.hireDate);
    
    const updated = await prisma.employee.update({
      where: { id: req.params.id as string },
      data
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update employee' });
  }
});

// Terminate employee (Admin/HR only)
router.delete('/:id', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { id: req.params.id as string } });
    if (!employee || employee.companyId !== req.company!.id) {
      res.status(404).json({ success: false, error: 'Employee not found' });
      return;
    }
    const updated = await prisma.employee.update({
      where: { id: req.params.id as string },
      data: { status: 'terminated' }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete employee' });
  }
});

export default router;
