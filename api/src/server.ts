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

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
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

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error Handling
app.all('*', (req, res, next) => {
  next(new AppError(`No se encontró ${req.originalUrl} en este servidor!`, 404));
});

app.use(errorHandler);

const server = app.listen(CONFIG.PORT, '0.0.0.0', () => {
  logger.info(`Server is running on http://localhost:${CONFIG.PORT}`);
});

export default app;
// Instrucciones del codigo:
// Iniciar servidor
// Middleware de manejo de errores
// Manejo de rutas no encontradas
// Ruta de prueba
// Conexión a la base de datos
// Middlewares