import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { uploadFileToStorage } from '../services/storage.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const companyId = req.company!.id;
    const fileExt = req.file.originalname.split('.').pop();
    const filePath = `${companyId}/${uuidv4()}.${fileExt}`;

    const publicUrl = await uploadFileToStorage(
      'hrms-documents',
      filePath,
      req.file.buffer,
      req.file.mimetype
    );

    res.json({ success: true, data: { url: publicUrl } });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to upload file' });
  }
});

export default router;
