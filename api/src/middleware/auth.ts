import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/config';
import User from '../models/user.model';
import AppError from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // get token
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('No has iniciado sesión. Por favor inicia sesión para obtener acceso.', 401));
  }

  //token
  const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;

  //verificar si el usuario existe
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('El usuario perteneciente a este token ya no existe.', 401));
  }

  //Guardar usuario en req
  req.user = user;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('No tienes permiso para realizar esta acción', 403));
    }
    next();
  };
}; 