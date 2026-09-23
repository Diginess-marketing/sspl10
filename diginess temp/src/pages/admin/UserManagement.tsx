import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { adminService, AdminUser, AdminInvite } from '@/services/adminService';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, MoreHorizontal, Trash2, Mail } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';

// Available permissions
const AVAILABLE_PERMISSIONS = [
    { id: 'view_analytics', label: 'View Analytics' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_rewards', label: 'Manage Rewards' },
    { id: 'manage_trials', label: 'Manage Trials/Workflow' },
    { id: 'view_financials', label: 'View Financials' },
];

const UserManagement = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [invites, setInvites] = useState<AdminInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [invitesLoading, setInvitesLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { toast } = useToast();
    const PAGE_SIZE = 10;

    // Invite Modal State
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('user');
    const [invitePermissions, setInvitePermissions] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit Modal State
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [editRole, setEditRole] = useState('user');
    const [editPermissions, setEditPermissions] = useState<string[]>([]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const { data, count } = await adminService.getUsers(page, PAGE_SIZE);
            setUsers(data);
            setTotalPages(Math.ceil(count / PAGE_SIZE));
        } catch (error) {
            console.error('Failed to load users', error);
            toast({
                title: 'Error',
                description: 'Failed to load users list',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const loadInvites = async () => {
        try {
            setInvitesLoading(true);
            const data = await adminService.getInvites();
            setInvites(data);
        } catch (error) {
            console.error('Failed to load invites', error);
        } finally {
            setInvitesLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
        loadInvites();
    }, [page]);

    const handleInviteUser = async () => {
        if (!inviteEmail) {
            toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
            return;
        }

        try {
            setIsSubmitting(true);
            await adminService.inviteUser(inviteEmail, inviteRole, invitePermissions);
            toast({ title: 'Success', description: `Invitation sent to ${inviteEmail}` });
            setIsInviteOpen(false);
            setInviteEmail('');
            setInvitePermissions([]);
            loadInvites();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create invite', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteInvite = async (email: string) => {
        try {
            await adminService.deleteInvite(email);
            toast({ title: 'Success', description: 'Invite revoked' });
            loadInvites();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete invite', variant: 'destructive' });
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            setIsSubmitting(true);
            await adminService.updateUserRole(editingUser.id, editRole, editPermissions);
            toast({ title: 'Success', description: 'User updated successfully' });
            setEditingUser(null);
            loadUsers();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setEditRole(user.role);
        setEditPermissions(user.permissions || []);
    };

    // Helper to toggle permission in array
    const togglePermission = (permId: string, currentList: string[], setter: (val: string[]) => void) => {
        if (currentList.includes(permId)) {
            setter(currentList.filter(p => p !== permId));
        } else {
            setter([...currentList, permId]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                    <p className="text-muted-foreground mt-1">Manage system users, invites, and access controls.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Mail className="mr-2 h-4 w-4" />
                                Invite User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Invite New User</DialogTitle>
                                <DialogDescription>
                                    Send an invitation to a new user. They will inherit these permissions upon signing up.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input
                                        id="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">Role</Label>
                                    <Select value={inviteRole} onValueChange={setInviteRole}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <Label>Permissions</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {AVAILABLE_PERMISSIONS.map((perm) => (
                                            <div key={perm.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`invite-${perm.id}`}
                                                    checked={invitePermissions.includes(perm.id)}
                                                    onCheckedChange={() => togglePermission(perm.id, invitePermissions, setInvitePermissions)}
                                                />
                                                <label
                                                    htmlFor={`invite-${perm.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {perm.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                                <Button onClick={handleInviteUser} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Send Invite
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={() => { loadUsers(); loadInvites(); }} variant="outline" size="sm">
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList>
                    <TabsTrigger value="users">Active Users</TabsTrigger>
                    <TabsTrigger value="invites">Pending Invites</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                            <CardTitle>Registered Users</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-12 flex justify-center">
                                    <LoadingSpinner text="Loading users..." />
                                </div>
                            ) : (
                                <div className="relative w-full overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User ID</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Permissions</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                        No users found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                users.map((user) => (
                                                    <TableRow key={user.id} className="hover:bg-slate-50/50">
                                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                                            {user.id.substring(0, 8)}...
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-slate-900">{user.full_name}</span>
                                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={user.role === 'admin' ? 'destructive' : 'secondary'}
                                                                className="bg-opacity-10 text-opacity-100"
                                                            >
                                                                {user.role}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {user.role === 'admin' ? (
                                                                    <Badge variant="outline" className="text-xs">All Permissions</Badge>
                                                                ) : user.permissions && user.permissions.length > 0 ? (
                                                                    user.permissions.map(p => (
                                                                        <Badge key={p} variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                                            {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                                                                        </Badge>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground">-</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground text-sm">
                                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem
                                                                        onClick={() => navigator.clipboard.writeText(user.id)}
                                                                    >
                                                                        Copy User ID
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => openEditModal(user)}>
                                                                        Edit Role & Permissions
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1 || loading}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages || loading}
                        >
                            Next
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="invites">
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-slate-50/50 border-b border-gray-100">
                            <CardTitle>Pending Invitations</CardTitle>
                            <CardDescription>
                                These users will be automatically assigned their roles upon registration.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {invitesLoading ? (
                                <div className="p-12 flex justify-center">
                                    <LoadingSpinner text="Loading invites..." />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Assigned Role</TableHead>
                                            <TableHead>Permissions</TableHead>
                                            <TableHead>Invited On</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invites.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    No pending invites.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            invites.map((invite) => (
                                                <TableRow key={invite.email}>
                                                    <TableCell className="font-medium">{invite.email}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{invite.role}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {invite.permissions?.map(p => (
                                                                <Badge key={p} variant="outline" className="text-[10px]">
                                                                    {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {new Date(invite.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteInvite(invite.email)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit User Modal */}
            <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Access</DialogTitle>
                        <DialogDescription>
                            Update role and permissions for {editingUser?.full_name || 'user'}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-role" className="text-right">Role</Label>
                            <Select value={editRole} onValueChange={setEditRole}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3 pt-2">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {AVAILABLE_PERMISSIONS.map((perm) => (
                                    <div key={perm.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-${perm.id}`}
                                            checked={editPermissions.includes(perm.id)}
                                            onCheckedChange={() => togglePermission(perm.id, editPermissions, setEditPermissions)}
                                        />
                                        <label
                                            htmlFor={`edit-${perm.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {perm.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                        <Button onClick={handleUpdateUser} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;

