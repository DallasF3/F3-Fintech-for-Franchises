import axios from 'axios';
import { CloverNormalizer } from '../src/modules/integration/services/clover.normalizer';
import { cloverConnector } from '../src/modules/integration/services/clover.connector';
import { CloverOAuthService } from '../src/modules/integration/services/clover-oauth.service';
import { getDatabase } from '../src/shared/database/connection';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../src/shared/database/connection', () => {
  let transactionQueryCount = 0;
  const queryBuilder: any = {
    _tableName: '',
    _whereArgs: null,
    where: jest.fn().mockImplementation(function(this: any, args: any) {
      this._whereArgs = args;
      return this;
    }),
    first: jest.fn().mockImplementation(function(this: any) {
      if (this._tableName === 'transactions' && this._whereArgs?.clover_id === 'P1') {
        transactionQueryCount++;
        if (transactionQueryCount > 1) {
          return Promise.resolve({ id: 'P1_DB', customer_id: 'C1_DB' });
        }
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
    getDatabase: () => {
      transactionQueryCount = 0;
      return mockKnex;
    },
  };
});

describe('Clover POS Normalizer', () => {
  it('should normalize amounts from cents to dollars', () => {
    expect(CloverNormalizer.normalizeAmount(100)).toBe(1.0);
    expect(CloverNormalizer.normalizeAmount(550)).toBe(5.5);
    expect(CloverNormalizer.normalizeAmount(undefined)).toBe(0);
  });

  it('should normalize date from epoch ms', () => {
    const epoch = 1719500000000; // June 2024
    const date = CloverNormalizer.normalizeDate(epoch);
    expect(date).toBeInstanceOf(Date);
    expect(date?.getTime()).toBe(epoch);
    expect(CloverNormalizer.normalizeDate(undefined)).toBeNull();
  });

  it('should normalize transaction status from Clover results', () => {
    expect(CloverNormalizer.normalizeStatus('SUCCESS')).toBe('completed');
    expect(CloverNormalizer.normalizeStatus('FAIL')).toBe('failed');
    expect(CloverNormalizer.normalizeStatus('AUTH')).toBe('pending');
    expect(CloverNormalizer.normalizeStatus('VOIDED')).toBe('voided');
    expect(CloverNormalizer.normalizeStatus('UNKNOWN')).toBe('completed'); // Default fallback
  });

  it('should normalize phone numbers', () => {
    expect(CloverNormalizer.normalizePhone('(555) 123-4567')).toBe('+15551234567');
    expect(CloverNormalizer.normalizePhone('15551234567')).toBe('+15551234567');
    expect(CloverNormalizer.normalizePhone('5551234567')).toBe('+15551234567');
    expect(CloverNormalizer.normalizePhone(undefined)).toBeNull();
  });

  it('should normalize emails', () => {
    expect(CloverNormalizer.normalizeEmail('  TEST@Example.com ')).toBe('test@example.com');
    expect(CloverNormalizer.normalizeEmail(undefined)).toBeNull();
  });
});

describe('Clover POS Connector Ingestion & Sync', () => {
  const mockConfig: any = {
    id: 'mock-config-id',
    franchise_id: 'mock-franchise-id',
    store_id: 'mock-store-id',
    type: 'clover',
    status: 'connected',
    credentials: {},
  };

  beforeAll(() => {
    // Mock getDecryptedToken
    jest.spyOn(CloverOAuthService, 'getDecryptedToken').mockResolvedValue({
      accessToken: 'mock-access-token',
      merchantId: 'mock-merchant-id',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully test connection', async () => {
    const mockAxiosInstance: any = {
      get: jest.fn().mockResolvedValue({
        data: { name: 'Mock Test Merchant' },
      }),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const result = await cloverConnector.testConnection(mockConfig);

    expect(result.success).toBe(true);
    expect(result.merchantName).toBe('Mock Test Merchant');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/merchants/mock-merchant-id');
  });

  it('should run full sync and insert fetched customers, transactions, and refunds', async () => {
    const mockAxiosInstance: any = {
      get: jest.fn().mockImplementation((url: string) => {
        if (url.includes('/customers')) {
          return Promise.resolve({
            data: {
              elements: [
                { id: 'C1', firstName: 'Alice', emailAddresses: [{ emailAddress: 'alice@example.com' }] },
              ],
            },
          });
        }
        if (url.includes('/payments')) {
          return Promise.resolve({
            data: {
              elements: [
                { id: 'P1', amount: 1500, result: 'SUCCESS', customer: { id: 'C1' }, createdTime: Date.now() },
              ],
            },
          });
        }
        if (url.includes('/refunds')) {
          return Promise.resolve({
            data: {
              elements: [
                { id: 'R1', amount: 500, payment: { id: 'P1' }, createdTime: Date.now() },
              ],
            },
          });
        }
        return Promise.reject(new Error(`Not mocked: ${url}`));
      }),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const db = getDatabase();

    const result = await cloverConnector.fullSync(mockConfig, { batchSize: 100 });

    expect(result.recordsFetched).toBe(3); // 1 customer, 1 payment, 1 refund
    expect(result.recordsCreated).toBe(3);
    expect(result.recordsFailed).toBe(0);
    expect(result.errors.length).toBe(0);
  });
});
