import { Router } from 'express';
import authRoutes from './auth.js';
import profileRoutes from './profile.js';
import resumeRoutes from './resume.js';
import jobSearchRoutes from "./jobSearchRoutes.js"

const router = Router();


router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);  
router.use('/resume', resumeRoutes);
router.use('/jobs', jobSearchRoutes);

export default router;