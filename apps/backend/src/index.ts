import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { initializeDatabase } from '@shared/database/connection';
import { initQueue } from '@shared/queue';
import { initEmailWorker } from './workers/email.worker';
import { logger } from './shared/logger';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rate-limit.middleware';
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import invitationRoutes from './modules/invitations/routes';
import integrationRoutes from './modules/integration/routes';

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/api/auth', authRoutes);

// User management routes (with RBAC)
app.use('/api/users', userRoutes);

// Invitation routes
app.use('/api/invitations', invitationRoutes);

// Integration routes
app.use('/api/integrations', integrationRoutes);

// Global Error Handler
app.use(errorHandler);

// Initialize database and start server
async function start() {
  try {
    await initializeDatabase();
    await initQueue();
    await initEmailWorker();

    app.listen(port, () => {
      logger.info(`✓ Backend running on http://localhost:${port}`);
      logger.info(`✓ Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start backend');
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
