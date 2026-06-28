import axios from 'axios';
import { CrmNormalizer } from '../src/modules/integration/services/crm.normalizer';
import { crmConnector } from '../src/modules/integration/services/crm.connector';
import { getDatabase } from '../src/shared/database/connection';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock database connection
jest.mock('../src/shared/database/connection', () => {
  let customerLookupResult: any = null;
  const queryBuilder: any = {
    _tableName: '',
    _whereArgs: null,
    where: jest.fn().mockImplementation(function(this: any, args: any) {
      this._whereArgs = args;
      return this;
    }),
    first: jest.fn().mockImplementation(function(this: any) {
      return Promise.resolve(customerLookupResult);
    }),
    insert: jest.fn().mockResolvedValue([1]),
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
    setLookupResult: (val: any) => {
      customerLookupResult = val;
    },
  };
});

describe('CRM Customer Normalizer', () => {
  it('should normalize name fields', () => {
    const raw = { name: 'John Doe', email: 'john@example.com' };
    const normalized = CrmNormalizer.normalizeCustomer(raw);
    expect(normalized.first_name).toBe('John');
    expect(normalized.last_name).toBe('Doe');
  });

  it('should parse points and visits correctly', () => {
    const raw = { name: 'John Doe', points: '1,500', visits: '12' };
    const normalized = CrmNormalizer.normalizeCustomer(raw);
    expect(normalized.loyalty_points).toBe(1500);
    expect(normalized.visit_count).toBe(12);
  });
});

describe('CRM Connector Ingestion & Sync', () => {
  const mockConfig: any = {
    id: 'mock-crm-config-id',
    franchise_id: 'mock-franchise-id',
    store_id: 'mock-store-id',
    type: 'crm',
    status: 'connected',
    credentials: { api_key: 'mock-api-key' },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully test connection', async () => {
    const mockAxiosInstance: any = {
      get: jest.fn().mockResolvedValue({
        data: { name: 'Universal CRM Test Account' },
      }),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    const result = await crmConnector.testConnection(mockConfig);

    expect(result.success).toBe(true);
    expect(result.merchantName).toBe('Universal CRM Test Account');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
  });

  it('should run full sync and insert new contacts if no match is found', async () => {
    const mockAxiosInstance: any = {
      get: jest.fn().mockResolvedValue({
        data: {
          contacts: [
            { id: 'CRM1', name: 'Alice Smith', email: 'alice@example.com', points: 100 },
          ],
        },
      }),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Set DB mock to return null (no matched customer found)
    const { setLookupResult } = require('../src/shared/database/connection');
    setLookupResult(null);

    const result = await crmConnector.fullSync(mockConfig, { batchSize: 100 });

    expect(result.recordsFetched).toBe(1);
    expect(result.recordsCreated).toBe(1);
    expect(result.recordsUpdated).toBe(0);
    expect(result.recordsFailed).toBe(0);
  });

  it('should merge CRM loyalty details with existing customer if email matches', async () => {
    const mockAxiosInstance: any = {
      get: jest.fn().mockResolvedValue({
        data: {
          contacts: [
            { id: 'CRM1', name: 'Alice Smith', email: 'alice@example.com', points: 250 },
          ],
        },
      }),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Set DB mock to simulate an existing matching customer
    const { setLookupResult } = require('../src/shared/database/connection');
    setLookupResult({ id: 'DB_CUST_123', email: 'alice@example.com', loyalty_points: 100 });

    const result = await crmConnector.fullSync(mockConfig, { batchSize: 100 });

    expect(result.recordsFetched).toBe(1);
    expect(result.recordsCreated).toBe(0);
    expect(result.recordsUpdated).toBe(1);
    expect(result.recordsFailed).toBe(0);
  });
});
