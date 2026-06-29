import { Router } from 'express';
import { integrationController } from './controllers/integration.controller';
import { authenticateToken } from '../../middlewares/authenticate.middleware';

const router = Router();

// ─── OAuth Flows (Protected — requires JWT) ─────────────────
router.post('/clover/connect', authenticateToken, integrationController.connectClover);
router.post('/square/connect', authenticateToken, integrationController.connectSquare);
router.post('/crm/connect', authenticateToken, integrationController.connectCrm);
router.post('/payment/connect', authenticateToken, integrationController.connectPayment);

// ─── OAuth Callback (Open — browser redirect from OAuth Providers) ─
router.get('/clover/callback', integrationController.cloverCallback);
router.get('/square/callback', integrationController.squareCallback);

// ─── Integration Management (Protected) ─────────────────────
router.get('/', authenticateToken, integrationController.listIntegrations);
router.post('/:id/sync', authenticateToken, integrationController.triggerSync);
router.get('/:id/history', authenticateToken, integrationController.getHistory);
router.post('/:id/test', authenticateToken, integrationController.testIntegration);
router.delete('/:id', authenticateToken, integrationController.disconnectIntegration);

// ─── Webhooks (Open — use signature verification instead of JWT) ─
router.post('/webhooks/clover', integrationController.handleCloverWebhook);
router.post('/webhooks/crm', integrationController.handleCrmWebhook);

export default router;
