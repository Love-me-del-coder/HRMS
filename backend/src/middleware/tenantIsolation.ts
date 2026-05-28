import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireTenant = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.company || !req.company.id) {
    res.status(403).json({ success: false, error: 'Tenant context is missing or invalid' });
    return;
  }
  next();
};
