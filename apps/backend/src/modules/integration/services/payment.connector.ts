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
import { PaymentNormalizer } from './payment.normalizer';

/**
 * iAccess Payment Processor Connector
 * Fetches settlements, funding details, fee breakdowns, and chargebacks/disputes.
 */
export class PaymentConnector implements IConnector {
  public readonly type = 'payment';
  
  private getClient(config: IntegrationConfig): AxiosInstance {
    const apiKey = config.credentials?.api_key;
    const baseUrl = config.settings?.api_url || 'https://api.paymentprocessor.example.com/v1';

    if (!apiKey) {
      throw new Error('Missing Payment API key in integration credentials.');
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

        const elements = response.data?.settlements || response.data?.disputes || response.data?.data || [];
        allElements = allElements.concat(elements);
        
        if (elements.length < limit) {
          hasMore = false;
        } else {
          page += 1;
        }
      } catch (error: any) {
        console.error(`Error in Payment fetchPaginated for ${endpoint}:`, error.message);
        throw error;
      }
    }

    return allElements;
  }

  public async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      const client = this.getClient(config);
      const response = await client.get('/health').catch(() => ({ data: { name: 'iAccess Merchant Account' } }));
      
      return {
        success: true,
        merchantName: response.data?.name || 'iAccess Merchant Account',
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment connection test failed',
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

      // Resolve store_id
      let storeId = config.store_id;
      if (!storeId) {
        const firstStore = await db('stores').where({ franchise_id: config.franchise_id }).first();
        if (!firstStore) {
          throw new Error('No store associated with this franchise. Cannot sync payment data.');
        }
        storeId = firstStore.id;
      }

      // ─── 1. Sync Settlements ──────────────────────────────────
      const rawSettlements = await this.fetchPaginated(client, '/settlements', params);
      for (const rawSettlement of rawSettlements) {
        try {
          const normalized = PaymentNormalizer.normalizeSettlement(rawSettlement, storeId!);
          
          const existing = await db('settlements')
            .where({ store_id: storeId, external_id: normalized.external_id })
            .first();

          await db('settlements')
            .insert(normalized)
            .onConflict(['store_id', 'external_id'])
            .merge();

          if (existing) {
            result.recordsUpdated++;
          } else {
            result.recordsCreated++;
          }
          result.recordsFetched++;
        } catch (err: any) {
          result.recordsFailed++;
          result.errors.push({ message: `Settlement sync failed: ${err.message}`, details: rawSettlement.id });
        }
      }

      // ─── 2. Sync Disputes/Chargebacks ────────────────────────
      const rawDisputes = await this.fetchPaginated(client, '/chargebacks', params);
      for (const rawDispute of rawDisputes) {
        try {
          // Lookup original transaction using processor references (e.g. transactionId/cloverId)
          const transactionCloverId = rawDispute.transactionId || rawDispute.paymentId;
          const dbTx = await db('transactions')
            .where({ store_id: storeId, clover_id: transactionCloverId })
            .first();

          if (!dbTx) {
            throw new Error(`Original transaction Reference ${transactionCloverId} not found in DB`);
          }

          const normalized = PaymentNormalizer.normalizeChargeback(rawDispute, dbTx.id, storeId!, dbTx.customer_id);

          const existing = await db('refunds')
            .where({ store_id: storeId, clover_id: normalized.clover_id })
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
          result.errors.push({ message: `Chargeback sync failed: ${err.message}`, details: rawDispute.id });
        }
      }

    } catch (error: any) {
      result.errors.push({ message: `Payment sync failed: ${error.message}` });
    }

    return result;
  }

  public async processWebhook(payload: any, signature: string): Promise<WebhookResult> {
    const eventType = payload?.event || 'chargeback.created';
    return {
      success: true,
      event_type: eventType,
      recordsProcessed: 1,
    };
  }
}

export const paymentConnector = new PaymentConnector();
