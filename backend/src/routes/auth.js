// file Name auth.js
import {Router} from 'express';
import {register, login, getProfile} from "../controllers/authController.js"
import authMiddleware from '../middlewares/authMiddleware.js';
import { updateSkills } from '../controllers/profileController.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
// router.put('/profile', authMiddleware, )
router.post('/skills',authMiddleware, updateSkills)
router.delete('/skills/:skillId', authMiddleware, )

export default router;