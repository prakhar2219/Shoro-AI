import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CONFIG } from '../config/config';
import User from '../models/user.model';
import Session from '../models/session.model';
import AppError from '../utils/appError';
import { IUser } from '../interfaces/user.interface';

export const generateAccessToken = (id: string): string => {
  return jwt.sign({ id }, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRES_IN,
  });
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex'); // Store in DB
};

export const signup = async (userData: Partial<IUser>) => {
  const user = await User.create(userData);
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken();

  await Session.create({
    user: user._id,
    refreshToken,
    userAgent: '', // Optionally capture from req.headers
    ip: '',        // Same
  });

  return { user, accessToken, refreshToken, expiresIn: 3600 };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email o contraseña incorrectos', 401);
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken();

  await Session.create({
    user: user._id,
    refreshToken,
    userAgent: '', // You can pass from controller
    ip: '',        // Likewise
  });

  return { user, accessToken, refreshToken, expiresIn: 3600 };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const session = await Session.findOne({ refreshToken });

  if (!session) throw new AppError('Token inválido o expirado', 401);

  const accessToken = generateAccessToken(session.user.toString());
  const newRefreshToken = generateRefreshToken();

  session.refreshToken = newRefreshToken;
  await session.save();

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: 3600,
  };
};

export const logout = async (refreshToken: string) => {
  await Session.findOneAndDelete({ refreshToken });
};