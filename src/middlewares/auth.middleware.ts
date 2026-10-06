import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload, AuthRequest } from '../types/index.js';

/**
 * Protect a route: reads the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded payload to req.user.
 *
 * Usage in a route file:
 *   router.get('/protected', authenticate, myController);
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7); // remove "Bearer "

  try {
    const payload = jwt.verify(token, process.env['JWT_SECRET'] ?? 'secret') as JwtPayload;
    (req as AuthRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
