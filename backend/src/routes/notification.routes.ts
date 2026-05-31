import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.notification.findMany({
      where: { 
        companyId: req.company!.id,
        userId: req.user!.id
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

router.put('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark as read' });
  }
});

router.put('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        companyId: req.company!.id,
        userId: req.user!.id
      },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
});

router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await prisma.notification.count({
      where: { 
        companyId: req.company!.id,
        userId: req.user!.id,
        isRead: false
      }
    });
    res.json({ success: true, data: { count: unreadCount } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch unread count' });
  }
});

export default router;
