import { Router } from 'express';

const router = Router();

// Mock ratings data for testing
const mockRatings = [
  {
    id: '1',
    profileId: '1',
    userId: '2',
    bioRating: 8,
    promptRatings: {
      '1': 7,
      '2': 9,
      '3': 8
    },
    photoRatings: {
      '1': 9,
      '2': 7
    }
  }
];

// Get ratings for a profile
router.get('/profile/:profileId', (req, res) => {
  const ratings = mockRatings.filter(r => r.profileId === req.params.profileId);
  res.json(ratings);
});

// Submit a rating
router.post('/', (req, res) => {
  // TODO: Implement actual rating submission
  const newRating = {
    id: 'new-id',
    ...req.body,
    timestamp: new Date().toISOString()
  };
  res.json({ 
    success: true, 
    rating: newRating 
  });
});

// Get user's ratings
router.get('/user/:userId', (req, res) => {
  const ratings = mockRatings.filter(r => r.userId === req.params.userId);
  res.json(ratings);
});

export const ratingRoutes = router; 