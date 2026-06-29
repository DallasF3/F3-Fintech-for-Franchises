import axios from 'axios';
import { getDatabase } from '../../../shared/database/connection';
import crypto from 'crypto';

export class SalesforceOAuthService {
  private static readonly CLIENT_ID = process.env.SALESFORCE_CLIENT_ID || '';
  private static readonly CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET || '';
  private static readonly REDIRECT_URI = process.env.NODE_ENV === 'production' 
    ? 'https://backend-production-576e.up.railway.app/api/integrations/salesforce/callback'
    : 'http://localhost:3001/api/integrations/salesforce/callback';
  
  /**
   * Generates the OAuth authorization URL for Salesforce.
   */
  static generateAuthorizationUrl(franchiseId: string, storeId: string | null = null): { authorizationUrl: string; state: string } {
    const rawState = JSON.stringify({ franchiseId, storeId, nonce: crypto.randomBytes(16).toString('hex') });
    const state = Buffer.from(rawState).toString('base64');
    
    const baseUrl = 'https://login.salesforce.com/services/oauth2/authorize';
    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      state,
      // 'api' scope allows REST API access, 'refresh_token' allows offline access
      scope: 'api refresh_token',
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
    const tokenUrl = 'https://login.salesforce.com/services/oauth2/token';
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
        instance_url: response.data.instance_url,
      };
    } catch (error: any) {
      console.error('Salesforce Token Exchange Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error_description || 'Failed to exchange Salesforce authorization code');
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
    instanceUrl?: string
  ) {
    const db = getDatabase();
    
    // Encrypt credentials before saving
    const encryptionKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey), iv);
    
    const rawCredentials = JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    let encryptedCredentials = cipher.update(rawCredentials, 'utf8', 'hex');
    encryptedCredentials += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    const credentialsPayload = JSON.stringify({
      iv: iv.toString('hex'),
      data: encryptedCredentials,
      tag: authTag,
    });

    // Save instanceUrl in settings as it is required to make API calls
    const settingsPayload = JSON.stringify({
      instance_url: instanceUrl,
    });

    const existing = await db('integration_configs')
      .where({ franchise_id: franchiseId, type: 'salesforce' })
      .first();

    let integrationId: string;

    if (existing) {
      await db('integration_configs')
        .where({ id: existing.id })
        .update({
          status: 'connected',
          store_id: storeId,
          credentials: credentialsPayload,
          settings: settingsPayload,
          updated_at: new Date(),
        });
      integrationId = existing.id;
    } else {
      const [newRecord] = await db('integration_configs').insert({
        franchise_id: franchiseId,
        store_id: storeId,
        type: 'salesforce',
        status: 'connected',
        credentials: credentialsPayload,
        settings: settingsPayload,
        error_count: 0,
      }).returning('id');
      
      integrationId = newRecord.id;
    }

    return { integrationId };
  }
}
