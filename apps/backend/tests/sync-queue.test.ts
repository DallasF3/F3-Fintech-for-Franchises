import { queue } from '../src/shared/queue';
import { initializeSyncWorker } from '../src/modules/integration/queue/sync.worker';
import { initializeSyncScheduler } from '../src/modules/integration/queue/sync.scheduler';

// Mock the queue completely
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
jest.mock('../src/shared/database/connection', () => ({
  getDatabase: jest.fn().mockReturnValue(() => ({
    where: jest.fn().mockResolvedValue([
      { id: 'config-1', franchise_id: 'franchise-1', type: 'clover', status: 'connected' }
    ])
  }))
}));

describe('Sync Queue and Scheduler (pg-boss)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sync Scheduler', () => {
    it('should unschedule previous jobs before re-registering', async () => {
      await initializeSyncScheduler();
      expect(queue.unschedule).toHaveBeenCalledWith('integration/sync/cron_clover_delta');
      expect(queue.unschedule).toHaveBeenCalledWith('integration/sync/cron_clover_full');
      expect(queue.unschedule).toHaveBeenCalledWith('integration/sync/cron_payment');
      expect(queue.unschedule).toHaveBeenCalledWith('integration/sync/cron_crm');
    });

    it('should schedule orchestrator crons correctly', async () => {
      await initializeSyncScheduler();
      
      // Delta sync every 15 mins
      expect(queue.schedule).toHaveBeenCalledWith('orchestrator/clover_delta', '*/15 * * * *');
      
      // Full sync daily at 2am
      expect(queue.schedule).toHaveBeenCalledWith('orchestrator/clover_full', '0 2 * * *');
      
      // Payment sync daily at 6am
      expect(queue.schedule).toHaveBeenCalledWith('orchestrator/payment', '0 6 * * *');
      
      // CRM sync hourly
      expect(queue.schedule).toHaveBeenCalledWith('orchestrator/crm', '0 * * * *');
    });

    it('should register worker handlers for each orchestrator type', async () => {
      await initializeSyncScheduler();
      
      expect(queue.work).toHaveBeenCalledWith('orchestrator/clover_delta', expect.any(Function));
      expect(queue.work).toHaveBeenCalledWith('orchestrator/clover_full', expect.any(Function));
      expect(queue.work).toHaveBeenCalledWith('orchestrator/payment', expect.any(Function));
      expect(queue.work).toHaveBeenCalledWith('orchestrator/crm', expect.any(Function));
    });
  });

  describe('Sync Worker', () => {
    it('should register the main integration/sync worker with concurrency limits', async () => {
      await initializeSyncWorker();

      expect(queue.work).toHaveBeenCalledWith(
        'integration/sync', 
        { localConcurrency: 5 }, 
        expect.any(Function)
      );
    });
  });

  describe('DLQ Worker', () => {
    it('should register the DLQ worker to listen for permanent failures', async () => {
      const { initializeDlqWorker } = require('../src/modules/integration/queue/dlq.worker');
      await initializeDlqWorker();

      expect(queue.work).toHaveBeenCalledWith(
        'integration/dlq', 
        expect.any(Function)
      );
    });
  });
});
