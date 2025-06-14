import express from 'express';
import { Test, TestItem, Rating } from '../models';

const router = express.Router();

// Get all tests for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const tests = await Test.findAll({ where: { user_id: req.params.userId } });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tests', error });
  }
});

// Create a new test
router.post('/', async (req, res) => {
  try {
    const { user_id, type, cost } = req.body;
    const test = await Test.create({
      user_id,
      type,
      cost,
      status: 'pending'
    });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Error creating test', error });
  }
});

// Get test details including items and ratings
router.get('/:testId', async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.testId, {
      include: [
        { model: TestItem },
        { model: Rating }
      ]
    });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test details', error });
  }
});

export default router; 