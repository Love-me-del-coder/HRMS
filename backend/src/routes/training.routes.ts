import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest, authorizeRoles } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ---- Courses ----
router.get('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.course.findMany({
      where: { companyId: req.company!.id }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
});

router.get('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.course.findUnique({ where: { id: req.params.id as string } });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch course' });
  }
});

router.post('/courses', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.course.create({
      data: {
        companyId: req.company!.id,
        ...req.body
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create course' });
  }
});

// ---- Assignments ----
router.get('/assignments', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.trainingAssignment.findMany({
      where: { companyId: req.company!.id },
      include: { employee: true, course: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

router.post('/assignments/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.trainingAssignment.findUnique({ where: { id: req.params.id as string } });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    
    const updated = await prisma.trainingAssignment.update({
      where: { id: req.params.id as string },
      data: {
        status: 'completed',
        score: req.body.score,
        completedDate: new Date()
      }
    });
    
    // Create certificate
    const certId = uuidv4();
    await prisma.certificate.create({
      data: {
        id: certId,
        companyId: req.company!.id,
        employeeId: item.employeeId,
        courseId: item.courseId,
        issueDate: new Date(),
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        certificateNo: certId.split('-')[0].toUpperCase(),
      }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to complete assignment' });
  }
});

// ---- Certificates ----
router.get('/certificates', async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.certificate.findMany({
      where: { companyId: req.company!.id },
      include: { employee: true, course: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch certificates' });
  }
});

export default router;
