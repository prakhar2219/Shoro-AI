import { Request, Response, NextFunction } from 'express';
import { IAppError } from '../interfaces/error.interface';
import logger from '../config/logger';
import { CONFIG } from '../config/config';

export const errorHandler = (
  err: IAppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (CONFIG.NODE_ENV === 'development') {
    logger.error('Error', err);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    logger.error('Error', err);
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
}; 