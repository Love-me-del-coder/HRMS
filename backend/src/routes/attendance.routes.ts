import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * Helper to get the current date at midnight in the company's timezone
 */
const getCompanyToday = (timezone: string = 'UTC'): Date => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')!.value);
  const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
  const day = parseInt(parts.find(p => p.type === 'day')!.value);

  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

// ---- Attendance Records ----
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const isAdminOrHr = ['company_admin', 'hr_manager'].includes(req.user!.role);
    const employeeIdFilter = isAdminOrHr ? undefined : req.user!.employeeId;

    const items = await prisma.attendanceRecord.findMany({
      where: { 
        companyId: req.company!.id,
        ...(employeeIdFilter ? { employeeId: employeeIdFilter } : {})
      },
      include: { employee: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch attendance records' });
  }
});

router.post('/check-in', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const employeeId = req.user!.employeeId;
    if (!employeeId) return res.status(400).json({ success: false, error: 'User is not linked to an employee profile' });

    const today = getCompanyToday(req.company!.timezone);

    // Check if already checked in today
    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        companyId,
        employeeId,
        date: today,
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already checked in for today' });
    }

    const newItem = await prisma.attendanceRecord.create({
      data: {
        companyId,
        employeeId,
        date: today,
        checkIn: new Date(),
        status: 'present',
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Check-in failed' });
  }
});

router.post('/check-out', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const employeeId = req.user!.employeeId;
    if (!employeeId) return res.status(400).json({ success: false, error: 'User is not linked to an employee profile' });

    const today = getCompanyToday(req.company!.timezone);
    
    // Find today's record
    const records = await prisma.attendanceRecord.findMany({
      where: {
        companyId,
        employeeId,
        date: today,
        checkOut: null
      }
    });
    
    const record = records[0];
    if (!record) {
      return res.status(404).json({ success: false, error: 'No active check-in found for today' });
    }

    const updated = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { checkOut: new Date() }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Check-out failed' });
  }
});

// ---- Shifts ----
router.get('/shifts', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.shift.findMany({
      where: { companyId: req.company!.id }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch shifts' });
  }
});

// ---- Summary ----
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const isAdminOrHr = ['company_admin', 'hr_manager'].includes(req.user!.role);
    const employeeIdFilter = isAdminOrHr ? undefined : req.user!.employeeId;

    const records = await prisma.attendanceRecord.findMany({
      where: { 
        companyId: req.company!.id,
        ...(employeeIdFilter ? { employeeId: employeeIdFilter } : {})
      }
    });
    
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const halfDay = records.filter(r => r.status === 'half_day').length;
    
    res.json({ 
      success: true, 
      data: { present, absent, late, halfDay, total: records.length } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

export default router;
