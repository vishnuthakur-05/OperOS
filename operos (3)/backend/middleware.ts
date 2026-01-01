// NOTE: This file is for backend Node.js usage.
// It assumes usage of 'jsonwebtoken' and standard Express types.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'EMPLOYEE' | 'MANAGER' | 'HR';
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

/**
 * Middleware to authenticate the user via JWT.
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Use type casting to access headers if standard Request type definitions are conflicting
  const authHeader = (req as any).headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware to authorize based on User Role.
 * Usage: router.get('/admin', verifyRole(['HR']), adminController);
 */
export const verifyRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Requires one of: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Example Usage in an Express Route File:
/*
import express from 'express';
import { verifyRole, authenticateToken } from './middleware';

const router = express.Router();

router.get('/hr-dashboard', 
  authenticateToken, 
  verifyRole(['HR']), 
  (req, res) => {
    res.json({ message: "Welcome to HR Dashboard" });
  }
);
*/