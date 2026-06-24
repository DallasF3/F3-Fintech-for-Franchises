import { Router } from 'express';
import { 
  registerHandler, loginHandler, refreshTokenHandler, logoutHandler, 
  forgotPasswordHandler, resetPasswordHandler,
  setupMfaHandler, confirmMfaHandler, verifyMfaLoginHandler 
} from './controllers/auth.controller';
import { GoogleController } from './controllers/google.controller';
import { MicrosoftController } from './controllers/microsoft.controller';
import { validateRequest } from '@middlewares/validate.middleware';
import { authLimiter } from '@middlewares/rate-limit.middleware';
import { authenticateToken } from '@middlewares/authenticate.middleware';
import { RegisterSchema, LoginSchema, RefreshTokenSchema, LogoutSchema, ForgotPasswordSchema, ResetPasswordSchema } from './validators/auth.validator';

const authRouter = Router();

authRouter.post('/register', authLimiter, validateRequest(RegisterSchema), registerHandler);
authRouter.post('/login', authLimiter, validateRequest(LoginSchema), loginHandler);
authRouter.post('/refresh', validateRequest(RefreshTokenSchema), refreshTokenHandler);
authRouter.post('/logout', validateRequest(LogoutSchema), logoutHandler);
authRouter.post('/google/callback', authLimiter, GoogleController.googleCallback);
authRouter.post('/microsoft/callback', authLimiter, MicrosoftController.microsoftCallback);
authRouter.post('/forgot-password', authLimiter, validateRequest(ForgotPasswordSchema), forgotPasswordHandler);
authRouter.post('/reset-password', authLimiter, validateRequest(ResetPasswordSchema), resetPasswordHandler);

// MFA Routes
authRouter.post('/mfa/setup', authenticateToken, setupMfaHandler);
authRouter.post('/mfa/confirm', authenticateToken, confirmMfaHandler);
authRouter.post('/mfa/verify', authLimiter, verifyMfaLoginHandler);

export default authRouter;
