import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, Profile, Photo, Prompt, Credits } from '../models';
import path from 'path';
import fs from 'fs';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [
        { model: Photo, order: [['order_index', 'ASC']] },
        { model: Prompt }
      ]
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bio } = req.body;

    const [profile] = await Profile.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        bio: bio || '',
        status: 'not_tested',
        is_active: true
      }
    });

    if (bio !== undefined) {
      profile.bio = bio;
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const addPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Photo URL is required' });
    }

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get the highest order_index
    const lastPhoto = await Photo.findOne({
      where: { profile_id: profile.id },
      order: [['order_index', 'DESC']]
    });

    const orderIndex = lastPhoto ? lastPhoto.order_index + 1 : 0;

    const photo = await Photo.create({
      profile_id: profile.id,
      url,
      order_index: orderIndex
    });

    res.status(201).json(photo);
  } catch (error) {
    console.error('Add photo error:', error);
    res.status(500).json({ error: 'Failed to add photo' });
  }
};

export const updatePhotoOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { photoId, newOrder } = req.body;
    if (typeof photoId !== 'number' || typeof newOrder !== 'number') {
      return res.status(400).json({ error: 'Invalid photo ID or order' });
    }

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const photo = await Photo.findOne({
      where: { id: photoId, profile_id: profile.id }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    photo.order_index = newOrder;
    await photo.save();

    res.json(photo);
  } catch (error) {
    console.error('Update photo order error:', error);
    res.status(500).json({ error: 'Failed to update photo order' });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { photoId } = req.params;
    if (!photoId) {
      return res.status(400).json({ error: 'Photo ID is required' });
    }

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const photo = await Photo.findOne({
      where: { id: photoId, profile_id: profile.id }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete the file from filesystem if it exists
    if (photo.url) {
      const filePath = path.join(__dirname, '../../', photo.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await photo.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};

export const addPrompt = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const prompt = await Prompt.create({
      profile_id: profile.id,
      question,
      answer
    });

    res.status(201).json(prompt);
  } catch (error) {
    console.error('Add prompt error:', error);
    res.status(500).json({ error: 'Failed to add prompt' });
  }
};

export const updatePrompt = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { promptId } = req.params;
    const { question, answer } = req.body;

    if (!promptId) {
      return res.status(400).json({ error: 'Prompt ID is required' });
    }

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const prompt = await Prompt.findOne({
      where: { id: promptId, profile_id: profile.id }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    if (question !== undefined) prompt.question = question;
    if (answer !== undefined) prompt.answer = answer;
    await prompt.save();

    res.json(prompt);
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
};

export const deletePrompt = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { promptId } = req.params;
    if (!promptId) {
      return res.status(400).json({ error: 'Prompt ID is required' });
    }

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const prompt = await Prompt.findOne({
      where: { id: promptId, profile_id: profile.id }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    await prompt.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's credits
    const credits = await Credits.findOne({ where: { user_id: userId } });
    const creditBalance = credits ? credits.balance : 0;

    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Photo,
          as: 'photos',
          order: [['created_at', 'ASC']]
        },
        {
          model: Prompt,
          as: 'prompts',
          order: [['created_at', 'ASC']]
        }
      ]
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        credits: creditBalance
      },
      profile: profile || null
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
}; 