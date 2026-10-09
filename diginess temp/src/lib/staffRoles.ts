// Admin staff roles (PRD section 2). Keep in sync with backend/src/config/staffRoles.js.
// An admin with no staff_role is a super admin.

export const PERMISSIONS = [
  'manage_trials',
  'view_payments',
  'manage_payments',
  'manage_campaigns',
  'send_messages',
  'manage_content',
  'manage_rewards',
  'view_reports',
  'manage_staff',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
export type StaffRole = 'super_admin' | 'operations' | 'finance' | 'marketing' | 'viewer';

export const STAFF_ROLES: Record<StaffRole, { label: string; description: string; permissions: readonly Permission[] }> = {
  super_admin: { label: 'Super admin', description: 'Everything, including staff, settings and restoring deleted items', permissions: PERMISSIONS },
  operations: { label: 'Operations', description: 'Registrations, trials, results, certificates, messages', permissions: ['manage_trials', 'send_messages', 'view_reports'] },
  finance: { label: 'Finance', description: 'Payments, reconciliation, coupons. Cannot edit trial results', permissions: ['view_payments', 'manage_payments', 'view_reports'] },
  marketing: { label: 'Marketing', description: 'Campaigns, QR codes, WhatsApp and email, website content', permissions: ['manage_campaigns', 'send_messages', 'manage_content', 'manage_rewards', 'view_reports'] },
  viewer: { label: 'Read-only', description: 'Reports and payments, no changes', permissions: ['view_reports', 'view_payments'] },
};

export const staffRoleOf = (value: string | null | undefined): StaffRole =>
  value && value in STAFF_ROLES ? (value as StaffRole) : 'super_admin';

export const roleCan = (role: StaffRole, permission: string) =>
  (STAFF_ROLES[role].permissions as readonly string[]).includes(permission);
