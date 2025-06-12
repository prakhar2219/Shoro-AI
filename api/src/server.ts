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

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*'
}));
app.use(limiter);
app.use(securityHeaders);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Database
connectDB();

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error Handling
app.all('*', (req, res, next) => {
  next(new AppError(`No se encontró ${req.originalUrl} en este servidor!`, 404));
});

app.use(errorHandler);

const server = app.listen(Number(CONFIG.PORT), '0.0.0.0', () => {
  logger.info(`Server is running on http://localhost:${CONFIG.PORT}`);
});

export default app;