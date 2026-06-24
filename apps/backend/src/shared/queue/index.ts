import { PgBoss, SendOptions } from 'pg-boss';
import { logger } from '../logger';

// Retrieve database URL from environment or use default
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

export const queue = new PgBoss(databaseUrl);

queue.on('error', (error) => {
  logger.error({ err: error }, 'Queue error');
});

export async function initQueue() {
  try {
    await queue.start();
    logger.info('✓ pg-boss Queue connected and ready');
  } catch (error) {
    logger.error({ err: error }, 'Failed to start pg-boss queue');
  }
}

/**
 * Pushes a job to the queue
 */
export async function pushJob<T extends object>(jobName: string, data: T, options?: SendOptions) {
  try {
    const jobId = await queue.send(jobName, data, options);
    logger.info(`Job ${jobName} queued with ID ${jobId}`);
    return jobId;
  } catch (error) {
    logger.error({ err: error }, `Failed to push job ${jobName}`);
    throw error;
  }
}
