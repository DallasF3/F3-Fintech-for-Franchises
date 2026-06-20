import { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/logger';
import { register, login } from '../services/auth.service';
import { RegisterRequest, LoginRequest } from '../validators/auth.validator';

export async function registerHandler(
  req: Request<{}, {}, RegisterRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await register(req.body);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        accessTokenExpiry: result.tokens.accessTokenExpiry,
        refreshTokenExpiry: result.tokens.refreshTokenExpiry,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request<{}, {}, LoginRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await login(req.body);

    if (result.requireMfa) {
      res.status(200).json({
        success: true,
        data: {
          requireMfa: true,
          mfaToken: result.mfaToken,
          user: result.user,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens!.accessToken,
        refreshToken: result.tokens!.refreshToken,
        accessTokenExpiry: result.tokens!.accessTokenExpiry,
        refreshTokenExpiry: result.tokens!.refreshTokenExpiry,
      },
    });
  } catch (error) {
    next(error);
  }
}
