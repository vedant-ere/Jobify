import { Router } from 'express';
import { handleJobSearch } from '../controllers/jobSearchController.js';
const router = Router();

router.post('/search', handleJobSearch);

export default router;