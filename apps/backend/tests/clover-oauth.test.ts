import request from 'supertest';
import app from '../src/index'; // The express app
import { CloverOAuthService } from '../src/modules/integration/services/clover-oauth.service';
import * as jwt from 'jsonwebtoken';

describe('Clover OAuth2 Endpoints', () => {
  let mockToken: string;

  beforeAll(() => {
    // Set mock env variables for Clover OAuth
    process.env.CLOVER_APP_ID = 'mock-clover-app-id';
    process.env.CLOVER_APP_SECRET = 'mock-clover-app-secret';

    // Mock Clover token exchange service call
    jest.spyOn(CloverOAuthService, 'exchangeCodeForToken').mockResolvedValue({
      access_token: 'mock-clover-access-token'
    });

    // Mock Clover credentials storing to avoid database dependencies in unit tests
    jest.spyOn(CloverOAuthService, 'storeCredentials').mockResolvedValue({
      integrationId: 'mock-integration-id'
    });

    // Generate a valid mock JWT token for authentication
    const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    mockToken = jwt.sign(
      { userId: 'test-user-id', email: 'test@example.com', role: 'franchisor', franchiseId: 'test-franchise-id' },
      secret,
      { expiresIn: '15m' }
    );
  });

  describe('POST /api/integrations/clover/connect', () => {
    it('should fail with 401 when unauthorized', async () => {
      const res = await request(app)
        .post('/api/integrations/clover/connect')
        .send();

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should generate Clover authorization URL and return state when authenticated', async () => {
      const res = await request(app)
        .post('/api/integrations/clover/connect')
        .set('Authorization', `Bearer ${mockToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.redirectUrl).toBeDefined();
      expect(res.body.state).toBeDefined();
    });
  });

  describe('GET /api/integrations/clover/callback', () => {
    it('should return 400 if authorization code is missing', async () => {
      const res = await request(app)
        .get('/api/integrations/clover/callback')
        .query({ merchant_id: 'MID123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Missing authorization code');
    });

    it('should return 400 if merchant_id is missing', async () => {
      const res = await request(app)
        .get('/api/integrations/clover/callback')
        .query({ code: 'CODE123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Missing merchant_id');
    });

    it('should process callback, simulate token exchange, and redirect back to frontend', async () => {
      // 1. Generate auth URL to set up state context
      const { state } = CloverOAuthService.generateAuthorizationUrl('test-franchise-id');

      // 2. Perform callback using generated state
      const res = await request(app)
        .get('/api/integrations/clover/callback')
        .query({
          code: 'CODE123',
          merchant_id: 'MID123',
          state: state
        });

      // It redirects to the frontend integrations dashboard
      expect(res.status).toBe(302);
      expect(res.header.location).toContain('/dashboard/integrations?connected=clover');
    });
  });
});
