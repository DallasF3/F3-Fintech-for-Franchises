import { Request, Response } from 'express';
import { cloverConnector } from '../services/clover.connector';
import { webhookReceiver } from '../services/webhook-receiver';
import { CloverOAuthService } from '../services/clover-oauth.service';
import { SquareOAuthService } from '../services/square-oauth.service';
import { SalesforceOAuthService } from '../services/salesforce-oauth.service';
import { AuthenticatedRequest } from '../../../middlewares/authenticate.middleware';
import { getDatabase } from '../../../shared/database/connection';


export class IntegrationController {

  /**
   * POST /api/integrations/clover/connect
   * 
   * Generates a Clover OAuth authorization URL for the merchant.
   * Requires JWT authentication (franchisor or admin role).
   * 
   * Request body (optional):
   *   { store_id?: string }    — If connecting a specific store
   * 
   * Response:
   *   { success: true, redirectUrl: string, state: string }
   */
  public async connectClover(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      let franchiseId = user.franchiseId;
      if (!franchiseId) {
        const db = getDatabase();
        const firstFranchise = await db('franchises').first();
        if (firstFranchise) {
          franchiseId = firstFranchise.id;
        } else {
          return res.status(400).json({
            success: false,
            error: 'No franchise associated with your account. Contact your administrator.',
          });
        }
      }

      const storeId = req.body?.store_id || null;

      const { authorizationUrl, state } = CloverOAuthService.generateAuthorizationUrl(
        franchiseId!,
        storeId
      );

      console.log(`🔗 Clover OAuth URL generated for franchise ${franchiseId}`);

      res.json({
        success: true,
        data: {
          redirectUrl: authorizationUrl,
          state,
        },
        message: 'Redirect the merchant to this URL to authorize Clover access.',
      });
    } catch (error: any) {
      console.error('Clover connect error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate Clover authorization URL',
      });
    }
  }

  /**
   * GET /api/integrations/clover/callback?code=XXX&merchant_id=YYY&state=ZZZ
   * 
   * OAuth callback from Clover after merchant authorizes.
   * Exchanges the code for an access token and stores encrypted credentials.
   * 
   * This endpoint is NOT authenticated (Clover redirects the browser here).
   */
  public async cloverCallback(req: Request, res: Response) {
    try {
      const { code, merchant_id, state } = req.query as {
        code?: string;
        merchant_id?: string;
        state?: string;
      };

      // Validate required params
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'Missing authorization code from Clover',
        });
      }

      if (!merchant_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing merchant_id from Clover',
        });
      }

      // Validate CSRF state
      let franchiseId: string;
      let storeId: string | null = null;

      if (state) {
        const stateContext = CloverOAuthService.validateState(state);
        if (!stateContext) {
          return res.status(400).json({
            success: false,
            error: 'Invalid or expired OAuth state. Please restart the connection process.',
          });
        }
        franchiseId = stateContext.franchiseId;
        storeId = stateContext.storeId;
      } else {
        // No state provided — for dev/testing, use a fallback
        // In production, this should always reject
        if (process.env.NODE_ENV === 'production') {
          return res.status(400).json({
            success: false,
            error: 'Missing state parameter. CSRF protection requires state.',
          });
        }
        // Dev fallback: find the first franchise in the DB
        const { getDatabase } = require('../../../shared/database/connection');
        const db = getDatabase();
        const firstFranchise = await db('franchises').first();
        if (!firstFranchise) {
          return res.status(400).json({
            success: false,
            error: 'No franchises exist in the database. Create one first.',
          });
        }
        franchiseId = firstFranchise.id;
        console.warn('⚠️  Dev mode: Using first franchise as fallback (no state param)');
      }

      // Exchange code for access token
      let accessToken: string;
      let refreshToken: string | undefined;
      let expiration: number | undefined;
      const appId = process.env.CLOVER_APP_ID;

      if (!appId || code.startsWith('mock_')) {
        // No Clover credentials configured or mock code used — simulate for testing
        console.log('⚠️  Simulating token exchange for dev/test code.');
        accessToken = `simulated-token-${Date.now()}`;
      } else {
        const tokenResponse = await CloverOAuthService.exchangeCodeForToken(code);
        accessToken = tokenResponse.access_token;
        refreshToken = tokenResponse.refresh_token;
        expiration = tokenResponse.access_token_expiration;
      }

      // Store encrypted credentials
      const { integrationId } = await CloverOAuthService.storeCredentials(
        franchiseId,
        storeId,
        merchant_id,
        accessToken,
        refreshToken,
        expiration
      );

      console.log(`✅ Clover connected! Integration ID: ${integrationId}, Merchant: ${merchant_id}`);

      // In a real app, redirect to the frontend integration page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectTo = `${frontendUrl}/dashboard/integrations?connected=clover&integration_id=${integrationId}`;

      // For API testing, return JSON. For browser redirect, use res.redirect().
      if (req.headers.accept?.includes('application/json')) {
        return res.json({
          success: true,
          message: 'Clover connected successfully',
          data: {
            integrationId,
            merchantId: merchant_id,
            status: 'connected',
          },
        });
      }

      // Browser redirect to frontend
      res.redirect(redirectTo);
    } catch (error: any) {
      console.error('Clover callback error:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to complete Clover connection',
      });
    }
  }

  /**
   * POST /api/integrations/square/connect
   */
  public async connectSquare(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      let franchiseId = user.franchiseId;
      if (!franchiseId) {
        const db = getDatabase();
        const firstFranchise = await db('franchises').first();
        if (firstFranchise) {
          franchiseId = firstFranchise.id;
        } else {
          return res.status(400).json({ success: false, error: 'No franchise associated.' });
        }
      }

      const storeId = req.body?.store_id || null;

      const { authorizationUrl, state } = SquareOAuthService.generateAuthorizationUrl(
        franchiseId!,
        storeId
      );

      console.log(`🔗 Square OAuth URL generated for franchise ${franchiseId}`);

      res.json({
        success: true,
        data: {
          redirectUrl: authorizationUrl,
          state,
        },
      });
    } catch (error: any) {
      console.error('Square connect error:', error.message);
      res.status(500).json({ success: false, error: error.message || 'Failed to generate Square URL' });
    }
  }

  /**
   * GET /api/integrations/square/callback
   */
  public async squareCallback(req: Request, res: Response) {
    try {
      const { code, state, error, error_description } = req.query as {
        code?: string;
        state?: string;
        error?: string;
        error_description?: string;
      };

      if (error) {
        return res.status(400).json({ success: false, error: error_description || error });
      }

      if (!code) {
        return res.status(400).json({ success: false, error: 'Missing authorization code from Square' });
      }

      let franchiseId: string;
      let storeId: string | null = null;

      if (state) {
        const stateContext = SquareOAuthService.validateState(state);
        if (!stateContext) {
          return res.status(400).json({ success: false, error: 'Invalid or expired OAuth state.' });
        }
        franchiseId = stateContext.franchiseId;
        storeId = stateContext.storeId;
      } else {
        if (process.env.NODE_ENV === 'production') {
          return res.status(400).json({ success: false, error: 'Missing state parameter.' });
        }
        const { getDatabase } = require('../../../shared/database/connection');
        const db = getDatabase();
        const firstFranchise = await db('franchises').first();
        franchiseId = firstFranchise.id;
      }

      let accessToken: string;
      let refreshToken: string | undefined;
      let expiresAt: string | undefined;
      let merchantId: string = 'mock-merchant-id';

      const appId = process.env.SQUARE_APP_ID;
      if (!appId || code.startsWith('mock_')) {
        accessToken = `simulated-sq-token-${Date.now()}`;
      } else {
        const tokenResponse = await SquareOAuthService.exchangeCodeForToken(code);
        accessToken = tokenResponse.access_token;
        refreshToken = tokenResponse.refresh_token;
        expiresAt = tokenResponse.expires_at;
        merchantId = tokenResponse.merchant_id;
      }

      const { integrationId } = await SquareOAuthService.storeCredentials(
        franchiseId,
        storeId,
        merchantId,
        accessToken,
        refreshToken,
        expiresAt
      );

      console.log(`✅ Square connected! Integration ID: ${integrationId}`);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectTo = `${frontendUrl}/dashboard/integrations?connected=square&integration_id=${integrationId}`;

      if (req.headers.accept?.includes('application/json')) {
        return res.json({ success: true, data: { integrationId, status: 'connected' } });
      }

      res.redirect(redirectTo);
    } catch (err: any) {
      console.error('Square callback error:', err.message);
      res.status(500).json({ success: false, error: err.message || 'Square connection failed' });
    }
  }

  /**
   * POST /api/integrations/salesforce/connect
   */
  public async connectSalesforce(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      let franchiseId = user.franchiseId;
      if (!franchiseId) {
        const db = getDatabase();
        const firstFranchise = await db('franchises').first();
        if (firstFranchise) {
          franchiseId = firstFranchise.id;
        } else {
          return res.status(400).json({ success: false, error: 'No franchise associated.' });
        }
      }

      const storeId = req.body?.store_id || null;

      const { authorizationUrl, state } = SalesforceOAuthService.generateAuthorizationUrl(
        franchiseId!,
        storeId
      );

      console.log(`🔗 Salesforce OAuth URL generated for franchise ${franchiseId}`);

      res.json({
        success: true,
        data: {
          redirectUrl: authorizationUrl,
          state,
        },
      });
    } catch (error: any) {
      console.error('Salesforce connect error:', error.message);
      res.status(500).json({ success: false, error: error.message || 'Failed to generate Salesforce URL' });
    }
  }

  /**
   * GET /api/integrations/salesforce/callback
   */
  public async salesforceCallback(req: Request, res: Response) {
    try {
      const { code, state, error, error_description } = req.query as {
        code?: string;
        state?: string;
        error?: string;
        error_description?: string;
      };

      if (error) {
        return res.status(400).json({ success: false, error: error_description || error });
      }

      if (!code) {
        return res.status(400).json({ success: false, error: 'Missing authorization code from Salesforce' });
      }

      let franchiseId: string;
      let storeId: string | null = null;

      if (state) {
        const stateContext = SalesforceOAuthService.validateState(state);
        if (!stateContext) {
          return res.status(400).json({ success: false, error: 'Invalid or expired OAuth state.' });
        }
        franchiseId = stateContext.franchiseId;
        storeId = stateContext.storeId;
      } else {
        if (process.env.NODE_ENV === 'production') {
          return res.status(400).json({ success: false, error: 'Missing state parameter.' });
        }
        const { getDatabase } = require('../../../shared/database/connection');
        const db = getDatabase();
        const firstFranchise = await db('franchises').first();
        franchiseId = firstFranchise.id;
      }

      let accessToken: string;
      let refreshToken: string | undefined;
      let instanceUrl: string | undefined;

      const appId = process.env.SALESFORCE_CLIENT_ID;
      if (!appId || code.startsWith('mock_')) {
        accessToken = `simulated-sf-token-${Date.now()}`;
        instanceUrl = 'https://mock.salesforce.com';
      } else {
        const tokenResponse = await SalesforceOAuthService.exchangeCodeForToken(code);
        accessToken = tokenResponse.access_token;
        refreshToken = tokenResponse.refresh_token;
        instanceUrl = tokenResponse.instance_url;
      }

      const { integrationId } = await SalesforceOAuthService.storeCredentials(
        franchiseId,
        storeId,
        accessToken,
        refreshToken,
        instanceUrl
      );

      console.log(`✅ Salesforce connected! Integration ID: ${integrationId}`);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectTo = `${frontendUrl}/dashboard/integrations?connected=salesforce&integration_id=${integrationId}`;

      if (req.headers.accept?.includes('application/json')) {
        return res.json({ success: true, data: { integrationId, status: 'connected' } });
      }

      res.redirect(redirectTo);
    } catch (err: any) {
      console.error('Salesforce callback error:', err.message);
      res.status(500).json({ success: false, error: err.message || 'Salesforce connection failed' });
    }
  }

  /**
   * GET /api/integrations
   * 
   * List all integrations for the authenticated user's franchise.
   * Credentials are never returned.
   */
  public async listIntegrations(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      let franchiseId = user.franchiseId;
      if (!franchiseId) {
        const db = getDatabase();
        const firstFranchise = await db('franchises').first();
        if (firstFranchise) {
          franchiseId = firstFranchise.id;
        } else {
          return res.json({ success: true, data: [] });
        }
      }

      const integrations = await CloverOAuthService.listIntegrations(franchiseId!);

      res.json({
        success: true,
        data: integrations,
        count: integrations.length,
      });
    } catch (error: any) {
      console.error('List integrations error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch integrations',
      });
    }
  }

  /**
   * POST /api/integrations/crm/connect
   */
  public async connectCrm(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const franchiseId = user.franchiseId;
      if (!franchiseId) {
        return res.status(400).json({ success: false, error: 'User is not associated with a franchise' });
      }

      const db = getDatabase();

      // Check if config already exists
      const existing = await db('integration_configs')
        .where({ franchise_id: franchiseId, type: 'crm' })
        .first();

      if (existing) {
        await db('integration_configs')
          .where({ id: existing.id })
          .update({
            status: 'connected',
            credentials: JSON.stringify({ api_key: 'mock-dev-crm-api-key' }),
            settings: JSON.stringify({ api_url: 'https://api.universal-crm.example.com/v1' }),
            last_error: null,
            error_count: 0,
            updated_at: new Date(),
          });
      } else {
        await db('integration_configs').insert({
          franchise_id: franchiseId,
          type: 'crm',
          status: 'connected',
          credentials: JSON.stringify({ api_key: 'mock-dev-crm-api-key' }),
          settings: JSON.stringify({ api_url: 'https://api.universal-crm.example.com/v1' }),
          error_count: 0,
        });
      }

      res.json({
        success: true,
        message: 'Universal CRM connected successfully',
      });
    } catch (error: any) {
      console.error('CRM connect error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to connect CRM',
      });
    }
  }

  /**
   * POST /api/integrations/payment/connect
   */
  public async connectPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const franchiseId = user.franchiseId;
      if (!franchiseId) {
        return res.status(400).json({ success: false, error: 'User is not associated with a franchise' });
      }

      const db = getDatabase();

      // Check if config already exists
      const existing = await db('integration_configs')
        .where({ franchise_id: franchiseId, type: 'payment' })
        .first();

      if (existing) {
        await db('integration_configs')
          .where({ id: existing.id })
          .update({
            status: 'connected',
            credentials: JSON.stringify({ api_key: 'mock-dev-payment-api-key' }),
            settings: JSON.stringify({ provider: 'iAccess' }),
            last_error: null,
            error_count: 0,
            updated_at: new Date(),
          });
      } else {
        await db('integration_configs').insert({
          franchise_id: franchiseId,
          type: 'payment',
          status: 'connected',
          credentials: JSON.stringify({ api_key: 'mock-dev-payment-api-key' }),
          settings: JSON.stringify({ provider: 'iAccess' }),
          error_count: 0,
        });
      }

      res.json({
        success: true,
        message: 'iAccess Payments connected successfully',
      });
    } catch (error: any) {
      console.error('Payment connect error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to connect Payments',
      });
    }
  }

  /**
   * POST /api/integrations/:id/sync
   */
  public async triggerSync(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const franchiseId = user.franchiseId;
      if (!franchiseId) {
        return res.status(400).json({ success: false, error: 'User is not associated with a franchise' });
      }

      const { id } = req.params;
      const db = getDatabase();
      const config = await db('integration_configs')
        .where({ id, franchise_id: franchiseId })
        .first();

      if (!config) {
        return res.status(404).json({ success: false, error: 'Integration config not found' });
      }

      // Push job to pg-boss queue
      const { queue } = require('../../../shared/queue');
      await queue.send('integration/sync', { 
        integrationId: config.id, 
        franchiseId: config.franchise_id, 
        type: config.type, 
        syncType: 'full' 
      }, { priority: 1, retryBackoff: true, retryLimit: 5, deadLetter: 'integration/dlq' });

      res.json({
        success: true,
        message: 'Sync triggered',
      });
    } catch (error: any) {
      console.error('Trigger sync error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger sync',
      });
    }
  }

  /**
   * GET /api/integrations/:id/history
   */
  public async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const franchiseId = user.franchiseId;
      if (!franchiseId) {
        return res.status(400).json({ success: false, error: 'User is not associated with a franchise' });
      }

      const { id } = req.params;
      const db = getDatabase();

      // Check RBAC: Make sure this integration belongs to the user's franchise
      const config = await db('integration_configs')
        .where({ id, franchise_id: franchiseId })
        .first();

      if (!config) {
        return res.status(404).json({ success: false, error: 'Integration config not found' });
      }

      const history = await db('sync_runs')
        .where({ integration_id: id })
        .orderBy('created_at', 'desc')
        .limit(100);

      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Get history error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sync history',
      });
    }
  }

  /**
   * POST /api/integrations/:id/test
   */
  public async testIntegration(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const franchiseId = user.franchiseId;
      if (!franchiseId) {
        return res.status(400).json({ success: false, error: 'User is not associated with a franchise' });
      }

      const { id } = req.params;
      const db = getDatabase();
      
      const config = await db('integration_configs')
        .where({ id, franchise_id: franchiseId })
        .first();

      if (!config) {
        return res.status(404).json({ success: false, error: 'Integration config not found' });
      }

      let result;
      // Depending on config type, test the connection
      if (config.type === 'clover') {
        const { cloverConnector } = require('../services/clover.connector');
        result = await cloverConnector.testConnection(config);
      } else if (config.type === 'crm') {
        const { crmConnector } = require('../services/crm.connector');
        result = await crmConnector.testConnection(config);
      } else if (config.type === 'payment') {
        const { paymentConnector } = require('../services/payment.connector');
        result = await paymentConnector.testConnection(config);
      } else if (config.type === 'square') {
        const { squareConnector } = require('../services/square.connector');
        result = await squareConnector.testConnection(config);
      } else if (config.type === 'salesforce') {
        const { salesforceConnector } = require('../services/salesforce.connector');
        result = await salesforceConnector.testConnection(config);
      } else {
        return res.status(400).json({ success: false, error: 'Unknown integration type' });
      }

      if (result?.success) {
        await db('integration_configs').where({ id }).update({
          status: 'connected',
          last_error: null,
          error_count: 0
        });
      } else {
        await db('integration_configs').where({ id }).update({
          status: 'error',
          last_error: result?.error || 'Test failed'
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Test integration error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to test integration',
      });
    }
  }

  /**
   * DELETE /api/integrations/:id
   */
  public async disconnectIntegration(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const franchiseId = user.franchiseId;
      if (!franchiseId) {
        return res.status(400).json({ success: false, error: 'User is not associated with a franchise' });
      }

      const { id } = req.params;
      const db = getDatabase();
      
      const deletedCount = await db('integration_configs')
        .where({ id, franchise_id: franchiseId })
        .del();

      if (deletedCount === 0) {
        return res.status(404).json({ success: false, error: 'Integration config not found' });
      }

      res.json({
        success: true,
        message: 'Integration disconnected successfully',
      });
    } catch (error: any) {
      console.error('Disconnect integration error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to disconnect integration',
      });
    }
  }

  /**
   * POST /api/integrations/webhooks/clover
   */
  public async handleCloverWebhook(req: Request, res: Response) {
    const verificationCode = req.query.verificationCode || req.body?.verificationCode;
    if (verificationCode) {
      console.log('Received Clover webhook verification challenge:', verificationCode);
      return res.status(200).send(verificationCode);
    }

    try {
      await webhookReceiver.handleCloverWebhook(req);
      res.status(200).send('OK');
    } catch (error: any) {
      console.error('Error processing Clover webhook:', error.message);
      res.status(400).send(error.message || 'Webhook processing failed');
    }
  }

  /**
   * POST /api/integrations/webhooks/crm
   */
  public async handleCrmWebhook(req: Request, res: Response) {
    await webhookReceiver.handleCrmWebhook(req);
    res.status(200).send('OK');
  }
}

export const integrationController = new IntegrationController();
