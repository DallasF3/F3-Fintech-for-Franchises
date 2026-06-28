import crypto from 'crypto';
import { Request } from 'express';
import { queue } from '../../../shared/queue';
import { CrmNormalizer } from './crm.normalizer';
import { getDatabase } from '../../../shared/database/connection';

export class WebhookReceiver {

  private verifySignature(req: Request): boolean {
    const signature = req.headers['x-clover-signature'] as string;
    const secret = process.env.CLOVER_WEBHOOK_SECRET;
    
    if (!secret) return true; // Treat as verified if secret not configured in dev
    if (!signature) return false;
    
    const hmac = crypto.createHmac('sha256', secret);
    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const hash = hmac.update(bodyStr).digest('hex');
    
    return hash === signature;
  }

  public async handleCloverWebhook(req: Request): Promise<void> {
    const verified = this.verifySignature(req);
    if (!verified) {
      throw new Error('Invalid webhook signature');
    }

    const db = getDatabase();
    const payload = req.body;

    console.log('Received Clover webhook payload:', JSON.stringify(payload, null, 2));

    // Support single event or batch events
    const events = payload.events || (payload.event_type ? [payload] : []);

    for (const event of events) {
      const merchantId = event.merchantId || event.data?.merchantId;
      const objectId = event.objectId || event.data?.id;
      const eventType = event.type || event.event_type;

      if (!merchantId) continue;

      // Find the corresponding integration configuration
      const config = await db('integration_configs')
        .where({ type: 'clover' })
        .andWhereRaw("credentials->>'merchant_id' = ?", [merchantId])
        .first();

      if (!config) {
        console.warn(`No configuration found for Clover Merchant ID: ${merchantId}`);
        continue;
      }

      // Record the webhook event in the database
      const [inserted] = await db('webhook_events')
        .insert({
          integration_id: config.id,
          source: 'clover',
          event_type: eventType,
          payload: JSON.stringify(event),
          signature: req.headers['x-clover-signature'] as string,
          status: 'received',
        })
        .returning('id');

      const eventId = typeof inserted === 'object' ? inserted.id : inserted;

      // Schedule or process the webhook asynchronously via pg-boss
      await queue.send('integration/webhook', { integrationId: config.id, eventId }, { retryBackoff: true, retryLimit: 5, deadLetter: 'integration/dlq' });
    }
  }

  public async handleSendGridWebhook(req: Request): Promise<void> {
    // Similar to above
  }

  public async handleCrmWebhook(req: Request): Promise<void> {
    const payload = req.body;
    console.log('\n--- SIMULATED CRM WEBHOOK RECEIVED ---');
    console.log('Raw Payload:', JSON.stringify(payload, null, 2));
    
    // Normalize the raw CRM payload into our canonical schema
    const normalizedData = CrmNormalizer.normalizeCustomer(payload.data || payload);
    
    console.log('-> Normalized Data Ready For Database:');
    console.log(JSON.stringify(normalizedData, null, 2));
    console.log('--------------------------------------\n');
    
    // Insert into Supabase database
    try {
      const db = getDatabase();
      
      // We need a franchise_id to satisfy the foreign key
      const firstFranchise = await db('franchises').first();
      
      if (firstFranchise) {
        const inserted = await db('customers').insert({
          ...normalizedData,
          franchise_id: firstFranchise.id
        }).returning('*');
        console.log('✅ Successfully inserted customer into Supabase "customers" table!');
        console.log('   Inserted row:', JSON.stringify(inserted[0], null, 2));
      } else {
        console.log('⚠️ Could not insert: No franchises exist in the DB to attach the customer to.');
        console.log('   Please ensure you have at least one franchise in the "franchises" table.');
      }
    } catch (dbError: any) {
      console.log('❌ Error inserting into DB:', dbError.message);
      if (dbError.detail) console.log('   Detail:', dbError.detail);
    }
    
    // Enqueue for processing via pg-boss (for CRM webhooks if needed)
    await queue.send('integration/webhook', { integrationId: 'dummy-crm-integration-id', eventId: 'dummy-crm-event-id' }, { retryBackoff: true, retryLimit: 5, deadLetter: 'integration/dlq' });
  }
}

export const webhookReceiver = new WebhookReceiver();
