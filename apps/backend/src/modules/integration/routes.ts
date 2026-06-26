import { Router } from 'express';
import { integrationController } from './controllers/integration.controller';
import { authenticateToken } from '../../middlewares/authenticate.middleware';

const router = Router();

// ─── OAuth Flows (Protected — requires JWT) ─────────────────
router.post('/clover/connect', authenticateToken, integrationController.connectClover);
router.post('/crm/connect', authenticateToken, integrationController.connectCrm);

// ─── Clover OAuth Callback (Open — browser redirect from Clover) ─
router.get('/clover/callback', integrationController.cloverCallback);

// ─── Integration Management (Protected) ─────────────────────
router.get('/', authenticateToken, integrationController.listIntegrations);
router.post('/:id/sync', authenticateToken, integrationController.triggerSync);

// ─── Webhooks (Open — use signature verification instead of JWT) ─
router.post('/webhooks/clover', integrationController.handleCloverWebhook);
router.post('/webhooks/crm', integrationController.handleCrmWebhook);

export default router;
