import { initializeWebhookWorker } from '../src/modules/integration/queue/webhook.worker';
import { queue } from '../src/shared/queue';
import { getDatabase } from '../src/shared/database/connection';

// Mock the queue
jest.mock('../src/shared/queue', () => ({
  queue: {
    work: jest.fn().mockResolvedValue('worker-id'),
    send: jest.fn().mockResolvedValue('job-id'),
    schedule: jest.fn().mockResolvedValue(true),
    unschedule: jest.fn().mockResolvedValue(true),
    createQueue: jest.fn().mockResolvedValue(true),
  }
}));

// Mock the database
const mockWhere = jest.fn();
const mockFirst = jest.fn();
const mockUpdate = jest.fn();
const mockInsert = jest.fn();

jest.mock('../src/shared/database/connection', () => ({
  getDatabase: jest.fn(() => {
    const db: any = () => ({
      where: mockWhere,
      insert: mockInsert,
      update: mockUpdate,
    });
    db.raw = jest.fn((str) => str);
    return db;
  }),
}));

describe('Webhook Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the queue and register the worker', async () => {
    await initializeWebhookWorker();
    expect(queue.createQueue).toHaveBeenCalledWith('integration/webhook');
    expect(queue.work).toHaveBeenCalledWith('integration/webhook', expect.any(Function));
  });

  it('should trigger delta sync for Clover webhooks', async () => {
    // Setup db mocks for this test
    mockWhere.mockReturnValue({
      first: mockFirst.mockResolvedValueOnce({
        id: 'event-123',
        source: 'clover',
        payload: { type: 'CREATE' },
        status: 'received'
      }).mockResolvedValueOnce({
        id: 'config-123',
        status: 'connected',
        franchise_id: 'franchise-123',
        type: 'clover'
      }),
      update: mockUpdate.mockResolvedValue(1)
    });

    await initializeWebhookWorker();
    
    // Extract the handler passed to queue.work
    const handler = (queue.work as jest.Mock).mock.calls[0][1];
    
    // Run the handler with a mock job
    await handler([{
      id: 'job-123',
      data: {
        integrationId: 'config-123',
        eventId: 'event-123'
      }
    }]);

    // Verify it sent a delta sync job
    expect(queue.send).toHaveBeenCalledWith('integration/sync', {
      integrationId: 'config-123',
      franchiseId: 'franchise-123',
      type: 'clover',
      syncType: 'delta'
    }, expect.any(Object));

    // Verify it marked the event as processed
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      status: 'processed'
    }));
  });
});
