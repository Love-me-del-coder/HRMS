import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.company!.id;
    const totalEmployees = await prisma.employee.count({ where: { companyId } });
    const activeEmployees = await prisma.employee.count({ where: { companyId, status: 'active' } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const onLeaveToday = await prisma.leaveRequest.count({
      where: {
        companyId,
        status: 'approved',
        startDate: { lte: today },
        endDate: { gte: today }
      }
    });

    const openVacancies = await prisma.jobRequisition.count({
      where: { companyId, status: 'open' }
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        onLeaveToday,
        openVacancies
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
