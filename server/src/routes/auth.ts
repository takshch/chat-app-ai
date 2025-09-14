import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { userSchema, loginSchema } from '../types/user.ts';
import { userModel } from '../models/User.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { env } from '../config/env.ts';

const router = Router();

// Signup route
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = userSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await userModel.findByEmail(validatedData.email);
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

    // Create user
    const user = await userModel.create({
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    });

    // Generate JWT token
    const jwtSecret = env.JWT_SECRET;
    const jwtExpiresIn = env.JWT_EXPIRES_IN;
    
    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const options: SignOptions = { expiresIn: jwtExpiresIn as StringValue };

    // Return user data (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.message 
      });
      return;
    }
    
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by email
    const user = await userModel.findByEmail(validatedData.email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const jwtSecret = env.JWT_SECRET;
    const jwtExpiresIn = env.JWT_EXPIRES_IN;
    
    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const options: SignOptions = { expiresIn: jwtExpiresIn as StringValue };
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      options
    );

    // Set HTTP-only cookie with environment-based configuration
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none',
      domain: env.COOKIE_DOMAIN,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: 'Login successful'
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ 
        error: 'Validation failed', 
        details: error.message 
      });
      return;
    }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout route
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear the HTTP-only cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none',
      domain: env.COOKIE_DOMAIN,
    });

    res.status(200).json({ 
      message: 'Logout successful' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userModel.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ 
      message: 'Token is valid',
      user: req.user 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as default };
