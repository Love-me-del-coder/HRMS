import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// ---- Jobs ----
router.get('/jobs', authorizeRoles('company_admin', 'hr_manager', 'employee'), async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.jobRequisition.findMany({
      where: { companyId: req.company!.id },
      include: { department: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch jobs' });
  }
});

router.get('/jobs/:id', authorizeRoles('company_admin', 'hr_manager', 'employee'), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.jobRequisition.findUnique({
      where: { id: req.params.id },
      include: { department: true, candidates: true }
    });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch job' });
  }
});

router.post('/jobs', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.jobRequisition.create({
      data: {
        companyId: req.company!.id,
        ...req.body
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create job' });
  }
});

router.put('/jobs/:id', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.jobRequisition.findUnique({ where: { id: req.params.id } });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    const updated = await prisma.jobRequisition.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update job' });
  }
});

// ---- Candidates ----
router.get('/candidates', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.candidate.findMany({
      where: { companyId: req.company!.id },
      include: { job: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch candidates' });
  }
});

router.get('/candidates/:id', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: { job: true, interviews: true }
    });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch candidate' });
  }
});

router.post('/candidates', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.candidate.create({
      data: {
        companyId: req.company!.id,
        ...req.body
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create candidate' });
  }
});

router.put('/candidates/:id/stage', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.candidate.findUnique({ where: { id: req.params.id } });
    if (!item || item.companyId !== req.company!.id) return res.status(404).json({ success: false, error: 'Not found' });
    const updated = await prisma.candidate.update({
      where: { id: req.params.id },
      data: { stage: req.body.stage }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update stage' });
  }
});

// ---- Interviews ----
router.get('/interviews', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.interview.findMany({
      where: { companyId: req.company!.id },
      include: { candidate: true, job: true }
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch interviews' });
  }
});

router.post('/interviews', authorizeRoles('company_admin', 'hr_manager'), async (req: AuthRequest, res: Response) => {
  try {
    const newItem = await prisma.interview.create({
      data: {
        companyId: req.company!.id,
        ...req.body
      }
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create interview' });
  }
});

export default router;
