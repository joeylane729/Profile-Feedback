import express from 'express';
import { Profile } from '../models';

const router = express.Router();

// Get profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.params.userId } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// Create or update profile
router.post('/', async (req, res) => {
  try {
    const { user_id, bio, status } = req.body;
    const [profile] = await Profile.findOrCreate({
      where: { user_id },
      defaults: { bio, status: status || 'not_tested' }
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error creating/updating profile', error });
  }
});

export default router; 