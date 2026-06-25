import request from 'supertest';
import app from '../src/index'; // The express app
import * as authService from '../src/modules/auth/services/auth.service';

// Mock the entire auth service
jest.mock('../src/modules/auth/services/auth.service');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const mockRegisterData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        franchise_name: 'John Franchise'
      };

      const mockResponse = {
        user: {
          id: 'mock-uuid',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'franchisor',
          franchise_id: 'mock-franchise-uuid',
          is_active: true,
          mfa_enabled: false
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          accessTokenExpiry: 900000,
          refreshTokenExpiry: 604800000
        }
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/auth/register')
        .send(mockRegisterData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.accessToken).toBe('mock-access-token');
    });

    it('should fail registration with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'weak', // Weak password
          franchise_name: 'John Franchise'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const mockLoginData = {
        email: 'john@example.com',
        password: 'Password123!'
      };

      const mockResponse = {
        user: {
          id: 'mock-uuid',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'franchisor',
          is_active: true,
          mfa_enabled: false
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          accessTokenExpiry: 900000,
          refreshTokenExpiry: 604800000
        }
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/auth/login')
        .send(mockLoginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('mock-access-token');
    });

    it('should require MFA if enabled', async () => {
      const mockLoginData = {
        email: 'mfa@example.com',
        password: 'Password123!'
      };

      const mockResponse = {
        user: {
          id: 'mock-uuid',
          email: 'mfa@example.com',
          first_name: 'Mfa',
          last_name: 'User',
          role: 'franchisee',
          is_active: true,
          mfa_enabled: true
        },
        requireMfa: true,
        mfaToken: 'mock-mfa-token'
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/auth/login')
        .send(mockLoginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requireMfa).toBe(true);
      expect(res.body.data.mfaToken).toBe('mock-mfa-token');
    });

    it('should handle invalid credentials', async () => {
      (authService.login as jest.Mock).mockRejectedValue({
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });
});
