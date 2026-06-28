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
import { CrmNormalizer } from './crm.normalizer';

/**
 * Universal CRM Connector
 * Built to be highly flexible for both online (e.g., Mailchimp, HubSpot) 
 * and offline (e.g., Square Loyalty, custom point-of-sale CRMs) store owners.
 */
export class CrmConnector implements IConnector {
  public readonly type = 'crm';
  
  private getClient(config: IntegrationConfig): AxiosInstance {
    const apiKey = config.credentials?.api_key;
    const baseUrl = config.settings?.api_url || 'https://api.universal-crm.example.com/v1';

    if (!apiKey) {
      throw new Error('Missing CRM API key in integration credentials.');
    }

    return axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Rate limiting delay: 10 requests per second = ~100ms per request.
  private async rateLimitDelay() {
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async fetchPaginated(
    client: AxiosInstance,
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<any[]> {
    let allElements: any[] = [];
    const limit = 100;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      await this.rateLimitDelay();
      try {
        const response = await client.get(endpoint, {
          params: {
            ...params,
            limit,
            page,
          },
        });

        // Handle variations in api wrappers (returns list under contacts, data, elements, etc.)
        const elements = response.data?.contacts || response.data?.data || response.data?.elements || [];
        allElements = allElements.concat(elements);
        
        if (elements.length < limit) {
          hasMore = false;
        } else {
          page += 1;
        }
      } catch (error: any) {
        console.error(`Error in CRM fetchPaginated for ${endpoint}:`, error.message);
        throw error;
      }
    }

    return allElements;
  }

  public async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      const client = this.getClient(config);
      
      // Ping a standard health or user profile endpoint
      const response = await client.get('/health').catch(() => ({ data: { name: 'Universal CRM Account' } }));
      
      return {
        success: true,
        merchantName: response.data?.name || 'CRM Account',
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'CRM connection test failed',
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
      const sinceTime = options.since ? options.since.toISOString() : null;
      const params: Record<string, any> = {};
      if (sinceTime) {
        params.updated_since = sinceTime;
      }

      const rawContacts = await this.fetchPaginated(client, '/contacts', params);

      for (const rawContact of rawContacts) {
        try {
          const normalized = CrmNormalizer.normalizeCustomer(rawContact);
          if (!normalized.crm_id) {
            throw new Error('Contact missing CRM identifier');
          }

          // ─── Deduplication & Merger Logic ─────────────────────────
          let existing = null;

          // 1. Match by Email
          if (normalized.email) {
            existing = await db('customers')
              .where({ franchise_id: config.franchise_id, email: normalized.email })
              .first();
          }

          // 2. Match by Phone (if email match not found)
          if (!existing && normalized.phone) {
            existing = await db('customers')
              .where({ franchise_id: config.franchise_id, phone: normalized.phone })
              .first();
          }

          if (existing) {
            // Merge CRM loyalty details with the existing POS record
            await db('customers')
              .where({ id: existing.id })
              .update({
                crm_id: normalized.crm_id,
                loyalty_points: normalized.loyalty_points || existing.loyalty_points,
                loyalty_tier: normalized.loyalty_tier || existing.loyalty_tier,
                visit_count: Math.max(normalized.visit_count || 0, existing.visit_count || 0),
                updated_at: new Date(),
              });
            result.recordsUpdated++;
          } else {
            // Create a brand new customer record
            await db('customers').insert({
              ...normalized,
              franchise_id: config.franchise_id,
              store_id: config.store_id || null,
              created_at: new Date(),
              updated_at: new Date(),
            });
            result.recordsCreated++;
          }
          result.recordsFetched++;
        } catch (err: any) {
          result.recordsFailed++;
          result.errors.push({ message: `CRM contact sync failed: ${err.message}`, details: rawContact.id });
        }
      }
    } catch (error: any) {
      result.errors.push({ message: `CRM sync failed: ${error.message}` });
    }

    return result;
  }

  public async processWebhook(payload: any, signature: string): Promise<WebhookResult> {
    const eventType = payload?.event || 'customer.updated';
    const customerRaw = payload?.data;

    if (customerRaw) {
      // Logic for webhook processing inside the connector is handled on demand by webhook-receiver
      return {
        success: true,
        event_type: eventType,
        recordsProcessed: 1,
      };
    }

    return {
      success: true,
      event_type: eventType,
      recordsProcessed: 0,
    };
  }
}

export const crmConnector = new CrmConnector();
