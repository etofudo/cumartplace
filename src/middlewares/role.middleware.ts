import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';

/**
 * Restrict a route to specific roles.
 * Must be used AFTER the authenticate middleware.
 *
 * Example — vendor only:
 *   router.post('/stores', authenticate, requireRole('vendor'), createStore);
 *
 * Example — vendor OR admin:
 *   router.put('/orders/:id/status', authenticate, requireRole('vendor', 'admin'), updateStatus);
 */
export function requireRole(...roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction): void {
    const user = (req as AuthRequest).user;

    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}` });
      return;
    }

    next();
  };
}
