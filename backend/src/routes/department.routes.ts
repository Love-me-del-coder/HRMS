import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.department.findMany({
      where: { companyId: req.company!.id }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch departments' });
  }
});

router.post('/', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.department.create({
      data: {
        companyId: req.company!.id,
        ...req.body
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create department' });
  }
});

export default router;
