import { Router } from 'express';
import { register, login, getProfile } from "../controllers/authController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

export default router;