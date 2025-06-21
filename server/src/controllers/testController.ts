import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, Profile, Test, TestItem, Rating, CreditTransaction, Photo, Prompt } from '../models';

export const createTest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type } = req.body;
    if (!type || !['full_profile', 'single_photo', 'single_prompt'].includes(type)) {
      return res.status(400).json({ error: 'Invalid test type' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Calculate test cost
    let cost = 0;
    switch (type) {
      case 'full_profile':
        cost = 10;
        break;
      case 'single_photo':
      case 'single_prompt':
        cost = 5;
        break;
    }

    // Check if user has enough credits
    if (user.credits < cost) {
      return res.status(400).json({ error: 'Not enough credits' });
    }

    // Create test
    const test = await Test.create({
      user_id: userId,
      type,
      status: 'pending',
      cost,
      started_at: new Date()
    });

    // Deduct credits
    user.credits -= cost;
    await user.save();

    // Record credit transaction
    await CreditTransaction.create({
      user_id: userId,
      amount: -cost,
      type: 'test',
      description: `Test: ${type}`,
      reference_id: test.id
    });

    // Create test items based on type
    if (type === 'full_profile') {
      // Add all photos
      const photos = await Photo.findAll({ where: { profile_id: profile.id } });
      for (const photo of photos) {
        await TestItem.create({
          test_id: test.id,
          item_type: 'photo',
          item_id: photo.id,
          original_item_id: photo.id
        });
      }

      // Add all prompts
      const prompts = await Prompt.findAll({ where: { profile_id: profile.id } });
      for (const prompt of prompts) {
        await TestItem.create({
          test_id: test.id,
          item_type: 'prompt',
          item_id: prompt.id,
          original_item_id: prompt.id
        });
      }
    } else if (type === 'single_photo') {
      const { photoId } = req.body;
      if (!photoId) {
        return res.status(400).json({ error: 'Photo ID is required' });
      }

      const photo = await Photo.findOne({
        where: { id: photoId, profile_id: profile.id }
      });

      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      await TestItem.create({
        test_id: test.id,
        item_type: 'photo',
        item_id: photo.id,
        original_item_id: photo.id
      });
    } else if (type === 'single_prompt') {
      const { promptId } = req.body;
      if (!promptId) {
        return res.status(400).json({ error: 'Prompt ID is required' });
      }

      const prompt = await Prompt.findOne({
        where: { id: promptId, profile_id: profile.id }
      });

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      await TestItem.create({
        test_id: test.id,
        item_type: 'prompt',
        item_id: prompt.id,
        original_item_id: prompt.id
      });
    }

    // Update profile status
    profile.status = 'testing';
    await profile.save();

    res.status(201).json(test);
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
};

export const getTest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { testId } = req.params;
    if (!testId) {
      return res.status(400).json({ error: 'Test ID is required' });
    }

    const test = await Test.findOne({
      where: { id: testId, user_id: userId },
      include: [
        {
          model: TestItem,
          include: [
            { model: Photo },
            { model: Prompt }
          ]
        }
      ]
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Failed to get test' });
  }
};

export const submitRating = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { testId } = req.params;
    const { itemType, itemId, rating, feedback, isAnonymous } = req.body;

    if (!testId || !itemType || !itemId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['photo', 'prompt', 'bio'].includes(itemType)) {
      return res.status(400).json({ error: 'Invalid item type' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const test = await Test.findOne({
      where: { id: testId },
      include: [{ model: TestItem }]
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // @ts-ignore
    const testItems = (test.TestItems || test.testItems || test.items || []);
    const testItem = testItems.find((item: any) => item.item_type === itemType && item.item_id === itemId);

    if (!testItem) {
      return res.status(404).json({ error: 'Item not found in test' });
    }

    // Create rating
    const ratingRecord = await Rating.create({
      test_id: Number(testId),
      rater_id: userId,
      item_type: itemType,
      item_id: itemId,
      rating,
      feedback,
      is_anonymous: isAnonymous || false
    });

    res.status(201).json(ratingRecord);
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

export const completeTest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { testId } = req.params;
    if (!testId) {
      return res.status(400).json({ error: 'Test ID is required' });
    }

    const test = await Test.findOne({
      where: { id: testId, user_id: userId }
    });

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.status !== 'in_progress') {
      return res.status(400).json({ error: 'Test is not in progress' });
    }

    // Update test status
    test.status = 'complete';
    test.completed_at = new Date();
    await test.save();

    // Update profile status
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (profile) {
      profile.status = 'complete';
      await profile.save();
    }

    res.json(test);
  } catch (error) {
    console.error('Complete test error:', error);
    res.status(500).json({ error: 'Failed to complete test' });
  }
}; 