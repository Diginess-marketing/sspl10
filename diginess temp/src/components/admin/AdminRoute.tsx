import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/admin.css';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { AlertCircle } from 'lucide-react';
import MfaGate from './MfaGate';

interface AdminRouteProps {
    children: React.ReactNode;
    requiredPermission?: string;
}

const AdminRoute = ({ children, requiredPermission }: AdminRouteProps) => {
    const { user, userRole, loading, roleLoading, hasPermission } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !roleLoading) {
            if (!user) {
                navigate('/auth', { state: { from: location.pathname } });
            } else if (userRole !== 'admin' && !hasPermission(requiredPermission || '')) {
                // If not admin and doesn't have required permission (or 'admin' role check fails)
                // Note: hasPermission('admin') isn't standard, we check userRole !== 'admin' mostly.
                // But wait, hasPermission implementation handles admin role check.
            }
        }
    }, [user, userRole, loading, roleLoading, navigate, location, hasPermission, requiredPermission]);

    if (loading || roleLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" text="Verifying access..." />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    // Access rule: super admins always pass; otherwise a page that names a required permission
    // lets in anyone holding it. Pages with no named permission are admin-only.
    const isSuperAdmin = userRole === 'admin';
    const hasRequiredAccess = isSuperAdmin || (requiredPermission && hasPermission(requiredPermission));
    const isAllowed = requiredPermission ? hasRequiredAccess : isSuperAdmin;

    if (!isAllowed) {
        return (
            <div className="admin-shell flex h-screen w-full items-center justify-center p-6">
                <div className="admin-card max-w-md space-y-4 p-8 text-center">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--admin-bad-bg)] text-[var(--admin-bad)]">
                        <AlertCircle className="h-8 w-8" />
                    </span>
                    <h1 className="admin-title">Access <em>denied</em></h1>
                    <p className="admin-muted">
                        Your account does not have admin access. Ask an administrator to grant you the admin role.
                        {requiredPermission && <span className="mt-2 block font-mono">Missing: {requiredPermission}</span>}
                    </p>
                    <button type="button" className="admin-btn admin-btn--primary" onClick={() => navigate('/')}>Return to home</button>
                </div>
            </div>
        );
    }

    // Admins with two-step sign-in are asked for their code before the panel opens
    return <MfaGate>{children}</MfaGate>;
};

export default AdminRoute;
