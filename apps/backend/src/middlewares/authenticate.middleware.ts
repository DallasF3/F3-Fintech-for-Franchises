import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../modules/auth/services/token.service';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'MISSING_TOKEN',
    });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired access token',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  req.user = payload;
  next();
}

export function optionalAuthToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
}
