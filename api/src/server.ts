import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4'; // ✅ correct import
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
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

const corsConfig = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

async function startServer() {
  const app = express();

  // Security Middlewares
  app.use(helmet());
  app.use(cors(corsConfig));
  app.options('*', cors(corsConfig));
  // app.use(limiter); // optional
  app.use(securityHeaders);
  app.use(cookieParser());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Database
  connectDB();

  // Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // REST routes
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/blogs', blogRoutes);
  app.use('/api/v1/upload', uploadRoutes);
  app.use('/api/v1/content', contentRoutes);
  app.use('/api/v1/ratings', ratingRoutes);

  // Apollo GraphQL setup
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });
  await apolloServer.start();

  app.use(
    '/api/v1/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        token: req.headers.authorization || null,
      }),
    })
  );

  // Health check
  app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
  });

  // Error Handling
  app.all('*', (req, res, next) => {
    next(new AppError(`Could not find ${req.originalUrl} on this server!`, 404));
  });
  app.use(errorHandler);

  // Start server
  const PORT: number = Number(process.env.PORT) || CONFIG.PORT || 8000;

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server ready at http://0.0.0.0:${PORT}`);
    logger.info(`🚀 GraphQL endpoint: http://0.0.0.0:${PORT}/api/v1/graphql`);
  });
  return server;
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err);
});
