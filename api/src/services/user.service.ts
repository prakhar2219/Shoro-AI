import User from '../models/user.model';
import AppError from '../utils/appError';
import { IUser } from '../interfaces/user.interface';

interface QueryOptions {
  page?: number;
  limit?: number;
  role?: string;
  active?: boolean;
  search?: string;
}

export const getAllUsers = async (options: QueryOptions) => {
  const { page = 1, limit = 10, role, active, search } = options;
  const skip = (page - 1) * limit;

  // Build filter
  const filter: any = {};
  if (role && role !== 'all') filter.role = role;
  if (active !== undefined) filter.active = active;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  console.log('User Service - Query filter:', JSON.stringify(filter));
  console.log('User Service - Skip:', skip, 'Limit:', limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  console.log('User Service - Found users:', users.length, 'Total in DB:', total);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  return user;
};

export const createUser = async (userData: Partial<IUser>) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('El email ya está en uso', 400);
  }

  const user = await User.create(userData);
  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};

export const updateUser = async (userId: string, updateData: Partial<IUser>) => {
  // Prevent password update through this endpoint
  if (updateData.password) {
    throw new AppError(
      'No se puede actualizar la contraseña a través de este endpoint',
      400
    );
  }

  // Prevent email change to existing email
  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      throw new AppError('El email ya está en uso', 400);
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { active: false },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return user;
};

export const hardDeleteUser = async (userId: string) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return user;
};

export const updateUserRole = async (
  userId: string,
  newRole: 'super_admin' | 'admin' | 'editor' | 'user'
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  return user;
};

export const getUserStats = async () => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ active: true });
  const inactiveUsers = await User.countDocuments({ active: false });

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    byRole: stats,
  };
};
