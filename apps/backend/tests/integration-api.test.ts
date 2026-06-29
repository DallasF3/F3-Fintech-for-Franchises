import * as dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import app from '../src/index'; 
import { getDatabase, initializeDatabase } from '../src/shared/database/connection';
import { generateTokenPair } from '../src/modules/auth/services/token.service';
import { v4 as uuidv4 } from 'uuid';
import { Knex } from 'knex';

describe('Integration Management API (RBAC)', () => {
  let db: Knex;
  let adminToken: string;
  let franchisorToken: string;
  let franchiseeToken: string;
  
  let franchiseId: string;
  let storeId: string;
  let integrationId: string;

  beforeAll(async () => {
    await initializeDatabase();
    db = getDatabase();
    
    // Clean up
    await db('sync_runs').del();
    await db('integration_configs').del();
    await db('users').del();
    await db('stores').del();
    await db('franchises').del();

    // 1. Create Franchise & Store
    const [franchise] = await db('franchises').insert({
      id: uuidv4(),
      name: 'Test RBAC Franchise',
      timezone: 'UTC'
    }).returning('id');
    franchiseId = franchise.id || franchise;

    const [store] = await db('stores').insert({
      id: uuidv4(),
      franchise_id: franchiseId,
      name: 'Test Store'
    }).returning('id');
    storeId = store.id || store;

    // 2. Create Users
    const [adminUser] = await db('users').insert({
      id: uuidv4(),
      email: 'admin-rbac@test.com',
      password_hash: 'hash',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
    }).returning('id');

    const [franchisorUser] = await db('users').insert({
      id: uuidv4(),
      email: 'franchisor-rbac@test.com',
      password_hash: 'hash',
      first_name: 'Franchisor',
      last_name: 'User',
      role: 'franchisor',
      franchise_id: franchiseId
    }).returning('id');

    const [franchiseeUser] = await db('users').insert({
      id: uuidv4(),
      email: 'franchisee-rbac@test.com',
      password_hash: 'hash',
      first_name: 'Franchisee',
      last_name: 'User',
      role: 'franchisee',
      franchise_id: franchiseId,
      store_id: storeId
    }).returning('id');

    // Generate JWTs
    const adminTokens = await generateTokenPair(
      adminUser.id || adminUser, 'admin-rbac@test.com', 'admin', undefined
    );
    adminToken = adminTokens.accessToken;
    const franchisorTokens = await generateTokenPair(
      franchisorUser.id || franchisorUser, 'franchisor-rbac@test.com', 'franchisor', franchiseId
    );
    franchisorToken = franchisorTokens.accessToken;

    const franchiseeTokens = await generateTokenPair(
      franchiseeUser.id || franchiseeUser, 'franchisee-rbac@test.com', 'franchisee', franchiseId
    );
    franchiseeToken = franchiseeTokens.accessToken;

    // 3. Create an Integration Config
    const [config] = await db('integration_configs').insert({
      id: uuidv4(),
      franchise_id: franchiseId,
      store_id: storeId,
      type: 'crm',
      status: 'connected',
      credentials: JSON.stringify({ api_key: 'test' }),
      settings: JSON.stringify({}),
    }).returning('id');
    integrationId = config.id || config;

    // 4. Create Mock Sync History
    await db('sync_runs').insert({
      id: uuidv4(),
      integration_id: integrationId,
      sync_type: 'full',
      status: 'completed',
      records_fetched: 10,
      records_created: 5,
      records_updated: 5,
      records_failed: 0,
    });
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('GET /api/integrations/:id/history', () => {
    it('Franchisor should be able to get history for their integration', async () => {
      const res = await request(app)
        .get(`/api/integrations/${integrationId}/history`)
        .set('Authorization', `Bearer ${franchisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].records_fetched).toBe(10);
    });

    it('Should return 401 if unauthorized', async () => {
      const res = await request(app).get(`/api/integrations/${integrationId}/history`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/integrations/:id/test', () => {
    it('Franchisee should be able to test connection', async () => {
      const res = await request(app)
        .post(`/api/integrations/${integrationId}/test`)
        .set('Authorization', `Bearer ${franchiseeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('DELETE /api/integrations/:id', () => {
    it('Should not let a user from another franchise delete it', async () => {
      // Create a rogue user
      const rogueTokens = await generateTokenPair(
        uuidv4(), 'rogue@test.com', 'franchisor', uuidv4()
      );
      const rogueToken = rogueTokens.accessToken;

      const res = await request(app)
        .delete(`/api/integrations/${integrationId}`)
        .set('Authorization', `Bearer ${rogueToken}`);

      expect(res.status).toBe(404); // Config not found for that franchise
    });

    it('Franchisor should successfully delete/disconnect the integration', async () => {
      const res = await request(app)
        .delete(`/api/integrations/${integrationId}`)
        .set('Authorization', `Bearer ${franchisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it's gone
      const config = await db('integration_configs').where({ id: integrationId }).first();
      expect(config).toBeUndefined();
    });
  });
});
