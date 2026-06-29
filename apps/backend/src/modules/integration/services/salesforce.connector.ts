import axios from 'axios';
import crypto from 'crypto';
import { getDatabase } from '../../../shared/database/connection';
import { IConnector, IntegrationConfig, SyncOptions, SyncResult, ConnectionTestResult, WebhookResult } from '../types';

export class SalesforceConnector implements IConnector {
  readonly type = 'salesforce';

  private decryptToken(encryptedData: string): { access_token: string, refresh_token?: string } {
    try {
      const encryptionKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
      const parsed = typeof encryptedData === 'string' ? JSON.parse(encryptedData) : encryptedData;
      const iv = Buffer.from(parsed.iv, 'hex');
      const authTag = Buffer.from(parsed.tag, 'hex');
      
      const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(encryptionKey), iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(parsed.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (e) {
      throw new Error('Failed to decrypt credentials');
    }
  }

  async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    try {
      const startTime = Date.now();
      const credentials = this.decryptToken(config.credentials as any);
      const instanceUrl = (config.settings as any)?.instance_url;

      if (!instanceUrl) {
        throw new Error('Missing instance_url in settings');
      }

      // Check the Salesforce Limits API as a simple ping test
      await axios.get(`${instanceUrl}/services/data/v60.0/limits`, {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`
        }
      });

      return {
        success: true,
        latencyMs: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.[0]?.message || error.message,
        latencyMs: 0
      };
    }
  }

  async fullSync(config: IntegrationConfig, options: SyncOptions): Promise<SyncResult> {
    const db = getDatabase();
    
    // In a real scenario we might batch this. Here we fetch all POS customers for the franchise
    let query = db('customers').where({ franchise_id: config.franchise_id });
    if (config.store_id) {
      query = query.andWhere({ store_id: config.store_id });
    }
    const localCustomers = await query;

    const credentials = this.decryptToken(config.credentials as any);
    const instanceUrl = (config.settings as any)?.instance_url;

    const result: SyncResult = {
      recordsFetched: localCustomers.length,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      hasMore: false
    };

    if (options.dryRun || localCustomers.length === 0) {
      return result;
    }

    const headers = {
      'Authorization': `Bearer ${credentials.access_token}`,
      'Content-Type': 'application/json'
    };

    for (const customer of localCustomers) {
      if (!customer.email) continue;

      try {
        // Step 1: Check if contact exists by Email
        const soql = `SELECT Id FROM Contact WHERE Email = '${customer.email}' LIMIT 1`;
        const searchRes = await axios.get(`${instanceUrl}/services/data/v60.0/query/?q=${encodeURIComponent(soql)}`, { headers });
        const existingContacts = searchRes.data.records;

        const contactPayload = {
          FirstName: customer.first_name || '',
          LastName: customer.last_name || 'Unknown', // LastName is required in Salesforce
          Email: customer.email,
          Phone: customer.phone || ''
        };

        if (existingContacts && existingContacts.length > 0) {
          // Update
          const contactId = existingContacts[0].Id;
          await axios.patch(`${instanceUrl}/services/data/v60.0/sobjects/Contact/${contactId}`, contactPayload, { headers });
          result.recordsUpdated++;
        } else {
          // Create
          await axios.post(`${instanceUrl}/services/data/v60.0/sobjects/Contact/`, contactPayload, { headers });
          result.recordsCreated++;
        }
      } catch (err: any) {
        result.recordsFailed++;
        result.errors.push({
          message: err.response?.data?.[0]?.message || err.message,
          details: customer.email
        });
      }
    }

    return result;
  }

  async deltaSync(config: IntegrationConfig, since: Date): Promise<SyncResult> {
    return this.fullSync(config, { batchSize: 100, since });
  }

  async processWebhook(payload: unknown, signature: string): Promise<WebhookResult> {
    return {
      success: true,
      event_type: 'unknown',
      recordsProcessed: 0
    };
  }
}

export const salesforceConnector = new SalesforceConnector();