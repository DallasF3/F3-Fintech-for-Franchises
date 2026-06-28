import { queue } from '../../../shared/queue';
import { getDatabase } from '../../../shared/database/connection';

export async function initializeSyncScheduler() {
  const db = getDatabase();

  // 0. Ensure queues exist
  await queue.createQueue('integration/webhook');
  await queue.createQueue('orchestrator/clover_delta');
  await queue.createQueue('orchestrator/clover_full');
  await queue.createQueue('orchestrator/payment');
  await queue.createQueue('orchestrator/crm');

  // 1. Unschedule any existing jobs to prevent duplicates if crons change
  await queue.unschedule('integration/sync/cron_clover_delta');
  await queue.unschedule('integration/sync/cron_clover_full');
  await queue.unschedule('integration/sync/cron_payment');
  await queue.unschedule('integration/sync/cron_crm');

  // Register the orchestrator workers
  await queue.work('orchestrator/clover_delta', async () => {
    const configs = await db('integration_configs').where({ type: 'clover', status: 'connected' });
    for (const config of configs) {
      await queue.send('integration/sync', { 
        integrationId: config.id, 
        franchiseId: config.franchise_id, 
        type: 'clover', 
        syncType: 'delta' 
      }, { retryBackoff: true, retryLimit: 5, deadLetter: 'integration/dlq' });
    }
  });

  await queue.work('orchestrator/clover_full', async () => {
    const configs = await db('integration_configs').where({ type: 'clover', status: 'connected' });
    for (const config of configs) {
      await queue.send('integration/sync', { 
        integrationId: config.id, 
        franchiseId: config.franchise_id, 
        type: 'clover', 
        syncType: 'full' 
      }, { retryBackoff: true, retryLimit: 5, deadLetter: 'integration/dlq' });
    }
  });

  await queue.work('orchestrator/payment', async () => {
    const configs = await db('integration_configs').where({ type: 'payment', status: 'connected' });
    for (const config of configs) {
      await queue.send('integration/sync', { 
        integrationId: config.id, 
        franchiseId: config.franchise_id, 
        type: 'payment', 
        syncType: 'full' 
      }, { retryBackoff: true, retryLimit: 5, deadLetter: 'integration/dlq' });
    }
  });

  await queue.work('orchestrator/crm', async () => {
    const configs = await db('integration_configs').where({ type: 'crm', status: 'connected' });
    for (const config of configs) {
      await queue.send('integration/sync', { 
        integrationId: config.id, 
        franchiseId: config.franchise_id, 
        type: 'crm', 
        syncType: 'full' 
      }, { retryBackoff: true, retryLimit: 5, deadLetter: 'integration/dlq' });
    }
  });

  // 2. Schedule repeating jobs (C1.2)
  // Clover delta sync: every 15 minutes
  await queue.schedule('orchestrator/clover_delta', '*/15 * * * *');
  
  // Clover full sync: daily at 2 AM UTC
  await queue.schedule('orchestrator/clover_full', '0 2 * * *');

  // Payment settlements: daily at 6 AM UTC
  await queue.schedule('orchestrator/payment', '0 6 * * *');

  // CRM contacts: every 1 hour
  await queue.schedule('orchestrator/crm', '0 * * * *');

  console.log('✓ Sync Scheduler registered (Cron orchestrators configured)');
}
