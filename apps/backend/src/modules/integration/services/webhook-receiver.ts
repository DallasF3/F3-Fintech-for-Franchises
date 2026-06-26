import { Request } from 'express';
import { syncScheduler } from './sync-scheduler';
import { CrmNormalizer } from './crm.normalizer';
import { getDatabase } from '../../../shared/database/connection';

export class WebhookReceiver {

  public async handleCloverWebhook(req: Request): Promise<void> {
    const signature = req.headers['x-clover-signature'] as string;
    const payload = req.body;
    
    // In a real scenario, we'd verify the signature with a known webhook secret
    console.log('Received Clover webhook with signature:', signature);
    
    // 1. Insert into webhook_events table (status: received)
    // 2. Extract integration_id if possible (maybe from payload merchantId mapping)
    // 3. Enqueue for processing
    await syncScheduler.scheduleWebhookProcessing('dummy-integration-id', 'dummy-event-id');
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
    
    // Enqueue for processing
    await syncScheduler.scheduleWebhookProcessing('dummy-crm-integration-id', 'dummy-crm-event-id');
  }
}

export const webhookReceiver = new WebhookReceiver();
