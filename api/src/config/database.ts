import mongoose from 'mongoose';
import { CONFIG } from './config';
import logger from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(CONFIG.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
