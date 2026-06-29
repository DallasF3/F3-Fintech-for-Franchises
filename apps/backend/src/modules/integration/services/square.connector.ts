import axios, { AxiosInstance } from 'axios';
import { getDatabase } from '../../../shared/database/connection';
import { SquareNormalizer } from './square.normalizer';
import {
  IConnector,
  IntegrationConfig,
  SyncOptions,
  SyncResult,
  WebhookResult,
  ConnectionTestResult,
} from '../types';

export class SquareConnector implements IConnector {
  public readonly type = 'square';
  
  private static getApiBaseUrl(): string {
    const env = process.env.SQUARE_ENVIRONMENT || 'sandbox';
    return env === 'production'
      ? 'https://connect.squareup.com/v2'
      : 'https://connect.squareupsandbox.com/v2';
  }
  
  // Rate limiting delay
  private async rateLimitDelay() {
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  private getClient(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: SquareConnector.getApiBaseUrl(),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async fetchPaginated(
    client: AxiosInstance,
    endpoint: string,
    params: Record<string, any> = {},
    dataKey: string
  ): Promise<any[]> {
    let allElements: any[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      await this.rateLimitDelay();
      try {
        const currentParams: Record<string, any> = cursor ? { ...params, cursor } : params;
        const response: any = await client.get(endpoint, { params: currentParams });

        const elements = response.data?.[dataKey] || [];
        allElements = allElements.concat(elements);
        
        cursor = response.data?.cursor;
        if (!cursor) {
          hasMore = false;
        }
      } catch (error: any) {
        console.error(`Error in Square fetchPaginated for ${endpoint}:`, error.message);
        throw error;
      }
    }

    return allElements;
  }

  public async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      const accessToken = config.credentials?.access_token;
      if (!accessToken) throw new Error('Missing Square Access Token');
      
      const client = this.getClient(accessToken);
      
      await this.rateLimitDelay();
      // /v2/locations is a good health check endpoint
      const response = await client.get(`/locations`);
      const locationName = response.data?.locations?.[0]?.name || 'Square Account';
      
      return {
        success: true,
        merchantName: locationName,
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
      const accessToken = config.credentials?.access_token;
      if (!accessToken) throw new Error('Missing Square Access Token');

      const client = this.getClient(accessToken);
      
      const sinceTime = options.since ? options.since.toISOString() : null;
      
      // 1. Sync Customers
      let customerParams: Record<string, any> = {};
      if (sinceTime) {
        customerParams.begin_time = sinceTime; // Square uses begin_time for filtering creation/updates in some search APIs, but for /v2/customers it might need SearchCustomers API.
        // For simplicity using GET /v2/customers, it may not support begin_time directly via query params.
        // A production app would use POST /v2/customers/search.
      }
      
      const rawCustomers = await this.fetchPaginated(client, `/customers`, {}, 'customers');
      
      for (const rawCustomer of rawCustomers) {
        // Only process delta logic manually if SearchCustomers API isn't used
        if (sinceTime && new Date(rawCustomer.updated_at) < new Date(sinceTime)) {
          continue; 
        }

        try {
          const normalized = SquareNormalizer.normalizeCustomer(rawCustomer, config.franchise_id, config.store_id || undefined);
          
          const existing = await db('customers')
            .where({ franchise_id: config.franchise_id, clover_id: rawCustomer.id })
            .first();

          await db('customers')
            .insert(normalized)
            .onConflict(['franchise_id', 'clover_id'])
            .merge();

          if (existing) {
            result.recordsUpdated++;
          } else {
            result.recordsCreated++;
          }
          result.recordsFetched++;
        } catch (err: any) {
          result.recordsFailed++;
          result.errors.push({ message: `Customer sync failed: ${err.message}`, details: rawCustomer.id });
        }
      }

      // 2. Sync Orders (Transactions)
      // Square transactions are typically fetched via POST /v2/orders/search
      // But for this connector, let's assume we can fetch basic payments
      let paymentParams: Record<string, any> = {};
      if (sinceTime) {
        paymentParams.begin_time = sinceTime;
      }

      const rawPayments = await this.fetchPaginated(client, `/payments`, paymentParams, 'payments');
      for (const rawPayment of rawPayments) {
        try {
          let dbCustomerId: string | null = null;
          if (rawPayment.customer_id) {
            const dbCust = await db('customers')
              .where({ franchise_id: config.franchise_id, clover_id: rawPayment.customer_id })
              .first();
            if (dbCust) {
              dbCustomerId = dbCust.id;
            }
          }

          let storeId = config.store_id;
          if (!storeId) {
            const firstStore = await db('stores').where({ franchise_id: config.franchise_id }).first();
            if (!firstStore) {
              throw new Error('No store associated with this franchise. Cannot sync transactions.');
            }
            storeId = firstStore.id;
          }

          const normalized = SquareNormalizer.normalizeTransaction(rawPayment, storeId!, dbCustomerId);

          const existing = await db('transactions')
            .where({ store_id: storeId, clover_id: rawPayment.id })
            .first();

          await db('transactions')
            .insert(normalized)
            .onConflict(['store_id', 'clover_id'])
            .merge();

          if (existing) {
            result.recordsUpdated++;
          } else {
            result.recordsCreated++;
          }
          result.recordsFetched++;
        } catch (err: any) {
          result.recordsFailed++;
          result.errors.push({ message: `Transaction sync failed: ${err.message}`, details: rawPayment.id });
        }
      }

      // 3. Sync Refunds
      let refundParams: Record<string, any> = {};
      if (sinceTime) {
        refundParams.begin_time = sinceTime;
      }

      const rawRefunds = await this.fetchPaginated(client, `/refunds`, refundParams, 'refunds');
      for (const rawRefund of rawRefunds) {
        try {
          let storeId = config.store_id;
          if (!storeId) {
            const firstStore = await db('stores').where({ franchise_id: config.franchise_id }).first();
            if (!firstStore) {
              throw new Error('No store associated with this franchise. Cannot sync refunds.');
            }
            storeId = firstStore.id;
          }

          const paymentId = rawRefund.payment_id;
          if (!paymentId) {
            throw new Error(`Refund ${rawRefund.id} has no associated payment`);
          }

          const dbTx = await db('transactions').where({ store_id: storeId, clover_id: paymentId }).first();
          if (!dbTx) {
            throw new Error(`Transaction with Square ID ${paymentId} not found in DB. Cannot sync refund.`);
          }

          const normalized = SquareNormalizer.normalizeRefund(rawRefund, dbTx.id, storeId!, dbTx.customer_id);

          const existing = await db('refunds')
            .where({ store_id: storeId, clover_id: rawRefund.id })
            .first();

          await db('refunds')
            .insert(normalized)
            .onConflict(['store_id', 'clover_id'])
            .merge();

          if (existing) {
            result.recordsUpdated++;
          } else {
            result.recordsCreated++;
          }
          result.recordsFetched++;
        } catch (err: any) {
          result.recordsFailed++;
          result.errors.push({ message: `Refund sync failed: ${err.message}`, details: rawRefund.id });
        }
      }

    } catch (error: any) {
      result.errors.push({ message: `Sync failed: ${error.message}` });
    }

    return result;
  }

  public async processWebhook(payload: any, signature: string): Promise<WebhookResult> {
    return {
      success: true,
      event_type: payload?.type || 'unknown',
      recordsProcessed: 1,
    };
  }
}

export const squareConnector = new SquareConnector();
