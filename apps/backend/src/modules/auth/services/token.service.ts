import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@shared/database/connection';

const JWT_SECRET: string = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN: string = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  franchiseId?: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
}

function getExpirySeconds(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);

  switch (unit) {
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 3600; // 1 hour default
  }
}

export async function generateTokenPair(
  userId: string,
  email: string,
  role: string,
  franchiseId?: string
): Promise<TokenPair> {
  const accessTokenExpiry = getExpirySeconds(JWT_EXPIRES_IN);
  const refreshTokenExpiry = getExpirySeconds(REFRESH_TOKEN_EXPIRES_IN);

  // Generate access token
  const accessToken = jwt.sign(
    {
      userId,
      email,
      role,
      franchiseId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions
  );

  // Generate refresh token
  const refreshTokenId = uuidv4();
  const refreshToken = jwt.sign(
    {
      tokenId: refreshTokenId,
      userId,
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as SignOptions
  );

  // Hash the refresh token for storage
  const crypto = require('crypto');
  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // Store refresh token hash in database
  const db = getDatabase();
  const expiresAt = new Date(Date.now() + refreshTokenExpiry * 1000);

  await db('refresh_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiry,
    refreshTokenExpiry,
  };
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string; tokenId: string } | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      tokenId: string;
      userId: string;
    };

    const crypto = require('crypto');
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Check if token exists and is not revoked
    const db = getDatabase();
    const tokenRecord = await db('refresh_tokens')
      .where('token_hash', tokenHash)
      .where('user_id', payload.userId)
      .where('expires_at', '>', new Date())
      .whereNull('revoked_at')
      .first();

    if (!tokenRecord) {
      return null;
    }

    return {
      userId: payload.userId,
      tokenId: payload.tokenId,
    };
  } catch {
    return null;
  }
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const crypto = require('crypto');
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const db = getDatabase();
  await db('refresh_tokens')
    .where('token_hash', tokenHash)
    .update({
      revoked_at: new Date(),
    });
}

export async function rotateRefreshToken(
  oldToken: string,
  userId: string,
  email: string,
  role: string,
  franchiseId?: string
): Promise<TokenPair | null> {
  // Verify old token is valid
  const verified = await verifyRefreshToken(oldToken);
  if (!verified) {
    return null;
  }

  // Revoke old token
  await revokeRefreshToken(oldToken);

  // Generate new pair
  return generateTokenPair(userId, email, role, franchiseId);
}
