import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { User, Company } from '@prisma/client';
import prisma from '../lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'hrms-saas-secret-key-2024-very-secure');

export interface AuthRequest extends Request {
  user?: User;
  company?: Company;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      const userId = payload.userId as string;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true }
      });
      
      if (!user || !user.isActive) {
        res.status(401).json({ success: false, error: 'Invalid or inactive user' });
        return;
      }

      if (user.company.subscriptionStatus !== 'active') {
        res.status(401).json({ success: false, error: 'Invalid or inactive company' });
        return;
      }

      const { company, ...userWithoutCompany } = user;
      req.user = userWithoutCompany as User;
      req.company = company as Company;
      next();
    } catch (err) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to strictly authorize based on the user's role.
 * e.g., authorizeRoles('company_admin', 'hr_manager')
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ success: false, error: 'Forbidden: Missing role' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Validates if the user is querying their own resource, or if they are an admin/HR.
 * This is used inside controllers.
 */
export const hasSelfOrAdminAccess = (req: AuthRequest, resourceEmployeeId: string | null | undefined): boolean => {
  if (!req.user) return false;
  
  // If user is Admin or HR, they have access to everything
  if (['company_admin', 'hr_manager'].includes(req.user.role)) {
    return true;
  }
  
  // If standard employee, their employeeId must match the resource's employeeId
  if (req.user.employeeId && resourceEmployeeId === req.user.employeeId) {
    return true;
  }
  
  return false;
};
