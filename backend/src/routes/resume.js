import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js'; // Move upload config here
// import { upload } from '../controllers/resumeController.js';
import { uploadResume } from '../controllers/resumeController.js';

const router = Router();

router.post('/upload', authMiddleware, upload.single('resume'), uploadResume);

export default router;