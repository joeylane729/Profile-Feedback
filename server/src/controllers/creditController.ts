import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User, CreditTransaction, Credits } from '../models';

export const getCredits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credits = await Credits.findOne({ where: { user_id: userId } });
    if (!credits) {
      return res.status(404).json({ error: 'Credits not found' });
    }

    res.json({ credits: credits.balance });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ error: 'Failed to get credits' });
  }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await CreditTransaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Failed to get transaction history' });
  }
};

export const addCredits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get or create credits record
    const [credits] = await Credits.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId, balance: 0 }
    });

    // Add credits to balance
    credits.balance += amount;
    await credits.save();

    // Record transaction
    const transaction = await CreditTransaction.create({
      user_id: userId,
      amount,
      type: 'purchase',
      description: description || 'Credit purchase'
    });

    res.status(201).json({
      credits: credits.balance,
      transaction
    });
  } catch (error) {
    console.error('Add credits error:', error);
    res.status(500).json({ error: 'Failed to add credits' });
  }
}; 