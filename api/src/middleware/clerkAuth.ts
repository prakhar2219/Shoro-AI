import { Request, Response, NextFunction } from 'express';
import { clerkClient, requireAuth } from '@clerk/express';
import User from '../models/user.model';
import AppError from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      auth?: any;
    }
  }
}

/**
 * Clerk authentication middleware
 * Validates Clerk session tokens and attaches user to request
 */
export const clerkProtect = [
  requireAuth(),
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      return next(
        new AppError('No has iniciado sesión. Por favor inicia sesión.', 401)
      );
    }

    // Find or create user in our database using Clerk ID
    let user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      // User doesn't exist with this clerkId, fetch from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      
      // Check if user exists with this email (from old auth system)
      user = await User.findOne({ email });
      
      if (user) {
        // User exists but doesn't have clerkId - update existing user
        user.clerkId = clerkUserId;
        user.name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || user.name;
        user.profileImage = clerkUser.imageUrl || user.profileImage;
        
        // Update role if provided in Clerk metadata
        const clerkRole = clerkUser.publicMetadata?.role as string;
        if (clerkRole && ['super_admin', 'admin', 'editor', 'user'].includes(clerkRole)) {
          user.role = clerkRole as 'super_admin' | 'admin' | 'editor' | 'user';
        }
        
        await user.save();
      } else {
        // Create new user
        const clerkRole = clerkUser.publicMetadata?.role as string;
        const validRole = clerkRole && ['super_admin', 'admin', 'editor', 'user'].includes(clerkRole) 
          ? (clerkRole as 'super_admin' | 'admin' | 'editor' | 'user')
          : 'user';
        
        user = await User.create({
          clerkId: clerkUserId,
          email,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          profileImage: clerkUser.imageUrl,
          role: validRole,
          active: true,
        });
      }
    }

    if (!user.active) {
      return next(
        new AppError('Tu cuenta ha sido desactivada.', 401)
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Attach user to request
    req.user = user;
    next();
  }),
];

/**
 * Role-based access control
 */
export const clerkRestrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('No tienes permiso para realizar esta acción', 403)
      );
    }
    next();
  };
};

/**
 * Optional Clerk auth - doesn't require authentication but adds user if present
 */
export const clerkOptionalAuth = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const clerkUserId = req.auth?.userId;

    if (clerkUserId) {
      const user = await User.findOne({ clerkId: clerkUserId });
      if (user && user.active) {
        req.user = user;
      }
    }

    next();
  }
);
