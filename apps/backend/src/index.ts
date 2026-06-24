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
import { authRouter } from './modules/auth';
import usersRouter from './modules/users';

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
app.use('/api/auth', authRouter);

// User management routes (with RBAC)
app.use('/api/users', usersRouter);

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

start();

export default app;
