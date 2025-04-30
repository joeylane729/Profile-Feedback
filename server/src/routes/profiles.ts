import { Router } from 'express';

const router = Router();

// Mock profile data for testing
const mockProfiles = [
  {
    id: '1',
    userId: '1',
    bio: "Adventure seeker and coffee enthusiast. Looking for someone to share life's little moments with.",
    prompts: [
      { id: '1', question: "I'm looking for", answer: "Someone who can make me laugh and isn't afraid to be themselves." },
      { id: '2', question: "My ideal first date", answer: "Coffee and a walk in the park." },
      { id: '3', question: "My perfect weekend", answer: "Starting with a morning hike, followed by brunch." },
    ],
    photos: [
      { id: '1', url: 'https://example.com/photo1.jpg' },
      { id: '2', url: 'https://example.com/photo2.jpg' },
    ]
  }
];

// Get all profiles
router.get('/', (req, res) => {
  res.json(mockProfiles);
});

// Get a specific profile
router.get('/:id', (req, res) => {
  const profile = mockProfiles.find(p => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json(profile);
});

// Create a new profile
router.post('/', (req, res) => {
  // TODO: Implement actual profile creation
  res.json({ 
    success: true, 
    profile: { ...req.body, id: 'new-id' } 
  });
});

// Update a profile
router.put('/:id', (req, res) => {
  // TODO: Implement actual profile update
  res.json({ 
    success: true, 
    profile: { ...req.body, id: req.params.id } 
  });
});

export const profileRoutes = router; 