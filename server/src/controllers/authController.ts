import { Response } from 'express';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models';
import { Profile } from '../models';
import { Photo } from '../models';
import { Prompt } from '../models';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== REGISTER START ===');
    console.log('Request body:', req.body);
    const { email, password, first_name, last_name } = req.body;

    console.log('Extracted fields:', { email, first_name, last_name, password: password ? '[HIDDEN]' : 'undefined' });

    // Check if user already exists
    console.log('Checking if user exists...');
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.log('User does not exist, proceeding with registration');

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    // Create new user
    console.log('Creating new user...');
    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      credits: 0, // Start with 0 credits
      is_active: true
    });
    console.log('User created successfully:', { id: user.id, email: user.email });

    // Generate token
    console.log('Generating token...');
    const token = generateToken(user);
    console.log('Token generated successfully');

    console.log('=== REGISTER SUCCESS ===');
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        credits: user.credits
      },
      token,
    });
  } catch (error) {
    console.error('=== REGISTER ERROR ===');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== LOGIN START ===');
    console.log('Request body:', req.body);
    const { email, password } = req.body;

    console.log('Extracted fields:', { email, password: password ? '[HIDDEN]' : 'undefined' });

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    console.log('Looking for user with email:', email);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('User found:', { id: user.id, email: user.email });

    // Check password
    console.log('Checking password...');
    const isValidPassword = await comparePasswords(password, user.password);
    console.log('Password check result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Password is valid');

    // Generate token
    console.log('Generating token...');
    const token = generateToken(user);
    console.log('Token generated successfully');

    console.log('=== LOGIN SUCCESS ===');
    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        credits: user.credits
      },
      token,
    });
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const user = await User.findByPk(req.user.userId, {
      include: [{
        model: Profile,
        include: [
          { model: Photo },
          { model: Prompt }
        ]
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      credits: user.credits,
      profile: (user as any).Profile || (user as any).profile
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const userId = req.user.userId;
    console.log('Deleting account for user ID:', userId);

    // Find the user with all associated data
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Profile,
          include: [
            { model: Photo },
            { model: Prompt }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete uploaded photos from filesystem
    if ((user as any).Profile?.Photos) {
      const fs = require('fs');
      const path = require('path');
      
      for (const photo of (user as any).Profile.Photos) {
        try {
          const photoPath = path.join(__dirname, '../../uploads', path.basename(photo.url));
          if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath);
            console.log('Deleted photo file:', photoPath);
          }
        } catch (error) {
          console.error('Error deleting photo file:', error);
        }
      }
    }

    // Delete the user (this will cascade delete all associated data due to foreign key constraints)
    await user.destroy();
    
    console.log('Successfully deleted user and all associated data for user ID:', userId);

    res.json({ 
      message: 'Account and all associated data deleted successfully',
      deletedUserId: userId
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}; 