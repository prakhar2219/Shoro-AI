import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as authService from '../services/auth.service';
import AppError from '../utils/appError';

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { user, token } = await authService.signup(req.body);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

export const login = catchAsync(async (req: Request, res: Response, NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Por favor proporciona email y contraseña', 400);
  }

  const { user, token } = await authService.login(email, password);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Se requiere refresh token', 400);
  }

  const tokens = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    status: 'success',
    ...tokens,
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Se requiere refresh token para cerrar sesión', 400);
  }

  await authService.logout(refreshToken);

  res.status(200).json({ status: 'success', message: 'Sesión cerrada correctamente' });
});
