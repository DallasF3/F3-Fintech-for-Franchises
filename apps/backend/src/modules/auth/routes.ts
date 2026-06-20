import { Router } from 'express';
import { registerHandler, loginHandler } from './controllers/auth.controller';
import { validateRequest } from '@middlewares/validate.middleware';
import { RegisterSchema, LoginSchema } from './validators/auth.validator';

const authRouter = Router();

authRouter.post('/register', validateRequest(RegisterSchema), registerHandler);
authRouter.post('/login', validateRequest(LoginSchema), loginHandler);

export default authRouter;
