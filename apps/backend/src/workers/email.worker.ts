import { queue } from '../shared/queue';
import { logger } from '../shared/logger';

// Type for the job data
export interface SendEmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

/**
 * Initializes the email worker to listen for 'SEND_EMAIL' jobs.
 */
export async function initEmailWorker() {
  logger.info('Started Email Worker - listening for SEND_EMAIL jobs');

  // Ensure queue exists
  await queue.createQueue('SEND_EMAIL');
  
  // Register the worker handler
  await queue.work<SendEmailJobData>('SEND_EMAIL', async (jobs) => {
    // pg-boss can process multiple jobs at once depending on configuration.
    // For a single job fetch, jobs is an array containing one job (or we use queue.work directly).
    // Actually, queue.work passes an array of jobs if batching is enabled, 
    // but the signature might pass a single job if `teamSize` is 1. 
    // We'll iterate just in case, but usually it's one job object.
    
    // According to pg-boss docs, handler receives a single job object or an array.
    // By default it is a single job object, but let's handle the single job signature.
    // The signature is async (job) => { ... }
    
    // Note: To avoid typescript issues if it's a single job:
    const job = Array.isArray(jobs) ? jobs[0] : jobs;

    const { to, subject, template } = job.data;

    try {
      logger.info(`[Email Worker] Processing email to: ${to} | Subject: ${subject}`);
      
      // Simulating a delay to mimic an external API call (like SendGrid/Resend)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      logger.info(`[Email Worker] ✓ Email successfully sent to ${to}!`);
    } catch (error) {
      logger.error({ err: error }, `[Email Worker] Failed to send email to ${to}`);
      throw error; // Throwing will trigger pg-boss's retry mechanism
    }
  });
}
