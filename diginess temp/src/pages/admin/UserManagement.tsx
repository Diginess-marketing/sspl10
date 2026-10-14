import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { adminService, AdminUser, AdminInvite } from '@/services/adminService';
import { adminApi } from '@/lib/adminApi';
import { STAFF_ROLES, staffRoleOf, type StaffRole } from '@/lib/staffRoles';
import { Mail, Trash2, RefreshCw, Users, ShieldCheck, Clock, Pencil, Copy, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { PageHeader, StatCard, StatusBadge, ActionButton, DataTableShell, DetailDrawer, ConfirmDialog } from '@/components/admin/ui';

// Available permissions
const AVAILABLE_PERMISSIONS = [
    { id: 'view_analytics', label: 'View Analytics' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_rewards', label: 'Manage Rewards' },
    { id: 'manage_trials', label: 'Manage Trials/Workflow' },
    { id: 'view_financials', label: 'View Financials' },
];

const permLabel = (id: string) => AVAILABLE_PERMISSIONS.find(p => p.id === id)?.label || id;
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : 'N/A');
const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${what} copied`); } catch { toast.error('Could not copy'); }
};

const PermissionPicker = ({ idPrefix, value, onChange }: { idPrefix: string; value: string[]; onChange: (v: string[]) => void }) => (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {AVAILABLE_PERMISSIONS.map((perm) => {
            const on = value.includes(perm.id);
            return (
                <label key={perm.id} htmlFor={`${idPrefix}-${perm.id}`} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${on ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]' : 'border-[var(--admin-line)] bg-white hover:border-[var(--admin-accent)]'}`}>
                    <input
                        id={`${idPrefix}-${perm.id}`}
                        type="checkbox"
                        checked={on}
                        onChange={() => onChange(on ? value.filter(p => p !== perm.id) : [...value, perm.id])}
                        className="h-4 w-4 accent-[var(--brand-blue)]"
                    />
                    <span className="font-semibold text-[var(--admin-ink)]">{perm.label}</span>
                </label>
            );
        })}
    </div>
);

