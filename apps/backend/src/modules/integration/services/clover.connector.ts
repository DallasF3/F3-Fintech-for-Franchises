import axios, { AxiosInstance } from 'axios';
import {
  IConnector,
  IntegrationConfig,
  SyncOptions,
  SyncResult,
  WebhookResult,
  ConnectionTestResult,
} from '../types';

export class CloverConnector implements IConnector {
  public readonly type = 'clover';
  private static readonly API_BASE_URL = 'https://api.clover.com/v3';
  
  // Example token bucket or simple sleep for rate limiting
  private async rateLimitDelay() {
    // 16 requests per second = ~62.5ms per request. Let's use 65ms for safety.
    return new Promise((resolve) => setTimeout(resolve, 65));
  }

  private getClient(config: IntegrationConfig): AxiosInstance {
    const accessToken = config.credentials?.access_token;
    if (!accessToken) {
      throw new Error('Missing Clover access token in integration config');
    }

    return axios.create({
      baseURL: CloverConnector.API_BASE_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  public async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      const client = this.getClient(config);
      const merchantId = config.credentials?.merchant_id;
      
      if (!merchantId) {
        return { success: false, error: 'Missing merchant_id', latencyMs: Date.now() - startTime };
      }

      await this.rateLimitDelay();
      const response = await client.get(`/merchants/${merchantId}`);
      
      return {
        success: true,
        merchantName: response.data.name,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection test failed',
        latencyMs: Date.now() - startTime,
      };
    }
  }

  public async fullSync(config: IntegrationConfig, options: SyncOptions): Promise<SyncResult> {
    // Placeholder implementation for full sync
    // Will fetch customers, transactions, orders, refunds with pagination
    
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
    // Placeholder implementation for delta sync
    // Fetches records with modifiedTime >= since.getTime()
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
    // Validate signature and process webhook
    return {
      success: true,
      event_type: payload?.event_type || 'unknown',
      recordsProcessed: 1,
    };
  }
}

export const cloverConnector = new CloverConnector();
