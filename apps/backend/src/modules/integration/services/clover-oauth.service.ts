import crypto from 'crypto';
import axios from 'axios';
import { getDatabase } from '../../../shared/database/connection';
import { EncryptionService } from '../../../shared/encryption.service';

/**
 * Clover OAuth2 Service
 * 
 * Handles the full OAuth2 merchant authorization flow:
 * 1. Generate authorization URL with CSRF state
 * 2. Exchange authorization code for access token
 * 3. Store encrypted credentials in integration_configs
 * 4. Retrieve and decrypt credentials for API calls
 */

// In-memory store for OAuth state tokens (maps state → context)
// In production, use Redis or DB for this. Fine for single-instance dev.
const pendingOAuthStates = new Map<string, {
  franchiseId: string;
  storeId: string | null;
  createdAt: number;
}>();

// Clean up expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000;
  for (const [state, ctx] of pendingOAuthStates.entries()) {
    if (now - ctx.createdAt > TEN_MINUTES) {
      pendingOAuthStates.delete(state);
    }
  }
}, 10 * 60 * 1000);

export class CloverOAuthService {

  /**
   * Get the base URL for Clover based on environment.
   * Sandbox: https://sandbox.dev.clover.com
   * Production: https://api.clover.com
   */
  private static getBaseUrl(): string {
    const env = process.env.CLOVER_ENVIRONMENT || 'sandbox';
    return env === 'production'
      ? 'https://api.clover.com'
      : 'https://sandbox.dev.clover.com';
  }

  private static getAppId(): string {
    return process.env.CLOVER_APP_ID || '';
  }

  private static getAppSecret(): string {
    return process.env.CLOVER_APP_SECRET || '';
  }

