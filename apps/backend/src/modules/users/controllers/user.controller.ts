import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@middlewares/authenticate.middleware';
import { logger } from '@shared/logger';
import { getDatabase } from '@shared/database/connection';
import { UserRole, canViewUser, canUpdateUser, canDeleteUser } from '@shared/rbac/permissions';

export async function listUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized', code: 'MISSING_AUTH' });
      return;
    }

    const db = getDatabase();
    const userRole = req.user.role as UserRole;
    const franchiseId = req.user.franchiseId;

    let query = db('users').select('id', 'email', 'first_name', 'last_name', 'role', 'franchise_id', 'is_active', 'created_at');

    // Filter by user's access level
    if (userRole === UserRole.FRANCHISOR && franchiseId) {
      query = query.where('franchise_id', franchiseId);
    } else if (userRole === UserRole.FRANCHISEE && franchiseId) {
      query = query.where('id', req.user.userId);
    }

    const users = await query.whereNull('deleted_at');

    logger.info({ userId: req.user.userId, count: users.length }, 'Users listed');

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized', code: 'MISSING_AUTH' });
      return;
    }

    const { userId } = req.params;
    const db = getDatabase();

    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'franchise_id', 'is_active', 'created_at', 'last_login_at')
      .where('id', userId)
      .whereNull('deleted_at')
      .first();

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
      return;
    }

    // Check if requester can view this user
    const userRole = req.user.role as UserRole;
    if (!canViewUser(userRole, req.user.franchiseId, user.franchise_id)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: cannot view this user',
        code: 'FORBIDDEN',
      });
      return;
    }

    logger.info({ viewerId: req.user.userId, userId }, 'User viewed');

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized', code: 'MISSING_AUTH' });
      return;
    }

    const { userId } = req.params;
    const { first_name, last_name, role, is_active } = req.body;
    const db = getDatabase();

    // Get the user to update
    const targetUser = await db('users').where('id', userId).whereNull('deleted_at').first();

    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
      return;
    }

    // Check if requester can update this user
    const userRole = req.user.role as UserRole;
    if (!canUpdateUser(userRole, targetUser.role, req.user.franchiseId, targetUser.franchise_id)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: cannot update this user',
        code: 'FORBIDDEN',
      });
      return;
    }

    // Build update object (only allow certain fields)
    const updateData: any = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (is_active !== undefined && userRole === UserRole.ADMIN) updateData.is_active = is_active;
    if (role !== undefined && userRole === UserRole.ADMIN) updateData.role = role;

    updateData.updated_at = new Date();

    await db('users').where('id', userId).update(updateData);

    const updatedUser = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'role', 'franchise_id', 'is_active', 'updated_at')
      .where('id', userId)
      .first();

    logger.info({ updaterId: req.user.userId, userId, changes: Object.keys(updateData) }, 'User updated');

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized', code: 'MISSING_AUTH' });
      return;
    }

    const { userId } = req.params;

    if (userId === req.user.userId) {
      res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
        code: 'CANNOT_DELETE_SELF',
      });
      return;
    }

    const db = getDatabase();

    // Get the user to delete
    const targetUser = await db('users').where('id', userId).whereNull('deleted_at').first();

    if (!targetUser) {
      res.status(404).json({ success: false, error: 'User not found', code: 'USER_NOT_FOUND' });
      return;
    }

    // Check if requester can delete this user
    const userRole = req.user.role as UserRole;
    if (!canDeleteUser(userRole, targetUser.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: cannot delete this user',
        code: 'FORBIDDEN',
      });
      return;
    }

    // Soft delete
    await db('users').where('id', userId).update({
      deleted_at: new Date(),
      is_active: false,
    });

    logger.info({ deleterId: req.user.userId, userId }, 'User deleted');

    res.status(200).json({
      success: true,
      data: { message: 'User deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
}
