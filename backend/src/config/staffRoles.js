// Admin staff roles (PRD section 2). Keep in sync with "diginess temp/src/lib/staffRoles.ts".
// An admin with no staff_role is a super admin.

export const PERMISSIONS = [
  'manage_trials',    // players, trials, results, levels, certificates, selectors, organisers
  'view_payments',    // payments list and export
  'manage_payments',  // reconcile, refunds, coupons
  'manage_campaigns', // QR codes, WhatsApp campaigns, campaign analytics
  'send_messages',    // email centre, bulk email, level emails
  'manage_content',   // website content
  'manage_rewards',
  'view_reports',
  'manage_staff',     // users, roles, settings, action history, restore from the bin
];

export const STAFF_ROLES = {
  super_admin: { label: 'Super admin', permissions: PERMISSIONS },
  operations: { label: 'Operations', permissions: ['manage_trials', 'send_messages', 'view_reports'] },
  finance: { label: 'Finance', permissions: ['view_payments', 'manage_payments', 'view_reports'] },
  marketing: { label: 'Marketing', permissions: ['manage_campaigns', 'send_messages', 'manage_content', 'manage_rewards', 'view_reports'] },
  viewer: { label: 'Read-only', permissions: ['view_reports', 'view_payments'] },
};

export const staffRoleOf = (row) => (row?.staff_role && STAFF_ROLES[row.staff_role] ? row.staff_role : 'super_admin');
export const can = (staffRole, permission) => (STAFF_ROLES[staffRole] || STAFF_ROLES.super_admin).permissions.includes(permission);
