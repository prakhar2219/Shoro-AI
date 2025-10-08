import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as authService from '../services/auth.service';
import AppError from '../utils/appError';

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.signup(
    req.body
  );

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(201)
    .json({
      status: 'success',
      accessToken,
      data: { user },
    });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Por favor proporciona email y contraseña', 400);
  }

  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password
  );

  res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: 'success',
      accessToken,
      data: { user },
    });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('No se encontró refresh token', 400);
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshAccessToken(refreshToken);

  res
    .cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      status: 'success',
      accessToken,
    });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('No se encontró refresh token para cerrar sesión', 400);
  }

  await authService.logout(refreshToken);

  res
    .clearCookie('refreshToken')
    .status(200)
    .json({ status: 'success', message: 'Sesión cerrada correctamente' });
});
