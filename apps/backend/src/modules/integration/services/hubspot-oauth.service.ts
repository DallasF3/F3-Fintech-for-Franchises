import axios from 'axios';
import { getDatabase } from '../../../shared/database/connection';
import crypto from 'crypto';
import { env } from 'process';

export class HubSpotOAuthService {
  private static readonly CLIENT_ID = process.env.HUBSPOT_CLIENT_ID || '';
  private static readonly CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET || '';
  // In production, this must match exactly what is configured in the HubSpot App
  private static readonly REDIRECT_URI = process.env.NODE_ENV === 'production' 
    ? 'https://backend-production-576e.up.railway.app/api/integrations/hubspot/callback'
    : 'http://localhost:3001/api/integrations/hubspot/callback';
  
  private static readonly SCOPES = 'crm.objects.contacts.read crm.objects.contacts.write';

  /**
   * Generates the OAuth authorization URL for HubSpot.
   */
  static generateAuthorizationUrl(franchiseId: string, storeId: string | null = null): { authorizationUrl: string; state: string } {
    // Generate a secure state token
    const rawState = JSON.stringify({ franchiseId, storeId, nonce: crypto.randomBytes(16).toString('hex') });
    // In a real app, you should sign or encrypt this state string to prevent tampering, 
    // or store the nonce in the DB/session. For simplicity in this PRD, we base64 encode it.
    const state = Buffer.from(rawState).toString('base64');
    
    // HubSpot OAuth URL
    const baseUrl = 'https://app.hubspot.com/oauth/authorize';
    const queryParams = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPES,
      state,
    });

    return {
      authorizationUrl: `${baseUrl}?${queryParams.toString()}`,
      state,
    };
  }

  /**
   * Validates and decodes the state parameter.
   */
  static validateState(state: string): { franchiseId: string; storeId: string | null } | null {
    try {
      const decoded = Buffer.from(state, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.franchiseId) {
        return { franchiseId: parsed.franchiseId, storeId: parsed.storeId || null };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Exchanges the authorization code for access and refresh tokens.
   */
  static async exchangeCodeForToken(code: string) {
    const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.CLIENT_ID,
      client_secret: this.CLIENT_SECRET,
      redirect_uri: this.REDIRECT_URI,
      code,
    });

    try {
      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
      };
    } catch (error: any) {
      console.error('HubSpot Token Exchange Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to exchange HubSpot authorization code');
    }
  }

  /**
   * Refreshes an expired access token using the refresh token.
   */
  static async refreshToken(refreshToken: string) {
    const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.CLIENT_ID,
      client_secret: this.CLIENT_SECRET,
      refresh_token: refreshToken,
    });

    try {
      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
      };
    } catch (error: any) {
      console.error('HubSpot Token Refresh Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to refresh HubSpot access token');
    }
  }

  /**
   * Stores the encrypted credentials in the database.
   */
  static async storeCredentials(
    franchiseId: string,
    storeId: string | null,
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ) {
    const db = getDatabase();
    
    // Encrypt credentials before saving
    const encryptionKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey), iv);
    
    const rawCredentials = JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresIn ? Date.now() + (expiresIn * 1000) : undefined,
    });

    let encryptedCredentials = cipher.update(rawCredentials, 'utf8', 'hex');
    encryptedCredentials += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    const credentialsPayload = JSON.stringify({
      iv: iv.toString('hex'),
      data: encryptedCredentials,
      tag: authTag,
    });

    // Check if a hubspot config already exists for this franchise
    const existing = await db('integration_configs')
      .where({ franchise_id: franchiseId, type: 'hubspot' })
      .first();

    let integrationId: string;

    if (existing) {
      await db('integration_configs')
        .where({ id: existing.id })
        .update({
          status: 'connected',
          store_id: storeId,
          credentials: credentialsPayload,
          updated_at: new Date(),
        });
      integrationId = existing.id;
    } else {
      const [newRecord] = await db('integration_configs').insert({
        franchise_id: franchiseId,
        store_id: storeId,
        type: 'hubspot',
        status: 'connected',
        credentials: credentialsPayload,
        error_count: 0,
      }).returning('id');
      
      integrationId = newRecord.id;
    }

    return { integrationId };
  }
}