  private static getCallbackUrl(): string {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}/api/integrations/clover/callback`;
  }

  // ─── Step 1: Generate Authorization URL ───────────────────────

  /**
   * Generate a Clover OAuth authorization URL for the merchant to visit.
   * Returns the URL and a state token for CSRF verification.
   */
  static generateAuthorizationUrl(franchiseId: string, storeId: string | null = null): {
    authorizationUrl: string;
    state: string;
  } {
    const appId = this.getAppId();
    if (!appId) {
      throw new Error(
        'CLOVER_APP_ID is not configured. Set it in your .env file. ' +
        'Register your app at https://sandbox.dev.clover.com/developer-home/create-account'
      );
    }

    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString('hex');
    pendingOAuthStates.set(state, {
      franchiseId,
      storeId,
      createdAt: Date.now(),
    });

    const baseUrl = this.getBaseUrl();
    const callbackUrl = this.getCallbackUrl();

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      state,
    });

    return {
      authorizationUrl: `${baseUrl}/oauth/v2/authorize?${params.toString()}`,
      state,
    };
  }

  // ─── Step 2: Validate State ───────────────────────────────────

  /**
   * Validate and consume the OAuth state token.
   * Returns the context (franchiseId, storeId) if valid.
   */
  static validateState(state: string): {
    franchiseId: string;
    storeId: string | null;
  } | null {
    const ctx = pendingOAuthStates.get(state);
    if (!ctx) return null;

    // Check expiry (10 minutes)
    const TEN_MINUTES = 10 * 60 * 1000;
    if (Date.now() - ctx.createdAt > TEN_MINUTES) {
      pendingOAuthStates.delete(state);
      return null;
    }

    // Consume the state (one-time use)
    pendingOAuthStates.delete(state);
    return { franchiseId: ctx.franchiseId, storeId: ctx.storeId };
  }

  // ─── Step 3: Exchange Code for Access Token ───────────────────

  /**
   * Exchange an authorization code from Clover for an access token.
   */
  static async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token?: string;
    access_token_expiration?: number;
  }> {
    const baseUrl = this.getBaseUrl();
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    if (!appId || !appSecret) {
      throw new Error(
        'CLOVER_APP_ID and CLOVER_APP_SECRET must be set in .env to exchange OAuth codes.'
      );
    }

    try {
      const response = await axios.post(`${baseUrl}/oauth/token`, null, {
        params: {
          client_id: appId,
          client_secret: appSecret,
          code,
        },
        timeout: 10000, // 10 second timeout
      });

      if (!response.data?.access_token) {
        throw new Error('Clover OAuth response did not contain an access_token');
      }

      return { 
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        access_token_expiration: response.data.access_token_expiration 
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Clover OAuth token exchange failed (${error.response.status}): ${
            error.response.data?.message || JSON.stringify(error.response.data)
          }`
        );
      }
      throw new Error(`Clover OAuth token exchange failed: ${error.message}`);
    }
  }

  // ─── Step 4: Store Encrypted Credentials ──────────────────────

  /**
   * Store or update Clover credentials in the integration_configs table.
   * Access token is encrypted with AES-256-GCM before storage.
   * Uses upsert to avoid duplicate rows.
   */
  static async storeCredentials(
    franchiseId: string,
    storeId: string | null,
    merchantId: string,
    accessToken: string,
    refreshToken?: string,
    expiration?: number
  ): Promise<{ integrationId: string }> {
    const db = getDatabase();

    // Encrypt the access token
    const encryptedToken = EncryptionService.encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? EncryptionService.encrypt(refreshToken) : null;

    const credentials = {
      merchant_id: merchantId,           // Not a secret — stored in plaintext
      access_token: encryptedToken,       // Encrypted with AES-256-GCM
      refresh_token: encryptedRefreshToken,
      expiration,
      connected_at: new Date().toISOString(),
    };

    // Check if a Clover integration already exists for this franchise (+store)
    const existingQuery = db('integration_configs')
      .where({ franchise_id: franchiseId, type: 'clover' });
    
    if (storeId) {
      existingQuery.andWhere({ store_id: storeId });
    } else {
      existingQuery.andWhereRaw('store_id IS NULL');
    }

    const existing = await existingQuery.first();

    if (existing) {
      // Update existing integration
      await db('integration_configs')
        .where({ id: existing.id })
        .update({
          credentials: JSON.stringify(credentials),
          status: 'connected',
          last_error: null,
          error_count: 0,
          updated_at: new Date(),
        });

      console.log(`✅ Updated Clover integration ${existing.id} for franchise ${franchiseId}`);
      return { integrationId: existing.id };
    } else {
      // Create new integration
      const [inserted] = await db('integration_configs')
        .insert({
          franchise_id: franchiseId,
          store_id: storeId,
          type: 'clover',
          status: 'connected',
          credentials: JSON.stringify(credentials),
          settings: JSON.stringify({
            sync_frequency: '15m',       // Delta sync every 15 minutes
            full_sync_time: '02:00',     // Full sync at 2 AM
          }),
          error_count: 0,
        })
        .returning('id');

      const integrationId = typeof inserted === 'object' ? inserted.id : inserted;
      console.log(`✅ Created Clover integration ${integrationId} for franchise ${franchiseId}`);
      return { integrationId };
    }
  }

  // ─── Helper: Get Decrypted Access Token ───────────────────────

  /**
   * Retrieve and decrypt the Clover access token for a given integration.
   * Used by CloverConnector when making API calls.
   */
  static async getDecryptedToken(integrationId: string): Promise<{
    accessToken: string;
    merchantId: string;
    refreshToken: string | null;
  }> {
    const db = getDatabase();
    const config = await db('integration_configs')
      .where({ id: integrationId, type: 'clover' })
      .first();

    if (!config) {
      throw new Error(`Clover integration ${integrationId} not found`);
    }

    const credentials = typeof config.credentials === 'string'
      ? JSON.parse(config.credentials)
      : config.credentials;

    const accessToken = EncryptionService.decrypt(credentials.access_token);
    const refreshToken = credentials.refresh_token ? EncryptionService.decrypt(credentials.refresh_token) : null;

    return {
      accessToken,
      merchantId: credentials.merchant_id,
      refreshToken,
    };
  }

  // ─── Step 5: Refresh Token ──────────────────────

  static async refreshAccessToken(integrationId: string): Promise<string> {
    const { refreshToken, merchantId } = await this.getDecryptedToken(integrationId);
    if (!refreshToken) {
      throw new Error(`Integration ${integrationId} does not have a refresh token`);
    }

    const baseUrl = this.getBaseUrl();
    const appId = this.getAppId();
    const appSecret = this.getAppSecret();

    try {
      const response = await axios.post(`${baseUrl}/oauth/token`, null, {
        params: {
          client_id: appId,
          client_secret: appSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
        timeout: 10000,
      });

      if (!response.data?.access_token) {
        throw new Error('Clover OAuth refresh response did not contain an access_token');
      }

      const db = getDatabase();
      const config = await db('integration_configs').where({ id: integrationId }).first();
      
      const newCredentials = {
        ...(typeof config.credentials === 'string' ? JSON.parse(config.credentials) : config.credentials),
        access_token: EncryptionService.encrypt(response.data.access_token),
      };

      if (response.data.refresh_token) {
         newCredentials.refresh_token = EncryptionService.encrypt(response.data.refresh_token);
      }
      if (response.data.access_token_expiration) {
         newCredentials.expiration = response.data.access_token_expiration;
      }

      await db('integration_configs')
        .where({ id: integrationId })
        .update({
          credentials: JSON.stringify(newCredentials),
          updated_at: new Date(),
        });

      return response.data.access_token;
    } catch (error: any) {
      throw new Error(`Clover OAuth token refresh failed: ${error.message}`);
    }
  }

  // ─── Helper: List Integrations for Franchise ──────────────────

  /**
   * List all integrations for a franchise (used by the controller).
   */
  static async listIntegrations(franchiseId: string) {
    const db = getDatabase();
    const integrations = await db('integration_configs')
      .where({ franchise_id: franchiseId })
      .select(
        'id', 'franchise_id', 'store_id', 'type', 'status',
        'last_sync_at', 'last_error', 'error_count',
        'settings', 'created_at', 'updated_at'
      );
      // Note: credentials are NOT selected — never return secrets to the frontend

    return integrations;
  }
}
