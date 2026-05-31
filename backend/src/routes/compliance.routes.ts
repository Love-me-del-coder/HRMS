import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// ---- Compliance Items ----
router.get('/items', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.complianceItem.findMany({
      where: { companyId: req.company!.id }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch compliance items' });
  }
});

router.post('/items', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.complianceItem.create({
      data: {
        companyId: req.company!.id,
        ...req.body
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create compliance item' });
  }
});

router.put('/items/:id', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.complianceItem.findUnique({ where: { id: req.params.id } });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    const updated = await prisma.complianceItem.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update compliance item' });
  }
});

// ---- Dashboard ----
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.complianceItem.findMany({
      where: { companyId: req.company!.id }
    });
    
    const total = items.length || 1;
    const compliant = items.filter(i => i.status === 'compliant').length;
    const score = Math.round((compliant / total) * 100);
    
    res.json({ success: true, data: { score, compliant, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
});

// ---- Expiring ----
router.get('/expiring', async (req: AuthRequest, res: Response) => {
  try {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    
    const expiring = await prisma.complianceItem.findMany({
      where: { 
        companyId: req.company!.id,
        expiryDate: {
          lte: nextMonth,
          gt: new Date()
        }
      }
    });
    res.json({ success: true, data: expiring });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch expiring items' });
  }
});

// ---- Audit Log ----
router.get('/audit-log', authorizeRoles('company_admin'), async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.auditLogEntry.findMany({
      where: { companyId: req.company!.id }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch audit log' });
  }
});

export default router;
