import axios, { AxiosInstance } from 'axios';
import { getDatabase } from '../../../shared/database/connection';
import {
  IConnector,
  IntegrationConfig,
  SyncOptions,
  SyncResult,
  WebhookResult,
  ConnectionTestResult,
} from '../types';

export class HubSpotConnector implements IConnector {
  public readonly type = 'hubspot';
  
  private getClient(config: IntegrationConfig): AxiosInstance {
    let accessToken: string;
    try {
      if (typeof config.credentials === 'string') {
        // Parse the payload { iv, data, tag }
        const payload = JSON.parse(config.credentials);
        
        // Decrypt the token
        const crypto = require('crypto');
        const encryptionKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
        const decipher = crypto.createDecipheriv(
          'aes-256-gcm', 
          Buffer.from(encryptionKey), 
          Buffer.from(payload.iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(payload.tag, 'hex'));
        
        let decrypted = decipher.update(payload.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        const credentialsObj = JSON.parse(decrypted);
        accessToken = credentialsObj.access_token;
      } else {
        // Fallback for mocked/unencrypted dev configurations
        accessToken = (config.credentials as any).access_token || 'mock_token';
      }
    } catch (err: any) {
      throw new Error(`Failed to parse HubSpot credentials: ${err.message}`);
    }

    if (!accessToken) {
      throw new Error('Missing HubSpot access token.');
    }

    return axios.create({
      baseURL: 'https://api.hubapi.com',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Rate limiting delay
  private async rateLimitDelay() {
    return new Promise((resolve) => setTimeout(resolve, 150));
  }

  public async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      const client = this.getClient(config);
      
      // Ping a simple HubSpot API endpoint to test token validity
      // /crm/v3/objects/contacts limits to 1 just to see if we get a 200 OK
      await client.get('/crm/v3/objects/contacts?limit=1');
      
      return {
        success: true,
        merchantName: 'HubSpot Account',
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'HubSpot connection test failed',
        latencyMs: Date.now() - startTime,
      };
    }
  }

  public async fullSync(config: IntegrationConfig, options: SyncOptions): Promise<SyncResult> {
    return this.syncInternal(config, options);
  }

  public async deltaSync(config: IntegrationConfig, since: Date): Promise<SyncResult> {
    return this.syncInternal(config, { batchSize: 100, since });
  }

  /**
   * Outbound Sync: We push local customers from our DB (fetched from POS) into HubSpot.
   */
  private async syncInternal(config: IntegrationConfig, options: SyncOptions): Promise<SyncResult> {
    const db = getDatabase();
    const result: SyncResult = {
      recordsFetched: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      hasMore: false,
    };

    try {
      const client = this.getClient(config);
      
      // 1. Fetch local customers for this franchise
      const query = db('customers').where('franchise_id', config.franchise_id);
      
      if (options.since) {
        query.andWhere('updated_at', '>=', options.since);
      }
      
      const localCustomers = await query;
      result.recordsFetched = localCustomers.length;

      // 2. Push to HubSpot sequentially (in a real app we might use the bulk endpoints, 
      // but for standard contacts we can iterate).
      for (const customer of localCustomers) {
        try {
          await this.rateLimitDelay();

          const contactPayload = {
            properties: {
              email: customer.email || `no-email-${customer.id}@placeholder.com`,
              firstname: customer.first_name || '',
              lastname: customer.last_name || '',
              phone: customer.phone || '',
              // Custom fields can also be mapped if created in HubSpot
              // 'pos_loyalty_points': customer.loyalty_points?.toString() || '0'
            }
          };

          // Try to search if the contact already exists in HubSpot by Email (if we have one)
          let hubspotId = null;
          if (customer.email) {
            const searchResponse = await client.post('/crm/v3/objects/contacts/search', {
              filterGroups: [
                {
                  filters: [
                    {
                      propertyName: "email",
                      operator: "EQ",
                      value: customer.email
                    }
                  ]
                }
              ]
            });
            
            if (searchResponse.data.results && searchResponse.data.results.length > 0) {
              hubspotId = searchResponse.data.results[0].id;
            }
          }

          if (hubspotId) {
            // Update existing HubSpot contact
            await client.patch(`/crm/v3/objects/contacts/${hubspotId}`, contactPayload);
            result.recordsUpdated++;
          } else {
            // Create new HubSpot contact
            await client.post('/crm/v3/objects/contacts', contactPayload);
            result.recordsCreated++;
          }

        } catch (err: any) {
          result.recordsFailed++;
          result.errors.push({ 
            message: `Failed to push customer ${customer.id} to HubSpot: ${err.response?.data?.message || err.message}`, 
            details: customer.id 
          });
        }
      }
    } catch (error: any) {
      result.errors.push({ message: `HubSpot sync failed: ${error.message}` });
    }

    return result;
  }

  public async processWebhook(payload: any, signature: string): Promise<WebhookResult> {
    const eventType = payload?.subscriptionType || 'unknown';

    return {
      success: true,
      event_type: eventType,
      recordsProcessed: payload?.length || 0,
    };
  }
}

export const hubspotConnector = new HubSpotConnector();
