import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { handleGoogleAuth } from '../controllers/googleAuthController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google', handleGoogleAuth);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router; 