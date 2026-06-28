import axios from 'axios';
import { PaymentNormalizer } from '../src/modules/integration/services/payment.normalizer';
import { paymentConnector } from '../src/modules/integration/services/payment.connector';
import { getDatabase } from '../src/shared/database/connection';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock database connection
jest.mock('../src/shared/database/connection', () => {
  let transactionLookupResult: any = null;
  let settlementLookupResult: any = null;
  const queryBuilder: any = {
    _tableName: '',
    _whereArgs: null,
    where: jest.fn().mockImplementation(function(this: any, args: any) {
      this._whereArgs = args;
      return this;
    }),
    first: jest.fn().mockImplementation(function(this: any) {
      if (this._tableName === 'transactions') {
        return Promise.resolve(transactionLookupResult);
      }
      if (this._tableName === 'settlements') {
        return Promise.resolve(settlementLookupResult);
      }
      return Promise.resolve(null);
    }),
    insert: jest.fn().mockReturnThis(),
    onConflict: jest.fn().mockReturnThis(),
    merge: jest.fn().mockResolvedValue([1]),
    update: jest.fn().mockResolvedValue(1),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
  };
  const mockKnex = jest.fn().mockImplementation((tableName: string) => {
    queryBuilder._tableName = tableName;
    return queryBuilder;
  });
  return {
    getDatabase: () => mockKnex,
    setTransactionLookup: (val: any) => {
      transactionLookupResult = val;
    },
    setSettlementLookup: (val: any) => {
      settlementLookupResult = val;
    },
  };
});

describe('Payment Settlement Normalizer', () => {
  it('should normalize cents to dollars', () => {
    expect(PaymentNormalizer.normalizeAmount(1500)).toBe(15);
    expect(PaymentNormalizer.normalizeAmount(0)).toBe(0);
  });

  it('should format raw settlement to database schema', () => {
    const raw = {
      settlementId: 'SET-999',
      amount: 10000,
      fees: 250,
      status: 'PAID',
      fundedTime: 1672531200000, // Jan 1 2023
    };
    const normalized = PaymentNormalizer.normalizeSettlement(raw, 'store-123');
    expect(normalized.external_id).toBe('SET-999');
    expect(normalized.gross_amount).toBe(100);
    expect(normalized.fees).toBe(2.5);
    expect(normalized.net_amount).toBe(97.5);
    expect(normalized.status).toBe('funded');
  });
});

describe('Payment Connector Ingestion & Sync', () => {
  const mockConfig: any = {
    id: 'mock-payment-config-id',
    franchise_id: 'mock-franchise-id',
    store_id: 'mock-store-id',
    type: 'payment',
    status: 'connected',
    credentials: { api_key: 'mock-api-key' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully test connection', async () => {
    const mockAxiosInstance: any = {
      get: jest.fn().mockResolvedValue({
        data: { name: 'iAccess Sandbox Merchant Account' },
      }),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const result = await paymentConnector.testConnection(mockConfig);

    expect(result.success).toBe(true);
    expect(result.merchantName).toBe('iAccess Sandbox Merchant Account');
  });

  it('should run full sync and insert fetched settlements and chargebacks', async () => {
    const mockAxiosInstance: any = {
      get: jest.fn().mockImplementation((url: string) => {
        if (url.includes('/settlements')) {
          return Promise.resolve({
            data: {
              settlements: [
                { settlementId: 'SET1', amount: 50000, status: 'PAID' },
              ],
            },
          });
        }
        if (url.includes('/chargebacks')) {
          return Promise.resolve({
            data: {
              disputes: [
                { disputeId: 'DISP1', amount: 5000, transactionId: 'TX1' },
              ],
            },
          });
        }
        return Promise.reject(new Error(`Not mocked: ${url}`));
      }),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Setup mocks
    const dbConnection = require('../src/shared/database/connection');
    dbConnection.setSettlementLookup(null); // New settlement
    dbConnection.setTransactionLookup({ id: 'DB_TX_99', clover_id: 'TX1', customer_id: 'CUST1' }); // Matched original transaction

    const result = await paymentConnector.fullSync(mockConfig, { batchSize: 100 });

    expect(result.recordsFetched).toBe(2); // 1 settlement, 1 chargeback
    expect(result.recordsCreated).toBe(2);
    expect(result.recordsFailed).toBe(0);
    expect(result.errors.length).toBe(0);
  });
});
