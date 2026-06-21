import { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/logger';
import { register, login } from '../services/auth.service';
import { RegisterRequest, LoginRequest } from '../validators/auth.validator';
import * as tokenService from '../services/token.service';

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

export async function refreshTokenHandler(
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING',
      });
      return;
    }

    // Verify and rotate refresh token
    const verified = await tokenService.verifyRefreshToken(refreshToken);
    if (!verified) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
      return;
    }

    // Get user data to generate new tokens
    const { getDatabase } = require('@shared/database/connection');
    const db = getDatabase();
    const user = await db('users').where('id', verified.userId).first();

    if (!user || !user.is_active) {
      res.status(403).json({
        success: false,
        error: 'User account is inactive',
        code: 'ACCOUNT_INACTIVE',
      });
      return;
    }

    // Rotate refresh token
    const newTokens = await tokenService.rotateRefreshToken(
      refreshToken,
      user.id,
      user.email,
      user.role,
      user.franchise_id
    );

    if (!newTokens) {
      res.status(401).json({
        success: false,
        error: 'Failed to refresh token',
        code: 'TOKEN_ROTATION_FAILED',
      });
      return;
    }

    logger.info({ userId: user.id }, 'Token refreshed');

    res.status(200).json({
      success: true,
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        accessTokenExpiry: newTokens.accessTokenExpiry,
        refreshTokenExpiry: newTokens.refreshTokenExpiry,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_MISSING',
      });
      return;
    }

    // Revoke refresh token
    await tokenService.revokeRefreshToken(refreshToken);

    logger.info({ token: refreshToken.substring(0, 20) + '...' }, 'User logged out');

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    next(error);
  }
}
