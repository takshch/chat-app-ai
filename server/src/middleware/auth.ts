import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/User.ts';
import type { JWTPayload } from '../types/user.ts';
import { env } from '../config/env.ts';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first, then from Authorization header as fallback
    let token = req.cookies?.authToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Verify user still exists
    const user = await userModel.findByIdForAuth(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ error: 'Invalid token' });
      return;
    }
    
    res.status(500).json({ error: 'Token verification failed' });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first, then from Authorization header as fallback
    let token = req.cookies?.authToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
      next();
      return;
    }

    const jwtSecret = env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    const user = await userModel.findByIdForAuth(decoded.userId);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
      };
    }

    next();
  } catch {
    // For optional auth, we just continue without setting req.user
    next();
  }
};
