import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models';
import { generateToken } from '../utils/auth';
import crypto from 'crypto';

export const googleAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { googleId, email, firstName, lastName, profilePicture } = req.body;

    // Check if user already exists with this Google ID
    const existingUser = await User.findOne({ where: { google_id: googleId } });
    if (existingUser) {
      const token = generateToken(existingUser);
      return res.json({
        user: {
          id: existingUser.id,
          email: existingUser.email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          credits: existingUser.credits
        },
        token,
      });
    }

    // Check if user exists with this email
    const emailUser = await User.findOne({ where: { email } });
    if (emailUser) {
      // Update existing user with Google ID
      emailUser.google_id = googleId;
      await emailUser.save();
      const token = generateToken(emailUser);
      return res.json({
        user: {
          id: emailUser.id,
          email: emailUser.email,
          first_name: emailUser.first_name,
          last_name: emailUser.last_name,
          credits: emailUser.credits
        },
        token,
      });
    }

    // Generate a random password for Google-authenticated users
    const randomPassword = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = await User.create({
      email,
      password: randomPassword,
      google_id: googleId,
      first_name: firstName,
      last_name: lastName,
      credits: 0,
      is_active: true
    });

    const token = generateToken(user);
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
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
}; 