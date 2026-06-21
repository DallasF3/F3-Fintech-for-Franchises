import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate.middleware';
import { UserRole, hasPermission, hasRole, Permission } from '@shared/rbac/permissions';

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'MISSING_AUTH',
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    if (!hasRole(userRole, roles)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: insufficient permissions',
        code: 'INSUFFICIENT_ROLE',
        required: roles,
        current: userRole,
      });
      return;
    }

    next();
  };
}

export function requirePermission(...permissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'MISSING_AUTH',
      });
      return;
    }

    const userRole = req.user.role as UserRole;
    const hasAllPermissions = permissions.every((perm) => hasPermission(userRole, perm));

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: insufficient permissions',
        code: 'INSUFFICIENT_PERMISSION',
        required: permissions,
        role: userRole,
      });
      return;
    }

    next();
  };
}

export function requireFranchiseScope(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      code: 'MISSING_AUTH',
    });
    return;
  }

  const userRole = req.user.role as UserRole;

  // Admin has access to all franchises
  if (userRole === UserRole.ADMIN) {
    next();
    return;
  }

  // Franchisor/Franchisee must have a franchise_id in their JWT
  if (!req.user.franchiseId) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: no franchise scope',
      code: 'NO_FRANCHISE_SCOPE',
    });
    return;
  }

  // Attach franchiseId to request for use in route handlers
  (req as any).franchiseId = req.user.franchiseId;
  next();
}
