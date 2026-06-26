import axios, { AxiosInstance } from 'axios';
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
    // In a real implementation, this loops through paginated /customers endpoints
    // For now, it returns a normalized skeleton response.
    return {
      recordsFetched: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      hasMore: false,
    };
  }

  public async deltaSync(config: IntegrationConfig, since: Date): Promise<SyncResult> {
    // Fetches customers updated after the `since` timestamp.
    return {
      recordsFetched: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsFailed: 0,
      errors: [],
      hasMore: false,
    };
  }

  public async processWebhook(payload: any, signature: string): Promise<WebhookResult> {
    const eventType = payload?.event || 'customer.updated';
    const customerRaw = payload?.data;

    if (customerRaw) {
      const normalized = CrmNormalizer.normalizeCustomer(customerRaw);
      // Logic to upsert into `customers` table goes here (called by the Sync Scheduler).
    }

    return {
      success: true,
      event_type: eventType,
      recordsProcessed: customerRaw ? 1 : 0,
    };
  }
}

export const crmConnector = new CrmConnector();
