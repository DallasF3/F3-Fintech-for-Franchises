import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const disableRedis = process.env.DISABLE_REDIS === 'true';

// @ts-ignore
export const redisClient = disableRedis ? null : new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Often required by BullMQ/etc.
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

if (redisClient) {
  redisClient.on('connect', () => {
    logger.info('✓ Redis connected');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis connection error. Set DISABLE_REDIS=true in .env to disable Redis.');
  });
} else {
  logger.warn('⚠ Redis is disabled via DISABLE_REDIS=true. Some features may use memory fallback or be disabled.');
}
