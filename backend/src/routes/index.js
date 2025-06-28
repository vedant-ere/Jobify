import { Router } from 'express';
import authRoutes from './auth.js';
import profileRoutes from './profile.js';
import resumeRoutes from './resume.js';

const router = Router();

// Combine all routes with prefixes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);  
router.use('/resume', resumeRoutes);

export default router;