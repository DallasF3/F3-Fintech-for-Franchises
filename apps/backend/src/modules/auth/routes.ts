import { Router } from 'express';
import { registerHandler, loginHandler } from './controllers/auth.controller';
import { GoogleController } from './controllers/google.controller';
import { validateRequest } from '@middlewares/validate.middleware';
import { authLimiter } from '@middlewares/rate-limit.middleware';
import { RegisterSchema, LoginSchema } from './validators/auth.validator';

const authRouter = Router();

authRouter.post('/register', authLimiter, validateRequest(RegisterSchema), registerHandler);
authRouter.post('/login', authLimiter, validateRequest(LoginSchema), loginHandler);
authRouter.post('/google/callback', authLimiter, GoogleController.googleCallback);

export default authRouter;
