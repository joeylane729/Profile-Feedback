import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Profile, Photo, Prompt } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ 
      where: { user_id: req.params.userId },
      include: [
        { model: Photo, as: 'Photos' },
        { model: Prompt, as: 'Prompts' }
      ]
    });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// Create or update profile with photos and prompts
router.post('/', authenticate, upload.array('photos', 10), async (req: AuthRequest, res) => {
  try {
    const { bio, prompts } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Parse prompts if they're sent as JSON string
    let parsedPrompts = [];
    if (prompts) {
      try {
        parsedPrompts = typeof prompts === 'string' ? JSON.parse(prompts) : prompts;
      } catch (e) {
        return res.status(400).json({ message: 'Invalid prompts format' });
      }
    }

    // Create or update profile
    const [profile] = await Profile.findOrCreate({
      where: { user_id: userId },
      defaults: { 
        user_id: userId,
        bio: bio || '', 
        status: 'not_tested',
        is_active: true
      }
    });

    // Update bio if provided
    if (bio !== undefined) {
      await profile.update({ bio });
    }

    // Handle photo uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Delete existing photos
      await Photo.destroy({ where: { profile_id: profile.id } });
      
      // Create new photos
      const photoPromises = req.files.map((file, index) => {
        return Photo.create({
          profile_id: profile.id,
          url: `/uploads/${file.filename}`,
          order_index: index
        });
      });
      await Promise.all(photoPromises);
    }

    // Handle prompts
    if (parsedPrompts.length > 0) {
      // Delete existing prompts
      await Prompt.destroy({ where: { profile_id: profile.id } });
      
      // Create new prompts
      const promptPromises = parsedPrompts.map((prompt: any) => {
        return Prompt.create({
          profile_id: profile.id,
          question: prompt.question,
          answer: prompt.answer
        });
      });
      await Promise.all(promptPromises);
    }

    // Fetch the complete profile with photos and prompts
    const completeProfile = await Profile.findOne({
      where: { id: profile.id },
      include: [
        { model: Photo, as: 'Photos' },
        { model: Prompt, as: 'Prompts' }
      ]
    });

    res.json({
      message: 'Profile created successfully',
      profile: completeProfile
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ message: 'Error creating/updating profile', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router; 