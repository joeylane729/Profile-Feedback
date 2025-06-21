import { Router, Request, Response, NextFunction } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { googleAuth } from '../controllers/googleAuthController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';
import { generateToken } from '../utils/auth';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

router.post('/google', googleAuth);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

// Dev login route for local development
if (process.env.NODE_ENV === 'development') {
  router.post('/dev-login', (req: Request, res: Response) => {
    // Hardcoded dev user
    const devUser = { id: 9999, email: 'dev@example.com' };
    const token = generateToken(devUser);
    res.json({
      user: devUser,
      token,
    });
  });
}

export default router; 