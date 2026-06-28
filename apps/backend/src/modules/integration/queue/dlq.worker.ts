import { Job } from 'pg-boss';
import { queue } from '../../../shared/queue';
import { getDatabase } from '../../../shared/database/connection';
import { SyncJobData } from './sync.worker';

export async function initializeDlqWorker() {
  await queue.createQueue('integration/dlq');
  await queue.work('integration/dlq', async (jobs: Job<SyncJobData>[]) => {
    for (const job of jobs) {
      const { data } = job;
      
      console.error(`[DLQ Worker] Job ${job.id} permanently failed:`, {
        integrationId: data.integrationId,
        type: data.type,
        syncType: data.syncType,
        error: (job as any).output // The error from the last failed attempt is stored here
      });

      try {
        const db = getDatabase();
        
        // C2.6: Mark the integration config as error
        await db('integration_configs')
          .where({ id: data.integrationId })
          .update({
            status: 'error',
            last_error: typeof (job as any).output === 'object' ? JSON.stringify((job as any).output) : String((job as any).output),
            error_count: db.raw('error_count + 1'),
            updated_at: new Date()
          });

        // Here we could also trigger an admin alert via email, SMS, or Slack.
        console.error(`[Admin Alert] Integration ${data.integrationId} requires attention. Circuit breaker engaged.`);

      } catch (err: any) {
        console.error(`[DLQ Worker] Error updating database for failed job ${job.id}:`, err.message);
      }
    }
  });

  console.log('✓ DLQ Worker initialized');
}
