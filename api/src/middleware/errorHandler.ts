import { Request, Response, NextFunction } from 'express';
import { IAppError } from '../interfaces/error.interface';
import logger from '../config/logger';
import { CONFIG } from '../config/config';
import mongoose from 'mongoose';

// Helper function to extract readable error messages from MongoDB errors
const getReadableErrorMessage = (error: any): string => {
  // MongoDB duplicate key error (E11000)
  if (error.code === 11000 && error.keyPattern) {
    const fieldNames = Object.keys(error.keyPattern);
    const duplicateValues = error.keyValue;
    
    // Build a user-friendly message
    const fields = fieldNames.join(' and ');
    const values = Object.entries(duplicateValues)
      .map(([key, value]) => `${key}: "${value}"`)
      .join(', ');
    
    return `A record with this ${fields} already exists (${values}). Please use a different value.`;
  }
  
  // MongoDB validation error
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors)
      .map((e: any) => e.message)
      .join(', ');
    return `Validation failed: ${messages}`;
  }
  
  // MongoDB cast error
  if (error instanceof mongoose.Error.CastError) {
    return `Invalid ${error.path}: ${error.value}`;
  }
  
  // Generic error
  return error.message || 'An unexpected error occurred';
};

export const errorHandler = (
  err: IAppError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Convert MongoDB errors to user-friendly messages
  const isMongoError = err.code === 11000 || 
                       err instanceof mongoose.Error.ValidationError ||
                       err instanceof mongoose.Error.CastError;
  
  const readableMessage = isMongoError ? getReadableErrorMessage(err) : err.message;

  if (CONFIG.NODE_ENV === 'development') {
    logger.error('Error', err);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: readableMessage,
      stack: err.stack,
    });
  } else {
    logger.error('Error', err);
    if (err.isOperational || isMongoError) {
      res.status(err.statusCode).json({
        status: err.status,
        message: readableMessage,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }
};
