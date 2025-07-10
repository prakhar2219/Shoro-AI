// config.ts
import dotenv from 'dotenv';

dotenv.config();

interface Config {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug' | string;
}

export const CONFIG: Config = {
  NODE_ENV:
    (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
    'development',
  PORT: parseInt(process.env.PORT || '8000', 10),
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/template-db',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  LOG_LEVEL:
    (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
};
