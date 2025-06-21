import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Credits, Profile, Photo, Prompt, Test, TestItem, Rating, CreditTransaction } from '../models';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../utils/auth';

const comparePasswords = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('Creating new user...');
    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      is_active: true
    });

    // Create credits record for new user
    await Credits.create({
      user_id: user.id,
      balance: 0
    });

    console.log('User created successfully:', { id: user.id, email: user.email });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.id, email: user.email });

    // Verify password
    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's credits
    const credits = await Credits.findOne({ where: { user_id: userId } });
    const creditBalance = credits ? credits.balance : 0;

    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      credits: creditBalance
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
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

    console.log(`Deleting account for user ${userId}...`);

    // Delete in the correct order to avoid foreign key constraints
    // 1. Delete ratings (they reference test items)
    await Rating.destroy({ where: { rater_id: userId } });
    console.log('Deleted ratings');

    // 2. Delete test items (they reference tests)
    await TestItem.destroy({ 
      where: { 
        test_id: { 
          [require('sequelize').Op.in]: require('sequelize').literal(
            `(SELECT id FROM tests WHERE user_id = ${userId})`
          )
        }
      }
    });
    console.log('Deleted test items');

    // 3. Delete tests
    await Test.destroy({ where: { user_id: userId } });
    console.log('Deleted tests');

    // 4. Delete prompts (they reference profiles)
    await Prompt.destroy({ 
      where: { 
        profile_id: { 
          [require('sequelize').Op.in]: require('sequelize').literal(
            `(SELECT id FROM profiles WHERE user_id = ${userId})`
          )
        }
      }
    });
    console.log('Deleted prompts');

    // 5. Delete photos (they reference profiles)
    await Photo.destroy({ 
      where: { 
        profile_id: { 
          [require('sequelize').Op.in]: require('sequelize').literal(
            `(SELECT id FROM profiles WHERE user_id = ${userId})`
          )
        }
      }
    });
    console.log('Deleted photos');

    // 6. Delete profile
    await Profile.destroy({ where: { user_id: userId } });
    console.log('Deleted profile');

    // 7. Delete credit transactions
    await CreditTransaction.destroy({ where: { user_id: userId } });
    console.log('Deleted credit transactions');

    // 8. Delete credits
    await Credits.destroy({ where: { user_id: userId } });
    console.log('Deleted credits');

    // 9. Finally delete the user
    await user.destroy();
    console.log('Deleted user');

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}; 