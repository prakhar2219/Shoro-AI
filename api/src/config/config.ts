// config.ts
import dotenv from 'dotenv';

dotenv.config();

interface Config {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug' | string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
}

export const CONFIG: Config = {
  NODE_ENV:
    (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
    'development',
  PORT: parseInt(process.env.PORT || '8000', 10),
  MONGODB_URI:
    process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/template-db',
  LOG_LEVEL:
    (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
};
