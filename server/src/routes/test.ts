import express from 'express';
import { createTest, getTest, submitRating, completeTest, createTestWithReplacement } from '../controllers/testController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'test-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create a new test
router.post('/', authenticate, createTest);

// Create a new test with replacement item
router.post('/with-replacement', authenticate, upload.single('replacementPhoto'), createTestWithReplacement);

// Get test details
router.get('/:testId', authenticate, getTest);

// Submit a rating for a test item
router.post('/:testId/ratings', authenticate, submitRating);

// Complete a test
router.put('/:testId/complete', authenticate, completeTest);

export default router; 