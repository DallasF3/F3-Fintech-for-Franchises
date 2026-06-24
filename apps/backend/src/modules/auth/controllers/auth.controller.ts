import { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/logger';
import { register, login, requestPasswordReset, resetPassword, setupMfa, confirmMfa, verifyMfaLogin } from '../services/auth.service';
import { RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../validators/auth.validator';
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

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await requestPasswordReset(req.body);

    res.status(200).json({
      success: true,
      data: { message: 'If an account exists with that email, a password reset link has been sent.' },
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordHandler(
  req: Request<{}, {}, ResetPasswordRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resetPassword(req.body);

    res.status(200).json({
      success: true,
      data: { message: 'Password has been successfully reset.' },
    });
  } catch (error) {
    next(error);
  }
}

export async function setupMfaHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user!.userId;
    const result = await setupMfa(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmMfaHandler(
  req: Request<{}, {}, { token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user!.userId;
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Verification code is required',
        code: 'MISSING_MFA_CODE',
      });
      return;
    }

    const result = await confirmMfa(userId, token);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyMfaLoginHandler(
  req: Request<{}, {}, { mfaToken: string; token: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { mfaToken, token } = req.body;

    if (!mfaToken || !token) {
      res.status(400).json({
        success: false,
        error: 'MFA token and verification code are required',
        code: 'MISSING_MFA_CREDENTIALS',
      });
      return;
    }

    const result = await verifyMfaLogin(mfaToken, token);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        accessTokenExpiry: result.accessTokenExpiry,
        refreshTokenExpiry: result.refreshTokenExpiry,
      },
    });
  } catch (error) {
    next(error);
  }
}
