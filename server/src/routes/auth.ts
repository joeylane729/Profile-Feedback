import { Router, Request, Response, NextFunction } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import { handleGoogleAuth } from '../controllers/googleAuthController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);

// Add detailed logging for login route
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  console.log('\n=== Login Route Hit ===');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  console.log('Request IP:', req.ip);
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('========================\n');
  
  // Run validation middleware
  validateLogin[0](req, res, (err?: any) => {
    if (err) {
      console.log('Validation error:', err);
      return next(err);
    }
    console.log('Validation passed, proceeding to login controller');
    login(req, res);
  });
});

router.post('/google', handleGoogleAuth);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router; 