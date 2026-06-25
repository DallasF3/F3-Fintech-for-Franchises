import { logger } from '../src/shared/logger';

// Mock the queue completely so pg-boss (ESM module) doesn't break Jest
jest.mock('../src/shared/queue', () => ({
  initQueue: jest.fn().mockResolvedValue(true),
  pushJob: jest.fn().mockResolvedValue('mock-job-id'),
}));

// Disable logger output during tests to keep console clean
beforeAll(() => {
  logger.level = 'silent';
});

afterAll(() => {
  // Optional cleanup
});
