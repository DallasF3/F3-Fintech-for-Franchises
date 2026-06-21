export enum UserRole {
  ADMIN = 'admin',
  FRANCHISOR = 'franchisor',
  FRANCHISEE = 'franchisee',
}

export enum Permission {
  // User management
  LIST_USERS = 'list_users',
  VIEW_USER = 'view_user',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  INVITE_USER = 'invite_user',

  // Franchise management
  LIST_FRANCHISES = 'list_franchises',
  VIEW_FRANCHISE = 'view_franchise',
  CREATE_FRANCHISE = 'create_franchise',
  UPDATE_FRANCHISE = 'update_franchise',
  DELETE_FRANCHISE = 'delete_franchise',

  // Store management
  LIST_STORES = 'list_stores',
  VIEW_STORE = 'view_store',
  CREATE_STORE = 'create_store',
  UPDATE_STORE = 'update_store',
  DELETE_STORE = 'delete_store',

  // Dashboard & Analytics
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_REPORTS = 'export_reports',

  // Settings
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
}

// Permission matrix: which roles have which permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    Permission.LIST_USERS,
    Permission.VIEW_USER,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.INVITE_USER,
    Permission.LIST_FRANCHISES,
    Permission.VIEW_FRANCHISE,
    Permission.CREATE_FRANCHISE,
    Permission.UPDATE_FRANCHISE,
    Permission.DELETE_FRANCHISE,
    Permission.LIST_STORES,
    Permission.VIEW_STORE,
    Permission.CREATE_STORE,
    Permission.UPDATE_STORE,
    Permission.DELETE_STORE,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_REPORTS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.FRANCHISOR]: [
    // Franchisor can manage their franchise and users
    Permission.LIST_USERS,
    Permission.VIEW_USER,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.INVITE_USER,
    Permission.LIST_FRANCHISES,
    Permission.VIEW_FRANCHISE,
    Permission.UPDATE_FRANCHISE,
    Permission.LIST_STORES,
    Permission.VIEW_STORE,
    Permission.CREATE_STORE,
    Permission.UPDATE_STORE,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.FRANCHISEE]: [
    // Franchisee can only see their own data
    Permission.VIEW_USER,
    Permission.VIEW_STORE,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_REPORTS,
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasRole(role: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(role);
}

export function canViewUser(viewerRole: UserRole, viewerFranchiseId?: string, targetFranchiseId?: string): boolean {
  // Admin can view anyone
  if (viewerRole === UserRole.ADMIN) return true;

  // Franchisor can view users in their franchise
  if (viewerRole === UserRole.FRANCHISOR) {
    return viewerFranchiseId === targetFranchiseId;
  }

  // Franchisee can only view themselves (checked by ID in route)
  return viewerRole === UserRole.FRANCHISEE;
}

export function canUpdateUser(updaterRole: UserRole, targetRole: UserRole, updaterFranchiseId?: string, targetFranchiseId?: string): boolean {
  // Admin can update anyone
  if (updaterRole === UserRole.ADMIN) return true;

  // Franchisor can update users in their franchise (but not other franchisors/admins)
  if (updaterRole === UserRole.FRANCHISOR) {
    if (targetRole === UserRole.ADMIN || targetRole === UserRole.FRANCHISOR) return false;
    return updaterFranchiseId === targetFranchiseId;
  }

  // Franchisee can only update themselves
  return false;
}

export function canDeleteUser(deleterRole: UserRole, targetRole: UserRole): boolean {
  // Admin can delete anyone
  if (deleterRole === UserRole.ADMIN) return true;

  // Franchisor cannot delete admins or other franchisors
  if (deleterRole === UserRole.FRANCHISOR) {
    return targetRole === UserRole.FRANCHISEE;
  }

  // Franchisee cannot delete anyone
  return false;
}
