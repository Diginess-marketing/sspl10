import { supabase } from '@/integrations/supabase/client';

export enum GAPermission {
  VIEW_CONFIG = 'ga_view_config',
  EDIT_CONFIG = 'ga_edit_config',
  VIEW_REPORTS = 'ga_view_reports',
  EXPORT_DATA = 'ga_export_data',
  DELETE_DATA = 'ga_delete_data',
  MANAGE_USERS = 'ga_manage_users'
}

export interface GAUserPermissions {
  [GAPermission.VIEW_CONFIG]: boolean;
  [GAPermission.EDIT_CONFIG]: boolean;
  [GAPermission.VIEW_REPORTS]: boolean;
  [GAPermission.EXPORT_DATA]: boolean;
  [GAPermission.DELETE_DATA]: boolean;
  [GAPermission.MANAGE_USERS]: boolean;
}

// Default permissions for different user roles
export const DEFAULT_PERMISSIONS = {
  admin: {
    [GAPermission.VIEW_CONFIG]: true,
    [GAPermission.EDIT_CONFIG]: true,
    [GAPermission.VIEW_REPORTS]: true,
    [GAPermission.EXPORT_DATA]: true,
    [GAPermission.DELETE_DATA]: true,
    [GAPermission.MANAGE_USERS]: true,
  },
  moderator: {
    [GAPermission.VIEW_CONFIG]: true,
    [GAPermission.EDIT_CONFIG]: false,
    [GAPermission.VIEW_REPORTS]: true,
    [GAPermission.EXPORT_DATA]: true,
    [GAPermission.DELETE_DATA]: false,
    [GAPermission.MANAGE_USERS]: false,
  },
  analyst: {
    [GAPermission.VIEW_CONFIG]: false,
    [GAPermission.EDIT_CONFIG]: false,
    [GAPermission.VIEW_REPORTS]: true,
    [GAPermission.EXPORT_DATA]: true,
    [GAPermission.DELETE_DATA]: false,
    [GAPermission.MANAGE_USERS]: false,
  },
  user: {
    [GAPermission.VIEW_CONFIG]: false,
    [GAPermission.EDIT_CONFIG]: false,
    [GAPermission.VIEW_REPORTS]: false,
    [GAPermission.EXPORT_DATA]: false,
    [GAPermission.DELETE_DATA]: false,
    [GAPermission.MANAGE_USERS]: false,
  },
};

// Get user permissions from database
export const getUserGAPermissions = async (userId: string): Promise<GAUserPermissions> => {
  try {
    // First, get user's role
    const { data: userData, error: userError } = await (supabase as any)
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return DEFAULT_PERMISSIONS.user;
    }

    const userRole = userData?.role || 'user';

    // Check for custom permissions
    const { data: customPermissions, error: permError } = await (supabase as any)
      .from('user_ga_permissions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (permError && permError.code !== 'PGRST116') {
      return DEFAULT_PERMISSIONS[userRole] || DEFAULT_PERMISSIONS.user;
    }

    // If custom permissions exist, merge with default
    if (customPermissions) {
      const defaultPerms = DEFAULT_PERMISSIONS[userRole] || DEFAULT_PERMISSIONS.user;
      return {
        ...defaultPerms,
        ...customPermissions.permissions,
      };
    }

    // Return default permissions for the role
    return DEFAULT_PERMISSIONS[userRole] || DEFAULT_PERMISSIONS.user;

  } catch {
    return DEFAULT_PERMISSIONS.user;
  }
};

// Check if user has specific permission
export const hasGAPermission = async (userId: string, permission: GAPermission): Promise<boolean> => {
  const permissions = await getUserGAPermissions(userId);
  return permissions[permission] || false;
};

// Update user GA permissions
export const updateUserGAPermissions = async (
  userId: string,
  permissions: Partial<GAUserPermissions>,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await (supabase as any)
      .from('user_ga_permissions')
      .upsert({
        user_id: userId,
        permissions,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update permissions',
    };
  }
};

// Get all users with their GA permissions
export const getAllUsersGAPermissions = async () => {
  try {
    // Get all users with their roles
    const { data: users, error: usersError } = await (supabase as any)
      .from('user_roles')
      .select(`
        user_id,
        role,
        user_ga_permissions (
          permissions
        )
      `);

    if (usersError) {
      throw usersError;
    }

    // Get user emails from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      // Auth user listing failed; emails may be unknown
    }

    // Combine the data
    const usersWithPermissions = users?.map(user => {
      const authUser = authUsers?.users?.find((u: any) => u.id === user.user_id);
      const customPermissions = user.user_ga_permissions?.[0]?.permissions || {};
      const defaultPermissions = DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS.user;

      return {
        userId: user.user_id,
        email: authUser?.email || 'Unknown',
        role: user.role,
        permissions: {
          ...defaultPermissions,
          ...customPermissions,
        },
        hasCustomPermissions: Object.keys(customPermissions).length > 0,
      };
    }) || [];

    return usersWithPermissions;
  } catch {
    return [];
  }
};

// Validate permission update request
export const validatePermissionUpdate = (
  requestingUserId: string,
  targetUserId: string,
  newPermissions: Partial<GAUserPermissions>,
): { valid: boolean; error?: string } => {
  // Users cannot modify their own permissions
  if (requestingUserId === targetUserId) {
    return {
      valid: false,
      error: 'Users cannot modify their own permissions',
    };
  }

  // Validate permission structure
  const validPermissions = Object.values(GAPermission);
  for (const perm of Object.keys(newPermissions)) {
    if (!validPermissions.includes(perm as GAPermission)) {
      return {
        valid: false,
        error: `Invalid permission: ${perm}`,
      };
    }
  }

  return { valid: true };
};

// Audit log for permission changes
export const logPermissionChange = async (
  changedBy: string,
  targetUser: string,
  action: 'grant' | 'revoke' | 'update',
  permission: GAPermission,
  oldValue?: boolean,
  newValue?: boolean,
): Promise<void> => {
  try {
    await (supabase as any)
      .from('ga_permission_audit_log')
      .insert({
        changed_by: changedBy,
        target_user: targetUser,
        action,
        permission,
        old_value: oldValue,
        new_value: newValue,
        changed_at: new Date().toISOString(),
      });
  } catch {
    // Audit log write failed; intentionally ignored
  }
};

// Check if user can access GA admin panel
export const canAccessGAAdmin = async (userId: string): Promise<boolean> => {
  return hasGAPermission(userId, GAPermission.VIEW_CONFIG);
};

// Check if user can modify GA configuration
export const canModifyGAConfig = async (userId: string): Promise<boolean> => {
  return hasGAPermission(userId, GAPermission.EDIT_CONFIG);
};

// Check if user can view GA reports
export const canViewGAReports = async (userId: string): Promise<boolean> => {
  return hasGAPermission(userId, GAPermission.VIEW_REPORTS);
};

// Check if user can export GA data
export const canExportGAData = async (userId: string): Promise<boolean> => {
  return hasGAPermission(userId, GAPermission.EXPORT_DATA);
};