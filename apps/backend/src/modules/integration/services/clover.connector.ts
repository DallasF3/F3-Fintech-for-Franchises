import axios, { AxiosInstance } from 'axios';
import { getDatabase } from '../../../shared/database/connection';
import { CloverOAuthService } from './clover-oauth.service';
import { CloverNormalizer } from './clover.normalizer';
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
  
  private static getApiBaseUrl(): string {
    const env = process.env.CLOVER_ENVIRONMENT || 'sandbox';
    return env === 'production'
      ? 'https://api.clover.com/v3'
      : 'https://sandbox.dev.clover.com/v3';
  }
  
  // Rate limiting delay: 16 requests per second = ~62.5ms per request. Use 65ms for safety.
  private async rateLimitDelay() {
    return new Promise((resolve) => setTimeout(resolve, 65));
  }

  private getClient(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: CloverConnector.getApiBaseUrl(),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async fetchPaginated(
    client: AxiosInstance,
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<any[]> {
    let allElements: any[] = [];
    const limit = 100;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      await this.rateLimitDelay();
      try {
        const response = await client.get(endpoint, {
          params: {
            ...params,
            limit,
            offset,
          },
        });

        const elements = response.data?.elements || [];
        allElements = allElements.concat(elements);
        
        if (elements.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      } catch (error: any) {
        console.error(`Error in Clover fetchPaginated for ${endpoint}:`, error.message);
        throw error;
      }
    }

    return allElements;
  }

  public async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      const { accessToken, merchantId } = await CloverOAuthService.getDecryptedToken(config.id);
      const client = this.getClient(accessToken);
      
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
      const { accessToken, merchantId } = await CloverOAuthService.getDecryptedToken(config.id);
      const client = this.getClient(accessToken);
      
      // Determine sync filters
      const sinceTime = options.since ? options.since.getTime() : null;
      const filterParams: Record<string, any> = {};
      
      // 1. Sync Customers
      let customerParams: Record<string, any> = {};
      if (sinceTime) {
        customerParams.filter = `clientModifiedTime>=${sinceTime}`;
      }
      
      const rawCustomers = await this.fetchPaginated(client, `/merchants/${merchantId}/customers`, customerParams);
      for (const rawCustomer of rawCustomers) {
        try {
          const normalized = CloverNormalizer.normalizeCustomer(rawCustomer, config.franchise_id, config.store_id);
          
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

      // 2. Sync Transactions (Payments)
      let paymentParams: Record<string, any> = { expand: 'cardTransaction,tender' };
      if (sinceTime) {
        paymentParams.filter = `createdTime>=${sinceTime}`;
      }

      const rawPayments = await this.fetchPaginated(client, `/merchants/${merchantId}/payments`, paymentParams);
      for (const rawPayment of rawPayments) {
        try {
          let dbCustomerId: string | null = null;
          if (rawPayment.customer?.id) {
            const dbCust = await db('customers')
              .where({ franchise_id: config.franchise_id, clover_id: rawPayment.customer.id })
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

          const normalized = CloverNormalizer.normalizeTransaction(rawPayment, storeId!, dbCustomerId);

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
        refundParams.filter = `createdTime>=${sinceTime}`;
      }

      const rawRefunds = await this.fetchPaginated(client, `/merchants/${merchantId}/refunds`, refundParams);
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

          const paymentCloverId = rawRefund.payment?.id;
          if (!paymentCloverId) {
            throw new Error(`Refund ${rawRefund.id} has no associated payment`);
          }

          const dbTx = await db('transactions').where({ store_id: storeId, clover_id: paymentCloverId }).first();
          if (!dbTx) {
            throw new Error(`Transaction with Clover ID ${paymentCloverId} not found in DB. Cannot sync refund.`);
          }

          const normalized = CloverNormalizer.normalizeRefund(rawRefund, dbTx.id, storeId!, dbTx.customer_id);

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
    // Basic signature verification can be added here
    return {
      success: true,
      event_type: payload?.event_type || 'unknown',
      recordsProcessed: 1,
    };
  }
}

export const cloverConnector = new CloverConnector();

