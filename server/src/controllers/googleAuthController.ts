import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import pool from '../utils/db';
import { generateToken } from '../utils/auth';

export const handleGoogleAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { googleId, email, name, profilePicture } = req.body;

    // Check if user already exists with this Google ID
    const existingUser = await pool.query(
      'SELECT id, email, name FROM users WHERE google_id = $1',
      [googleId]
    );

    if (existingUser.rows.length > 0) {
      // User exists, generate token and return
      const user = existingUser.rows[0];
      const token = generateToken(user);
      
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    }

    // Check if user exists with this email but different auth method
    const emailUser = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    if (emailUser.rows.length > 0) {
      // Update existing user with Google ID
      const result = await pool.query(
        `UPDATE users 
         SET google_id = $1, profile_picture = $2
         WHERE email = $3
         RETURNING id, email, name`,
        [googleId, profilePicture, email]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    }

    // Create new user
    const result = await pool.query(
      `INSERT INTO users (email, name, google_id, profile_picture)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name`,
      [email, name, googleId, profilePicture]
    );

    const user = result.rows[0];
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
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
}; 