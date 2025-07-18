import { Request, Response } from 'express';
import { Rating } from '../models/Rating';
import { Photo } from '../models/Photo';
import { Prompt } from '../models/Prompt';
import { Profile } from '../models/Profile';
import { Test } from '../models/Test';
import { TestItem } from '../models/TestItem';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../utils/db';

export const getFeedbackData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user's profile
    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [
        { model: Photo, as: 'photos' },
        { model: Prompt, as: 'prompts' }
      ]
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get all tests for this user
    const tests = await Test.findAll({
      where: { user_id: userId },
      include: [
        { model: TestItem, as: 'TestItems' },
        { model: Rating, as: 'Ratings' }
      ]
    });

    // Process photo feedback
    const photoFeedback = await Promise.all(
      (profile as any).photos.map(async (photo: any) => {
        const photoRatings = await Rating.findAll({
          where: {
            item_type: 'photo',
            item_id: photo.id
          }
        });

        const keep = photoRatings.filter((r: any) => r.rating_value === 'keep').length;
        const neutral = photoRatings.filter((r: any) => r.rating_value === 'neutral').length;
        const remove = photoRatings.filter((r: any) => r.rating_value === 'delete').length;
        const totalRatings = photoRatings.length;

        return {
          id: photo.id.toString(),
          uri: `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}${photo.url}`,
          ratings: { keep, neutral, remove },
          totalRatings,
          score: keep - remove
        };
      })
    );

    // Process prompt feedback
    const promptFeedback = await Promise.all(
      (profile as any).prompts.map(async (prompt: any) => {
        const promptRatings = await Rating.findAll({
          where: {
            item_type: 'prompt',
            item_id: prompt.id
          }
        });

        const keep = promptRatings.filter((r: any) => r.rating_value === 'keep').length;
        const neutral = promptRatings.filter((r: any) => r.rating_value === 'neutral').length;
        const remove = promptRatings.filter((r: any) => r.rating_value === 'delete').length;
        const totalRatings = promptRatings.length;

        return {
          id: prompt.id.toString(),
          question: prompt.question,
          answer: prompt.answer,
          ratings: { keep, neutral, remove },
          totalRatings,
          score: keep - remove
        };
      })
    );

    // For now, return empty questions array (we'll implement this later)
    const questions: any[] = [];

    // Calculate total ratings across all items
    const totalRatings = photoFeedback.reduce((sum: number, photo: any) => sum + photo.totalRatings, 0) +
                        promptFeedback.reduce((sum: number, prompt: any) => sum + prompt.totalRatings, 0);

    res.json({
      totalRatings,
      photos: photoFeedback,
      prompts: promptFeedback,
      questions
    });

  } catch (error) {
    console.error('Error fetching feedback data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPhotoFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const photoId = req.params.photoId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Verify the photo belongs to the user
    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [{ model: Photo, as: 'photos', where: { id: photoId } }]
    });

    if (!profile || !(profile as any).photos.length) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const photo = (profile as any).photos[0];
    const photoRatings = await Rating.findAll({
      where: {
        item_type: 'photo',
        item_id: photo.id
      },
      include: [{ model: User, as: 'rater', attributes: ['id'] }]
    });

    const keep = photoRatings.filter((r: any) => r.rating_value === 'keep').length;
    const neutral = photoRatings.filter((r: any) => r.rating_value === 'neutral').length;
    const remove = photoRatings.filter((r: any) => r.rating_value === 'delete').length;
    const totalRatings = photoRatings.length;

    res.json({
      id: photo.id.toString(),
      uri: `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}${photo.url}`,
      ratings: { keep, neutral, remove },
      totalRatings,
      score: keep - remove,
      detailedRatings: photoRatings.map((r: any) => ({
        rating: r.rating_value,
        feedback: r.feedback,
        isAnonymous: r.is_anonymous,
        createdAt: r.created_at
      }))
    });

  } catch (error) {
    console.error('Error fetching photo feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPromptFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const promptId = req.params.promptId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Verify the prompt belongs to the user
    const profile = await Profile.findOne({
      where: { user_id: userId },
      include: [{ model: Prompt, as: 'prompts', where: { id: promptId } }]
    });

    if (!profile || !(profile as any).prompts.length) {
      return res.status(404).json({ message: 'Prompt not found' });
    }

    const prompt = (profile as any).prompts[0];
    const promptRatings = await Rating.findAll({
      where: {
        item_type: 'prompt',
        item_id: prompt.id
      },
      include: [{ model: User, as: 'rater', attributes: ['id'] }]
    });

    const keep = promptRatings.filter((r: any) => r.rating_value === 'keep').length;
    const neutral = promptRatings.filter((r: any) => r.rating_value === 'neutral').length;
    const remove = promptRatings.filter((r: any) => r.rating_value === 'delete').length;
    const totalRatings = promptRatings.length;

    res.json({
      id: prompt.id.toString(),
      question: prompt.question,
      answer: prompt.answer,
      ratings: { keep, neutral, remove },
      totalRatings,
      score: keep - remove,
      detailedRatings: promptRatings.map((r: any) => ({
        rating: r.rating_value,
        feedback: r.feedback,
        isAnonymous: r.is_anonymous,
        createdAt: r.created_at
      }))
    });

  } catch (error) {
    console.error('Error fetching prompt feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 