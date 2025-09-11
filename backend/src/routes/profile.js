import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { updateSkills, deleteSkills, updateProfile} from '../controllers/profileController.js';

const router = Router();

// All routes here are protected and prefixed with /profile
router.post('/skills', authMiddleware, updateSkills);
router.delete('/skills/:skillId', authMiddleware, deleteSkills);
router.put('/update', authMiddleware, updateProfile)

export default router;