const RoleSelect = ({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) => (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="admin-field">
        <option value="user">User</option>
        <option value="admin">Admin</option>
    </select>
);

const UserManagement = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [invites, setInvites] = useState<AdminInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [invitesLoading, setInvitesLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const PAGE_SIZE = 10;

    const [view, setView] = useState<'users' | 'invites'>('users');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Invite drawer
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('user');
    const [invitePermissions, setInvitePermissions] = useState<string[]>([]);
    const [confirmInvite, setConfirmInvite] = useState(false);

    // Edit drawer
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [editRole, setEditRole] = useState('user');
    const [editStaffRole, setEditStaffRole] = useState<StaffRole>('super_admin');
    const [editPermissions, setEditPermissions] = useState<string[]>([]);
    const [confirmEdit, setConfirmEdit] = useState(false);

    // Revoke invite
    const [revoking, setRevoking] = useState<AdminInvite | null>(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data, count } = await adminService.getUsers(page, PAGE_SIZE);
            setUsers(data);
            setTotalUsers(count);
            setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
        } catch (error) {
            console.error('Failed to load users', error);
            toast.error('Failed to load users list');
        } finally {
            setLoading(false);
        }
    };

    const loadInvites = async () => {
        try {
            setInvitesLoading(true);
            setInvites(await adminService.getInvites());
        } catch (error) {
            console.error('Failed to load invites', error);
        } finally {
            setInvitesLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
        loadInvites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleInviteUser = async () => {
        try {
            setIsSubmitting(true);
            await adminService.inviteUser(inviteEmail, inviteRole, invitePermissions);
            toast.success(`Invitation sent to ${inviteEmail}`);
            setConfirmInvite(false);
            setIsInviteOpen(false);
            setInviteEmail('');
            setInvitePermissions([]);
            loadInvites();
        } catch (error) {
            toast.error('Failed to create invite');
        } finally {
            setIsSubmitting(false);
        }
    };

    const startInvite = () => {
        if (!inviteEmail.trim()) { toast.error('Email is required'); return; }
        setConfirmInvite(true);
    };

    const handleDeleteInvite = async () => {
        if (!revoking) return;
        try {
            setIsSubmitting(true);
            await adminService.deleteInvite(revoking.email);
            toast.success('Invite revoked');
            setRevoking(null);
            loadInvites();
        } catch (error) {
            toast.error('Failed to delete invite');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            setIsSubmitting(true);
            // Admin or not, and the staff role, go through the backend (super admins only; recorded
            // in the action history). Permissions for non-admin users are saved as before.
            await adminApi.put(`/admin/staff/${editingUser.id}/role`, { role: editRole, staffRole: editRole === 'admin' ? editStaffRole : undefined });
            if (editRole !== 'admin') await adminService.updateUserRole(editingUser.id, editRole, editPermissions);
            toast.success('User updated successfully');
            setConfirmEdit(false);
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            toast.error('Failed to update user', { description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (user: AdminUser) => {
        setEditingUser(user);
        setEditRole(user.role);
        setEditStaffRole(staffRoleOf(user.staff_role));
        setEditPermissions(user.permissions || []);
    };

    const adminsOnPage = users.filter(u => u.role === 'admin').length;

    const filteredUsers = useMemo(() => {
        const q = search.toLowerCase();
        return users.filter(u => {
            if (roleFilter !== 'all' && u.role !== roleFilter) return false;
            if (!q) return true;
            return [u.full_name, u.email, u.id].some(v => v?.toLowerCase().includes(q));
        });
    }, [users, search, roleFilter]);

    const filteredInvites = useMemo(() => {
        const q = search.toLowerCase();
        return invites.filter(i => !q || i.email.toLowerCase().includes(q));
    }, [invites, search]);

    const roleChanged = editingUser && editRole !== editingUser.role;
    const staffRoleChanged = editingUser && editRole === 'admin' && editStaffRole !== staffRoleOf(editingUser.staff_role);

    const pager = (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--admin-line)] px-5 py-3">
            <p className="admin-muted">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
                <ActionButton variant="outline" size="sm" icon={ChevronLeft} aria-label="Previous page" onClick={() => setPage(page - 1)} disabled={page <= 1 || loading} />
                <ActionButton variant="outline" size="sm" icon={ChevronRight} aria-label="Next page" onClick={() => setPage(page + 1)} disabled={page >= totalPages || loading} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Access"
                title={<>User <em>management</em></>}
                description="Manage system users, invites, and access controls."
                actions={
                    <>
                        <ActionButton variant="outline" icon={RefreshCw} onClick={() => { loadUsers(); loadInvites(); }} disabled={loading}>Refresh</ActionButton>
                        <ActionButton variant="primary" icon={Mail} onClick={() => setIsInviteOpen(true)}>Invite user</ActionButton>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Registered users" value={totalUsers.toLocaleString('en-IN')} hint="Across all pages" icon={Users} loading={loading} />
                <StatCard label="Admins on this page" value={adminsOnPage} hint="Full access" icon={ShieldCheck} tone="green" loading={loading} />
                <StatCard label="Pending invites" value={invites.length} hint="Awaiting sign-up" icon={Clock} tone="amber" loading={invitesLoading} />
            </div>

            {view === 'users' ? (
                <DataTableShell
                    title="Registered users"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search name, email, ID"
                    filters={[
                        { value: 'all', label: 'All roles', count: users.length },
                        { value: 'admin', label: 'Admin', count: adminsOnPage },
                        { value: 'user', label: 'User', count: users.length - adminsOnPage },
                    ]}
                    activeFilter={roleFilter}
                    onFilterChange={setRoleFilter}
                    actions={<ViewSwitch view={view} onChange={setView} inviteCount={invites.length} />}
                    loading={loading}
                    isEmpty={filteredUsers.length === 0}
                    emptyTitle="No users found"
                    emptyDescription="Try a different search or role filter."
                >
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User ID</th><th>Name</th><th>Role</th><th>Permissions</th><th>Joined</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <button type="button" title="Copy user ID" onClick={() => copy(user.id, 'User ID')} className="inline-flex items-center gap-1.5 font-mono text-[var(--admin-ink-soft)] hover:text-[var(--admin-accent)]">
                                            {user.id.substring(0, 8)}…<Copy className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <span className="admin-avatar">{(user.full_name || user.email || '?').slice(0, 1).toUpperCase()}</span>
                                            <span className="min-w-0">
                                                <span className="block font-semibold text-[var(--admin-ink)]">{user.full_name}</span>
                                                <span className="admin-muted">{user.email}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td>{user.role === 'admin' ? <span className="admin-badge admin-badge--bad">Admin · {STAFF_ROLES[staffRoleOf(user.staff_role)].label}</span> : <StatusBadge status="neutral" label={user.role} />}</td>
                                    <td>
                                        <div className="flex max-w-[320px] flex-wrap gap-1.5">
                                            {user.role === 'admin' ? (
                                                <span className="admin-badge admin-badge--info before:hidden">{STAFF_ROLES[staffRoleOf(user.staff_role)].description}</span>
                                            ) : user.permissions && user.permissions.length > 0 ? (
                                                user.permissions.map(p => <span key={p} className="admin-badge admin-badge--neutral before:hidden">{permLabel(p)}</span>)
                                            ) : <span className="admin-muted">-</span>}
                                        </div>
                                    </td>
                                    <td className="admin-muted whitespace-nowrap">{fmtDate(user.created_at)}</td>
                                    <td className="text-right">
                                        <ActionButton variant="soft" size="sm" icon={Pencil} onClick={() => openEdit(user)}>Edit access</ActionButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {pager}
                </DataTableShell>
            ) : (
                <DataTableShell
                    title="Pending invitations"
                    description="These users are assigned their roles automatically when they register."
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search invite email"
                    actions={<ViewSwitch view={view} onChange={setView} inviteCount={invites.length} />}
                    loading={invitesLoading}
                    isEmpty={filteredInvites.length === 0}
                    emptyTitle="No pending invites"
                    emptyDescription="Invite a teammate to give them access."
                >
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th><th>Assigned role</th><th>Permissions</th><th>Invited on</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvites.map((invite) => (
                                <tr key={invite.email}>
                                    <td className="font-semibold text-[var(--admin-ink)]">{invite.email}</td>
                                    <td><StatusBadge status="pending" label={invite.role} /></td>
                                    <td>
                                        <div className="flex max-w-[320px] flex-wrap gap-1.5">
                                            {invite.permissions?.length ? invite.permissions.map(p => (
                                                <span key={p} className="admin-badge admin-badge--neutral before:hidden">{permLabel(p)}</span>
                                            )) : <span className="admin-muted">-</span>}
                                        </div>
                                    </td>
                                    <td className="admin-muted whitespace-nowrap">{fmtDate(invite.created_at)}</td>
                                    <td className="text-right">
                                        <ActionButton variant="ghost" size="sm" icon={Trash2} className="!text-[var(--admin-bad)]" onClick={() => setRevoking(invite)}>Revoke</ActionButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DataTableShell>
            )}

            {/* Invite drawer */}
            <DetailDrawer
                open={isInviteOpen}
                onOpenChange={setIsInviteOpen}
                eyebrow="New access"
                title="Invite new user"
                description="They inherit these permissions when they sign up."
                footer={
                    <>
                        <ActionButton variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</ActionButton>
                        <ActionButton variant="primary" icon={Send} onClick={startInvite}>Send invite</ActionButton>
                    </>
                }
            >
                <div className="space-y-6">
                    <div>
                        <label htmlFor="invite-email" className="admin-label">Email</label>
                        <input id="invite-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="name@example.com" className="admin-field" />
                    </div>
                    <div>
                        <label htmlFor="invite-role" className="admin-label">Role</label>
                        <RoleSelect id="invite-role" value={inviteRole} onChange={setInviteRole} />
                    </div>
                    <div>
                        <p className="admin-label">Permissions</p>
                        <PermissionPicker idPrefix="invite" value={invitePermissions} onChange={setInvitePermissions} />
                    </div>
                </div>
            </DetailDrawer>

            {/* Edit drawer */}
            <DetailDrawer
                open={!!editingUser}
                onOpenChange={(o) => { if (!o) setEditingUser(null); }}
                eyebrow="Edit access"
                title={editingUser?.full_name || 'User'}
                description={editingUser?.email}
                footer={
                    <>
                        <ActionButton variant="ghost" onClick={() => setEditingUser(null)}>Cancel</ActionButton>
                        <ActionButton variant="primary" onClick={() => setConfirmEdit(true)}>Save changes</ActionButton>
                    </>
                }
            >
                {editingUser && (
                    <div className="space-y-6">
                        <dl className="admin-kv">
                            <dt>User ID</dt>
                            <dd><button type="button" onClick={() => copy(editingUser.id, 'User ID')} className="inline-flex items-center gap-1.5 text-left font-mono hover:text-[var(--admin-accent)]">{editingUser.id}<Copy className="h-3.5 w-3.5 shrink-0" /></button></dd>
                            <dt>Joined</dt><dd>{fmtDate(editingUser.created_at)}</dd>
                        </dl>
                        <div>
                            <label htmlFor="edit-role" className="admin-label">Role</label>
                            <RoleSelect id="edit-role" value={editRole} onChange={setEditRole} />
                        </div>
                        {editRole === 'admin' ? (
                            <fieldset>
                                <legend className="admin-label">Staff role</legend>
                                <div className="grid gap-2">
                                    {(Object.keys(STAFF_ROLES) as StaffRole[]).map((r) => (
                                        <label key={r} htmlFor={`staff-${r}`} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors ${editStaffRole === r ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]' : 'border-[var(--admin-line)] bg-white hover:border-[var(--admin-accent)]'}`}>
                                            <input id={`staff-${r}`} type="radio" name="staff-role" checked={editStaffRole === r} onChange={() => setEditStaffRole(r)} className="mt-1 h-4 w-4 accent-[var(--brand-blue)]" />
                                            <span>
                                                <span className="block font-semibold text-[var(--admin-ink)]">{STAFF_ROLES[r].label}</span>
                                                <span className="admin-muted block text-sm">{STAFF_ROLES[r].description}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        ) : (
                            <div>
                                <p className="admin-label">Permissions</p>
                                <PermissionPicker idPrefix="edit" value={editPermissions} onChange={setEditPermissions} />
                            </div>
                        )}
                    </div>
                )}
            </DetailDrawer>

            <ConfirmDialog
                open={confirmInvite}
                onOpenChange={(o) => { if (!isSubmitting) setConfirmInvite(o); }}
                title="Send invitation?"
                description={`${inviteEmail} will be invited as ${inviteRole} with ${invitePermissions.length} permission${invitePermissions.length === 1 ? '' : 's'}.`}
                confirmLabel="Send invite"
                loading={isSubmitting}
                onConfirm={handleInviteUser}
            />

            <ConfirmDialog
                open={confirmEdit}
                onOpenChange={(o) => { if (!isSubmitting) setConfirmEdit(o); }}
                title={roleChanged || staffRoleChanged ? 'Change role and access?' : 'Update permissions?'}
                description={editingUser ? (roleChanged
                    ? `${editingUser.full_name || editingUser.email} will change from ${editingUser.role} to ${editRole}.`
                    : staffRoleChanged
                        ? `${editingUser.full_name || editingUser.email} will become ${STAFF_ROLES[editStaffRole].label}: ${STAFF_ROLES[editStaffRole].description}.`
                        : `Permissions for ${editingUser.full_name || editingUser.email} will be updated.`) : undefined}
                confirmLabel="Save changes"
                tone={roleChanged && editRole === 'admin' ? 'danger' : 'default'}
                loading={isSubmitting}
                onConfirm={handleUpdateUser}
            />

            <ConfirmDialog
                open={!!revoking}
                onOpenChange={(o) => { if (!o && !isSubmitting) setRevoking(null); }}
                title="Revoke invitation?"
                description={revoking ? `${revoking.email} will no longer be able to claim this invite.` : undefined}
                confirmLabel="Revoke"
                tone="danger"
                loading={isSubmitting}
                onConfirm={handleDeleteInvite}
            />
        </div>
    );
};

const ViewSwitch = ({ view, onChange, inviteCount }: { view: 'users' | 'invites'; onChange: (v: 'users' | 'invites') => void; inviteCount: number }) => (
    <div className="flex gap-2" role="tablist">
        <button type="button" role="tab" className="admin-chip" data-active={view === 'users'} onClick={() => onChange('users')}>Active users</button>
        <button type="button" role="tab" className="admin-chip" data-active={view === 'invites'} onClick={() => onChange('invites')}>Pending invites<span className="opacity-70">{inviteCount}</span></button>
    </div>
);

export default UserManagement;
