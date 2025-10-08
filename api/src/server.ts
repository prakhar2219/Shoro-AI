import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { CONFIG } from './config/config';
import { connectDB } from './config/database';
import logger from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { limiter, securityHeaders } from './middleware/security';
import { specs } from './config/swagger';
import AppError from './utils/appError';
import authRoutes from './routes/auth.routes';
import blogRoutes from './routes/blog.routes';
import uploadRoutes from './routes/upload.routes';
import contentRoutes from './routes/content/index.routes';

const corsConfig = {
  origin: '*',
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
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true }));

// Database
connectDB();

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/content', contentRoutes);

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
