import { Job } from 'pg-boss';
import { queue } from '../../../shared/queue';
import { getDatabase } from '../../../shared/database/connection';
import { cloverConnector } from '../services/clover.connector';
import { crmConnector } from '../services/crm.connector';
import { paymentConnector } from '../services/payment.connector';

export interface SyncJobData {
  integrationId: string;
  franchiseId: string;
  type: 'clover' | 'crm' | 'payment';
  syncType: 'full' | 'delta' | 'webhook' | 'manual';
}

export async function initializeSyncWorker() {
  // Concurrency Limit: process up to 5 sync jobs simultaneously
  const workOptions = {
    localConcurrency: 5,
  };

  await queue.createQueue('integration/sync');

  await queue.work('integration/sync', workOptions, async (jobs: Job<SyncJobData>[]) => {
    for (const job of jobs) {
      const { data } = job;
      console.log(`[Worker] Processing ${data.syncType} sync for ${data.type} (Integration ID: ${data.integrationId})`);

    try {
      const db = getDatabase();
      const config = await db('integration_configs')
        .where({ id: data.integrationId, franchise_id: data.franchiseId })
        .first();

      if (!config) {
        throw new Error(`Integration config not found for ID ${data.integrationId}`);
      }

      // C2.2: Circuit breaker check
      if (config.status === 'error') {
        console.warn(`[Worker] Circuit breaker engaged. Skipping sync for ${data.type} (Integration ID: ${data.integrationId})`);
        continue;
      }
      
      if (config.status !== 'connected') {
        console.warn(`[Worker] Skipping sync for ${data.type} as status is ${config.status}`);
        continue;
      }

      // C2.4: Sync Execution Logging
      const [syncRun] = await db('sync_runs').insert({
        integration_id: data.integrationId,
        type: data.syncType,
        status: 'running',
        started_at: new Date()
      }).returning('*');
      
      const startTime = Date.now();

      // Dispatch logic
      let result;
      try {
        switch (data.type) {
          case 'clover':
            // In real life we'd use deltaSync for frequent syncs. Since we only stubbed fullSync, we'll use that.
            result = await cloverConnector.fullSync(config, { batchSize: 100 });
            break;
          case 'crm':
            result = await crmConnector.fullSync(config, { batchSize: 100 });
            break;
          case 'payment':
            result = await paymentConnector.fullSync(config, { batchSize: 100 });
            break;
          default:
            throw new Error(`Unsupported integration type: ${data.type}`);
        }

        // C2.4: Update sync log on success
        await db('sync_runs')
          .where({ id: syncRun.id })
          .update({
            status: 'completed',
            records_fetched: result.recordsFetched || 0,
            records_created: result.recordsCreated || 0,
            records_updated: result.recordsUpdated || 0,
            records_failed: result.recordsFailed || 0,
            completed_at: new Date(),
            duration_ms: Date.now() - startTime
          });

        // Update sync status on success
        await db('integration_configs')
          .where({ id: config.id })
          .update({
            last_sync_at: new Date(),
            error_count: 0,
            last_error: null,
            updated_at: new Date(),
          });

        console.log(`[Worker] Successfully completed sync for ${data.type}:`, result);
      } catch (error: any) {
        // Handle inner sync execution failure
        await db('sync_runs')
          .where({ id: syncRun.id })
          .update({
            status: 'failed',
            error_message: error.message,
            error_details: JSON.stringify(error),
            completed_at: new Date(),
            duration_ms: Date.now() - startTime
          });
        
        throw error;
      }
    } catch (error: any) {
      console.error(`[Worker] Sync failed for ${data.type}:`, error.message);
      
      const db = getDatabase();
      await db('integration_configs')
        .where({ id: data.integrationId })
        .increment('error_count', 1)
        .update({
          last_error: error.message,
          updated_at: new Date(),
        });

      // C2.5: Error classification (transient vs. permanent)
      // Permanent errors include 401 Unauthorized, 403 Forbidden, 400 Bad Request
      const errorMessage = error.message.toLowerCase();
      const isPermanentError = 
        errorMessage.includes('unauthorized') || 
        errorMessage.includes('forbidden') || 
        errorMessage.includes('invalid api key') ||
        errorMessage.includes('bad request') ||
        error.status === 401 || error.status === 403 || error.status === 400;

      if (isPermanentError) {
        console.error(`[Worker] Permanent error detected for ${data.type}. Engaging circuit breaker.`);
        // Mark as error immediately so circuit breaker stops further requests
        await db('integration_configs')
          .where({ id: data.integrationId })
          .update({
            status: 'error',
            updated_at: new Date()
          });
        // We do NOT re-throw so it doesn't retry exponentially. Instead, we manually send to DLQ to trigger the alert.
        await queue.send('integration/dlq', data, { singletonKey: data.integrationId });
        continue;
      }

      // Re-throw transient errors so pg-boss marks the job as failed and handles retries
      throw error;
    }
    } // End of for-loop
  });

  console.log('✓ Sync Worker initialized');
}
