import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { CONFIG } from './config/config';
import { connectDB } from './config/database';
import logger from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { limiter, securityHeaders } from './middleware/security';
import { specs } from './config/swagger';
import AppError from './utils/appError';
import userRoutes from './routes/user.routes';
import blogRoutes from './routes/blog.routes';
import uploadRoutes from './routes/upload.routes';
import contentRoutes from './routes/content/index.routes';
import ratingRoutes from './routes/rating.routes';

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

const corsConfig = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors(corsConfig));

app.options('*', cors(corsConfig));
// app.use(limiter); // Commented out for now
app.use(securityHeaders);
app.use(cookieParser()); // Parse cookies for refresh tokens
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true }));

// Database
connectDB();

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/ratings', ratingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error Handling
app.all('*', (req, res, next) => {
  next(new AppError(`Could not find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const server = app.listen(Number(CONFIG.PORT), '0.0.0.0', () => {
  logger.info(`Server is running on http://localhost:${CONFIG.PORT}`);
});

export default app;
