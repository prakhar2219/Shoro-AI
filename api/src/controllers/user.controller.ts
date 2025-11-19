import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import User from '../models/user.model';
import AppError from '../utils/appError';
import * as userService from '../services/user.service';
import logger from '../config/logger';

// Current user operations
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  if (req.body.password || req.body.role) {
    throw new AppError(
      'Esta ruta no es para actualizaciones de contraseña o rol.',
      400
    );
  }

  const allowedFields = ['name', 'email', 'phoneNumber', 'department', 'profileImage'];
  const filteredBody: any = {};
  
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Admin operations - Super Admin only
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, role, active, search } = req.query;

  logger.debug('getAllUsers called with params:', { page, limit, role, active, search });
  logger.debug('Requesting user:', req.user?.email, 'Role:', req.user?.role);

  const result = await userService.getAllUsers({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    role: role as string,
    active: active === 'true' ? true : active === 'false' ? false : undefined,
    search: search as string,
  });

  logger.debug('Query result:', { total: result.total, usersCount: result.users.length });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.deleteUser(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const hardDeleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.hardDeleteUser(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.body;

  if (!role) {
    throw new AppError('El rol es requerido', 400);
  }

  const user = await userService.updateUserRole(req.params.id, role);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await userService.getUserStats();

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

// Clerk Webhook Sync Endpoints
export const clerkSync = catchAsync(async (req: Request, res: Response) => {
  const { clerkId, email, name, profileImage, role } = req.body;

  if (!clerkId || !email || !name) {
    throw new AppError('Missing required fields: clerkId, email, name', 400);
  }

  // Check if user already exists with this clerkId
  let user = await User.findOne({ clerkId });

  if (!user) {
    // Check if user exists with this email (from old auth system)
    user = await User.findOne({ email });

    if (user) {
      // User exists but doesn't have clerkId - update existing user
      user.clerkId = clerkId;
      user.name = name;
      if (profileImage) user.profileImage = profileImage;
      if (role && ['super_admin', 'admin', 'editor', 'user'].includes(role)) {
        user.role = role;
      }
      await user.save();
    } else {
      // Create new user from Clerk
      const validRole = role && ['super_admin', 'admin', 'editor', 'user'].includes(role) 
        ? role 
        : 'user';

      user = await User.create({
        clerkId,
        email,
        name,
        profileImage,
        role: validRole,
        active: true,
      });
    }
  } else {
    // User exists - update details
    user.name = name;
    user.email = email;
    if (profileImage) user.profileImage = profileImage;
    if (role && ['super_admin', 'admin', 'editor', 'user'].includes(role)) {
      user.role = role;
    }
    await user.save();
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const clerkDelete = catchAsync(async (req: Request, res: Response) => {
  const { clerkId } = req.params;

  if (!clerkId) {
    throw new AppError('ClerkId is required', 400);
  }

  // Soft delete - deactivate user instead of removing from database
  const user = await User.findOneAndUpdate(
    { clerkId },
    { active: false },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found with this clerkId', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'User deactivated successfully',
    data: { user },
  });
});

// Get all users from Clerk (Super Admin only)
export const getClerkUsers = catchAsync(async (req: Request, res: Response) => {
  const { clerkClient } = await import('@clerk/express');

  if (!process.env.CLERK_SECRET_KEY) {
    throw new AppError('Clerk secret key not configured in API .env file', 500);
  }
  
  const { page = 1, limit = 10, search } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Fetch users from Clerk
  const clerkUsers = await clerkClient.users.getUserList({
    limit: Number(limit),
    offset: offset,
    ...(search && { query: search as string }),
  });

  // Get MongoDB users to merge role data
  const mongoUsers = await User.find().select('clerkId role');
  const roleMap = new Map(mongoUsers.map(u => [u.clerkId, u.role]));

  // Format users with role from publicMetadata or MongoDB
  const formattedUsers = clerkUsers.data.map((clerkUser) => ({
    _id: clerkUser.id,
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown',
    role: (clerkUser.publicMetadata?.role as string) || roleMap.get(clerkUser.id) || 'user',
    active: !clerkUser.banned,
    profileImage: clerkUser.imageUrl,
    phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber,
    createdAt: new Date(clerkUser.createdAt),
    updatedAt: new Date(clerkUser.updatedAt),
    lastLogin: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : undefined,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      users: formattedUsers,
      total: clerkUsers.totalCount,
      page: Number(page),
      totalPages: Math.ceil(clerkUsers.totalCount / Number(limit)),
    },
  });
});

// Update user role in Clerk (Super Admin only)
export const updateClerkUserRole = catchAsync(async (req: Request, res: Response) => {
  const { clerkClient } = await import('@clerk/express');

  if (!process.env.CLERK_SECRET_KEY) {
    throw new AppError('Clerk secret key not configured in API .env file', 500);
  }

  const { clerkId } = req.params;
  const { role } = req.body;

  if (!role || !['super_admin', 'admin', 'editor', 'user'].includes(role)) {
    throw new AppError('Invalid role. Must be: super_admin, admin, editor, or user', 400);
  }

  // Update role in Clerk's publicMetadata
  const clerkUser = await clerkClient.users.updateUser(clerkId, {
    publicMetadata: {
      role: role,
    },
  });

  // Also update in MongoDB for consistency
  await User.findOneAndUpdate(
    { clerkId },
    { role },
    { upsert: false }
  );

  res.status(200).json({
    status: 'success',
    message: 'User role updated successfully',
    data: {
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      role: role,
    },
  });
});
