import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// ---- Goals ----
router.get('/goals', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.goal.findMany({
      where: { companyId: req.company!.id },
      include: { employee: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch goals' });
  }
});

router.post('/goals', async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.goal.create({
      data: {
        companyId: req.company!.id,
        ...req.body
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create goal' });
  }
});

router.put('/goals/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.goal.findUnique({ where: { id: req.params.id } });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    const updated = await prisma.goal.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update goal' });
  }
});

// ---- KPIs ----
router.get('/kpis', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.kPI.findMany({
      where: { companyId: req.company!.id },
      include: { employee: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch KPIs' });
  }
});

// ---- Reviews ----
router.get('/reviews', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.performanceReview.findMany({
      where: { companyId: req.company!.id },
      include: { employee: true, reviewer: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
});

router.post('/reviews', async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.performanceReview.create({
      data: {
        companyId: req.company!.id,
        ...req.body
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
});

export default router;
