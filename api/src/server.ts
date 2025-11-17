import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
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
/* -------------------------------------------------------------------------- */
/*                               FIXED CORS SETUP                              */
/* -------------------------------------------------------------------------- */

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',

  // Clerk required domains
  'https://accounts.clerk.com',
  'https://clerk.accounts.dev',
  'https://*.clerk.accounts.dev',
];

// Allow override from ENV
if (process.env.CLIENT_URL) {
  allowedOrigins.push(
    ...process.env.CLIENT_URL.split(',').map(url => url.trim())
  );
}

const corsConfig = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow mobile apps, curl, etc.
    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.warn('❌ CORS blocked:', origin);
    return callback(null, false); // No error thrown → server won't crash
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/* -------------------------------------------------------------------------- */
/*                                 START SERVER                               */
/* -------------------------------------------------------------------------- */

async function startServer() {
  const app = express();

  /* ---------------------------- Security Middleware --------------------------- */
  app.use(helmet());
  app.use(cors(corsConfig));
  app.options('*', cors(corsConfig));
  app.use(securityHeaders);
  app.use(cookieParser());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true }));

  /* ------------------------------ Database Init ------------------------------ */
  connectDB();

  /* -------------------------- API Documentation UI --------------------------- */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  /* ------------------------------- REST Routes -------------------------------- */
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/blogs', blogRoutes);
  app.use('/api/v1/upload', uploadRoutes);
  app.use('/api/v1/content', contentRoutes);
  app.use('/api/v1/ratings', ratingRoutes);

  /* ------------------------------- GraphQL Setup ------------------------------ */
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await apolloServer.start();

  app.use(
    '/api/v1/graphql',
    cors(corsConfig),
    bodyParser.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        token: req.headers.authorization || null,
      }),
    })
  );

  /* -------------------------------- Health Check ------------------------------ */
  app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
  });

  /* ------------------------------ Error Handling ------------------------------ */
  app.all('*', (req, res, next) => {
    next(new AppError(`Could not find ${req.originalUrl} on this server!`, 404));
  });
  app.use(errorHandler);

  /* ------------------------------- Start Server ------------------------------- */
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
