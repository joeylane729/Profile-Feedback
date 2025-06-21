import express from 'express';
import { CreditTransaction, User, Credits } from '../models';
import sequelize from '../utils/db';
import { Transaction } from 'sequelize';

const router = express.Router();

// Get credit transactions for a user
router.get('/transactions/:userId', async (req, res) => {
  try {
    const transactions = await CreditTransaction.findAll({
      where: { user_id: req.params.userId }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching credit transactions', error });
  }
});

// Add credits to user account
router.post('/add', async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    
    // Start a transaction
    const result = await sequelize.transaction(async (t: Transaction) => {
      // Create credit transaction
      const transaction = await CreditTransaction.create({
        user_id,
        amount,
        type: 'purchase',
        description: 'Credit purchase'
      }, { transaction: t });

      // Get or create credits record and update balance
      const [credits] = await Credits.findOrCreate({
        where: { user_id },
        defaults: { user_id, balance: 0 },
        transaction: t
      });

      credits.balance += amount;
      await credits.save({ transaction: t });

      return { transaction, newBalance: credits.balance };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding credits', error });
  }
});

export default router; 