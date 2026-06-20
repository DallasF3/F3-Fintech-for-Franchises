import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../shared/redis';

const disableRedis = process.env.DISABLE_REDIS === 'true';

// Create a generic rate limiter instance
export const apiLimiter = rateLimit({
  // Use Redis as the store if enabled, otherwise defaults to MemoryStore
  store: disableRedis ? undefined : new RedisStore({
    // @ts-expect-error - Known issue with rate-limit-redis types mismatching slightly with ioredis
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' },
});

// A stricter rate limiter for sensitive routes (like login/signup)
export const authLimiter = rateLimit({
  store: disableRedis ? undefined : new RedisStore({
    // @ts-expect-error
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again after an hour.' },
});
