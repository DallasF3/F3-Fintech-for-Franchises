import { Router } from 'express';
import { validateRequest } from '../../middlewares/validate.middleware';
import { authenticateToken } from '../../middlewares/authenticate.middleware';
import { 
  createInvitationHandler,
  getInvitationDetailsHandler,
  acceptInvitationHandler,
  listInvitationsHandler
} from './controllers/invitation.controller';
import { CreateInviteSchema, AcceptInviteSchema } from './validators/invitation.validator';

const router = Router();

// Protected routes (requires login to invite someone)
router.post('/', authenticateToken, validateRequest(CreateInviteSchema), createInvitationHandler);
router.get('/', authenticateToken, listInvitationsHandler);

// Public routes (for the user accepting the invite)
router.get('/verify/:token', getInvitationDetailsHandler);
router.post('/accept', validateRequest(AcceptInviteSchema), acceptInvitationHandler);

export default router;
