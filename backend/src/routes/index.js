import { Router } from 'express';
import authRoutes from './auth.js';
import profileRoutes from './profile.js';
import resumeRoutes from './resume.js';
import jobSearchRoutes from "./jobSearchRoutes.js";
import jobRoutes from './jobs.js';

const router = Router();


router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/resume', resumeRoutes);
router.use('/jobs/search', jobSearchRoutes); // TheirStack API search
router.use('/jobs', jobRoutes); // Job CRUD and recommendations

export default router;