import { Router } from 'express';
import { registerHandler, loginHandler, refreshTokenHandler, logoutHandler } from './controllers/auth.controller';
import { GoogleController } from './controllers/google.controller';
import { validateRequest } from '@middlewares/validate.middleware';
import { authLimiter } from '@middlewares/rate-limit.middleware';
import { RegisterSchema, LoginSchema, RefreshTokenSchema, LogoutSchema } from './validators/auth.validator';

const authRouter = Router();

authRouter.post('/register', authLimiter, validateRequest(RegisterSchema), registerHandler);
authRouter.post('/login', authLimiter, validateRequest(LoginSchema), loginHandler);
authRouter.post('/refresh', validateRequest(RefreshTokenSchema), refreshTokenHandler);
authRouter.post('/logout', validateRequest(LogoutSchema), logoutHandler);
authRouter.post('/google/callback', authLimiter, GoogleController.googleCallback);

export default authRouter;
