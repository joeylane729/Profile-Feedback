import { Router } from 'express';
import { getFeedbackData, getPhotoFeedback, getPromptFeedback } from '../controllers/feedbackController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get all feedback data for the authenticated user
router.get('/', authenticate, getFeedbackData);

// Get detailed feedback for a specific photo
router.get('/photos/:photoId', authenticate, getPhotoFeedback);

// Get detailed feedback for a specific prompt
router.get('/prompts/:promptId', authenticate, getPromptFeedback);

export default router; 