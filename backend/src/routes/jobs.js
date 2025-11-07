// Routes for job-related endpoints

import express from 'express';
import jobController from '../controllers/jobController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view jobs
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Protected routes - require authentication
router.get('/recommended/list', protect, jobController.getRecommendedJobs);
router.get('/:id/match-score', protect, jobController.getJobMatchScore);

// Job actions - require authentication
router.post('/:id/save', protect, jobController.saveJob);
router.post('/:id/apply', protect, jobController.applyToJob);
router.post('/:id/hide', protect, jobController.hideJob);

// User's job lists - require authentication
router.get('/user/saved', protect, jobController.getSavedJobs);
router.get('/user/applied', protect, jobController.getAppliedJobs);

// Admin/scraping routes
router.post('/scrape/trigger', jobController.triggerScraping);

export default router;
