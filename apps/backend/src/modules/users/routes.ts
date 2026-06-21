import { Router } from 'express';
import { authenticateToken } from '@middlewares/authenticate.middleware';
import { requireRole, requirePermission } from '@middlewares/authorize.middleware';
import { listUsers, getUser, updateUser, deleteUser } from './controllers/user.controller';
import { UserRole, Permission } from '@shared/rbac/permissions';

const usersRouter = Router();

// All routes require authentication
usersRouter.use(authenticateToken);

// List users: Admin, Franchisor, Franchisee
// Different filters apply based on role
usersRouter.get(
  '/',
  requirePermission(Permission.LIST_USERS),
  listUsers
);

// Get user by ID: Admin, Franchisor (own franchise), Franchisee (self)
usersRouter.get(
  '/:userId',
  requirePermission(Permission.VIEW_USER),
  getUser
);

// Update user: Admin, Franchisor (own franchise franchisees)
usersRouter.put(
  '/:userId',
  requirePermission(Permission.UPDATE_USER),
  updateUser
);

// Delete user (soft delete): Admin only
usersRouter.delete(
  '/:userId',
  requireRole(UserRole.ADMIN),
  deleteUser
);

export default usersRouter;
