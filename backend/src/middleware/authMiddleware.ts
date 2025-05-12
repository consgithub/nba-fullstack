import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types/shots';
import { AuthenticatedRequest } from '../types/express';
import config from '../config';

/**
 * Middleware to validate JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Authentication token required' });
      return;
    }
    
    jwt.verify(token, config.jwt.secret as jwt.Secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }
      
      // Add user data to request object
      (req as AuthenticatedRequest).user = decoded as AuthPayload;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to generate JWT token
 */
export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, config.jwt.secret as jwt.Secret, {
    expiresIn: config.jwt.expiresIn
  });
};