import { Response } from 'express';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';
import { AuthRequest } from '../middleware/auth';
import pool from '../utils/db';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const result = await pool.query(
      `INSERT INTO users (email, password, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Login attempt:', { 
      email: req.body.email,
      body: req.body,
      headers: req.headers
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    console.log('Querying database for user...');
    const result = await pool.query(
      'SELECT id, email, name, password FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('User found:', { id: user.id, email: user.email });

    // Check password
    console.log('Checking password...');
    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Password valid');

    // Generate token
    console.log('Generating token...');
    const token = generateToken(user);
    console.log('Token generated');

    console.log('Sending response...');
    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
    console.log('Response payload:', response);
    
    res.json(response);
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Getting current user for ID:', req.user?.userId);
    
    if (!req.user?.userId) {
      console.error('No user ID in request');
      return res.status(401).json({ error: 'User ID not found' });
    }

    const result = await pool.query(
      'SELECT id, email, name, profile_picture, bio FROM users WHERE id = $1',
      [req.user.userId]
    );

    const user = result.rows[0];
    if (!user) {
      console.error('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Found user:', user);
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}; 