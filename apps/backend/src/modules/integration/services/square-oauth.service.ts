import crypto from 'crypto';
import axios from 'axios';
import { getDatabase } from '../../../shared/database/connection';
import { EncryptionService } from '../../../shared/encryption.service';

const pendingOAuthStates = new Map<string, {
  franchiseId: string;
  storeId: string | null;
  createdAt: number;
}>();

setInterval(() => {
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000;
  for (const [state, ctx] of pendingOAuthStates.entries()) {
    if (now - ctx.createdAt > TEN_MINUTES) {
      pendingOAuthStates.delete(state);
    }
  }
}, 10 * 60 * 1000);

export class SquareOAuthService {
  private static getBaseUrl(): string {
    const env = process.env.SQUARE_ENVIRONMENT || 'sandbox';
    return env === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';
  }

  private static getAppId(): string {
    return process.env.SQUARE_APP_ID || '';
  }

  private static getAppSecret(): string {
    return process.env.SQUARE_APP_SECRET || '';
  }

  private static getCallbackUrl(): string {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}/api/integrations/square/callback`;
  }

  static generateAuthorizationUrl(franchiseId: string, storeId: string | null = null): {
    authorizationUrl: string;
    state: string;
  } {
    const appId = this.getAppId();
    if (!appId) {
      throw new Error('SQUARE_APP_ID is not configured in .env');
    }

    const state = crypto.randomBytes(32).toString('hex');
    pendingOAuthStates.set(state, {
      franchiseId,
      storeId,
      createdAt: Date.now(),
    });

    const baseUrl = this.getBaseUrl();
    const params = new URLSearchParams({
      client_id: appId,
      state,
      scope: 'CUSTOMERS_READ PAYMENTS_READ ORDERS_READ MERCHANT_PROFILE_READ',
      session: 'false',
    });

    return {
      authorizationUrl: `${baseUrl}/oauth2/authorize?${params.toString()}`,
      state,
    };
  }

  static validateState(state: string): { franchiseId: string; storeId: string | null; } | null {
    const ctx = pendingOAuthStates.get(state);
    if (!ctx) return null;

    const TEN_MINUTES = 10 * 60 * 1000;
    if (Date.now() - ctx.createdAt > TEN_MINUTES) {
      pendingOAuthStates.delete(state);
      return null;
    }

    pendingOAuthStates.delete(state);
    return { franchiseId: ctx.franchiseId, storeId: ctx.storeId };
  }

  static async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
    merchant_id: string;
  }> {
    const baseUrl = this.getBaseUrl();
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    if (!appId || !appSecret) {
      throw new Error('SQUARE_APP_ID and SQUARE_APP_SECRET must be set');
    }

    try {
      const response = await axios.post(`${baseUrl}/oauth2/token`, {
        client_id: appId,
        client_secret: appSecret,
        code,
        grant_type: 'authorization_code'
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      const data = response.data;
      if (!data?.access_token) {
        throw new Error('Square OAuth response missing access_token');
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
        merchant_id: data.merchant_id
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Square token exchange failed: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`Square token exchange failed: ${error.message}`);
    }
  }

  static async storeCredentials(
    franchiseId: string,
    storeId: string | null,
    merchantId: string,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: string
  ): Promise<{ integrationId: string }> {
    const db = getDatabase();

    const encryptedToken = EncryptionService.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? EncryptionService.encrypt(refreshToken) : null;

    const credentials = {
      merchant_id: merchantId,
      access_token: encryptedToken,
      refresh_token: encryptedRefreshToken,
      expires_at: expiresAt,
      connected_at: new Date().toISOString(),
    };

    const existingQuery = db('integration_configs')
      .where({ franchise_id: franchiseId, type: 'square' });
    
    if (storeId) {
      existingQuery.andWhere({ store_id: storeId });
    } else {
      existingQuery.andWhereRaw('store_id IS NULL');
    }

    const existing = await existingQuery.first();

    if (existing) {
      await db('integration_configs')
        .where({ id: existing.id })
        .update({
          credentials: JSON.stringify(credentials),
          status: 'connected',
          last_error: null,
          error_count: 0,
          updated_at: new Date(),
        });
      return { integrationId: existing.id };
    } else {
      const [inserted] = await db('integration_configs')
        .insert({
          franchise_id: franchiseId,
          store_id: storeId,
          type: 'square',
          status: 'connected',
          credentials: JSON.stringify(credentials),
          settings: JSON.stringify({
            sync_frequency: '15m',
            full_sync_time: '02:00',
          }),
          error_count: 0,
        })
        .returning('id');

      const integrationId = typeof inserted === 'object' ? inserted.id : inserted;
      return { integrationId };
    }
  }
}
