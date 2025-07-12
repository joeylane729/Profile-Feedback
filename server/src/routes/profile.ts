import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, addPhoto, updatePhotoOrder, deletePhoto, addPrompt, updatePrompt, deletePrompt, getUserProfile, getRandomProfile } from '../controllers/profileController';
import { Profile, Photo, Prompt } from '../models';

const router = Router();

// Get random profile for discovery
router.get('/random', authenticate, getRandomProfile);

// Get user's own profile
router.get('/me', authenticate, getProfile);

// Update user's profile
router.put('/me', authenticate, updateProfile);

// Get specific user profile
router.get('/:userId', authenticate, getUserProfile);

// Photo management
router.post('/photos', authenticate, addPhoto);
router.put('/photos/order', authenticate, updatePhotoOrder);
router.delete('/photos/:photoId', authenticate, deletePhoto);

// Prompt management
router.post('/prompts', authenticate, addPrompt);
router.put('/prompts/:promptId', authenticate, updatePrompt);
router.delete('/prompts/:promptId', authenticate, deletePrompt);

export default router; 