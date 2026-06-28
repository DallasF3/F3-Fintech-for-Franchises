import { Job } from 'pg-boss';
import { queue } from '../../../shared/queue';
import { getDatabase } from '../../../shared/database/connection';
import { CloverConnector } from '../services/clover.connector';

export interface WebhookJobData {
  integrationId: string;
  eventId: string;
}

export async function initializeWebhookWorker() {
  await queue.createQueue('integration/webhook');
  
  await queue.work('integration/webhook', async (jobs: Job<WebhookJobData>[]) => {
    for (const job of jobs) {
      const { data } = job;
      const db = getDatabase();

      console.log(`[Webhook Worker] Processing webhook event ${data.eventId} for integration ${data.integrationId}`);

      try {
        // 1. Fetch the event from the database
        const eventRecord = await db('webhook_events').where({ id: data.eventId }).first();
        if (!eventRecord) {
          console.error(`[Webhook Worker] Event ${data.eventId} not found in database.`);
          continue;
        }

        // 2. Check Circuit Breaker
        const config = await db('integration_configs').where({ id: data.integrationId }).first();
        if (!config || config.status === 'error') {
          console.warn(`[Webhook Worker] Circuit breaker engaged. Skipping webhook for integration ${data.integrationId}`);
          continue;
        }

        // 3. Process based on source
        if (eventRecord.source === 'clover') {
          await processCloverWebhook(config, eventRecord, db);
        } else if (eventRecord.source === 'crm') {
          // CRM processing logic if needed later
          console.log(`[Webhook Worker] CRM webhook processing not fully implemented yet.`);
        }

        // 4. Mark as processed
        await db('webhook_events')
          .where({ id: data.eventId })
          .update({ status: 'processed', updated_at: new Date() });

      } catch (error: any) {
        console.error(`[Webhook Worker] Error processing webhook event ${data.eventId}:`, error);

        // Mark as failed locally so we know the attempt failed
        await db('webhook_events')
          .where({ id: data.eventId })
          .update({ status: 'failed', updated_at: new Date() });

        // If it's a permanent error (like 401 Unauthorized), trip circuit breaker immediately
        if (error.status === 401 || error.status === 403 || error.status === 400) {
          console.error(`[Webhook Worker] Permanent error detected. Engaging circuit breaker for integration ${data.integrationId}`);
          
          await db('integration_configs')
            .where({ id: data.integrationId })
            .update({
              status: 'error',
              last_error: JSON.stringify({ message: error.message, status: error.status }),
              error_count: db.raw('error_count + 1'),
              updated_at: new Date()
            });
            
          // Send to DLQ immediately without exponential backoff
          await queue.send('integration/dlq', data, { singletonKey: data.integrationId });
          continue;
        }

        // Re-throw to trigger pg-boss retryBackoff
        throw error;
      }
    }
  });
  
  console.log('✓ Webhook Worker initialized');
}

async function processCloverWebhook(config: any, eventRecord: any, db: any) {
  const payload = typeof eventRecord.payload === 'string' ? JSON.parse(eventRecord.payload) : eventRecord.payload;
  
  console.log(`[Webhook Worker] Processing Clover webhook: ${payload.type || payload.event_type}`);

  // Fetch updated records from Clover based on the event type
  // This triggers a targeted 'delta' sync just for the webhook objects instead of full table scans.
  
  // Note: Depending on the event type (e.g., CREATE/UPDATE), Clover gives the objectId
  // The most robust way is to just trigger a delta sync for the entire integration
  // or fetch the specific object. For simplicity and robustness, we trigger a delta sync.
  
  await queue.send('integration/sync', { 
    integrationId: config.id, 
    franchiseId: config.franchise_id, 
    type: 'clover', 
    syncType: 'delta' 
  }, { retryBackoff: true, retryLimit: 5, deadLetter: 'integration/dlq' });
  
  console.log(`[Webhook Worker] Triggered delta sync for Clover integration ${config.id} in response to webhook.`);
}
