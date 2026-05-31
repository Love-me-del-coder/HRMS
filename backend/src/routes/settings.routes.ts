import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// ---- Company Profile ----
router.get('/company', async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.company!.id } });
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch company' });
  }
});

router.put('/company', authorizeRoles('company_admin'), async (req: AuthRequest, res: Response) => {
  try {
    const updated = await prisma.company.update({
      where: { id: req.company!.id },
      data: req.body
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update company' });
  }
});

// ---- Users ----
router.get('/users', authorizeRoles('company_admin'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({ where: { companyId: req.company!.id } });
    // Remove password field
    const safeUsers = users.map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    res.json({ success: true, data: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

router.post('/users', authorizeRoles('company_admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { password: plainPassword, ...userData } = req.body;

    // In a real system, we'd send an invite email. For now, we hash a provided password or a random one.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword || Math.random().toString(36).slice(-10), salt);

    const newUser = await prisma.user.create({
      data: {
        companyId: req.company!.id,
        ...userData,
        password: hashedPassword,
      }
    });
    const { password, ...safeUser } = newUser;
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

router.put('/users/:id', authorizeRoles('company_admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user || user.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body
    });
    const { password, ...safeUser } = updated;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

export default router;
