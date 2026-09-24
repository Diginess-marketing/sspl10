import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    Users,
    Trophy,
    ChartBar,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Shield,
    FileText,
    ClipboardList,
    Building2,
    Award,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut, hasPermission, userRole } = useAuth();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    const navItems = [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Selectors', path: '/admin/selectors', icon: Users, permission: 'manage_users' },
        { label: 'Organizers', path: '/admin/organizers', icon: Building2, permission: 'manage_users' },
        { label: 'Rewards', path: '/admin/rewards', icon: Trophy, permission: 'manage_rewards' },
        { label: 'Trials', path: '/admin/trials', icon: ClipboardList, permission: 'manage_trials' },
        { label: 'Reports', path: '/admin/reports', icon: FileText, permission: 'manage_trials' },
        { label: 'Payments', path: '/admin/razorpay', icon: ChartBar, permission: 'manage_trials' },
        { label: 'WhatsApp', path: '/admin/whatsapp', icon: Shield },
        { label: 'Selection Status', path: '/admin/selection-status', icon: CheckCircle },
        { label: 'Certificates', path: '/admin/certificates', icon: Award },
        { label: 'Content', path: '/admin/content', icon: FileText },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'
                    } lg:relative`}
            >
                <div className="flex h-full flex-col">
                    {/* Sidebar Header */}
                    <div className="flex h-16 items-center justify-between px-4 mt-6">
                        {isSidebarOpen ? (
                            <div className="flex items-center gap-2 font-bold text-xl text-ssp-400">
                                <Shield className="h-6 w-6 text-sport-yellow" />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sport-yellow to-white">
                                    SSPL Admin
                                </span>
                            </div>
                        ) : (
                            <div className="mx-auto">
                                <Shield className="h-8 w-8 text-sport-yellow" />
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="text-gray-400 hover:text-white hidden lg:flex"
                        >
                            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {navItems.filter(item => !item.permission || hasPermission(item.permission)).map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group relative ${isActive
                                        ? 'bg-sport-blue/20 text-sport-yellow shadow-lg shadow-sport-blue/5'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon
                                        className={`h-5 w-5 transition-colors ${isActive ? 'text-sport-yellow' : 'text-gray-400 group-hover:text-white'
                                            }`}
                                    />
                                    {isSidebarOpen && (
                                        <span className="font-medium tracking-wide">{item.label}</span>
                                    )}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-3 rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-50">
                                            {item.label}
                                        </div>
                                    )}
                                    {isActive && isSidebarOpen && (
                                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="border-t border-white/10 p-4 bg-black/20">
                        <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                            <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-sport-blue text-xs font-bold text-white">
                                    AD
                                </AvatarFallback>
                            </Avatar>
                            {isSidebarOpen && (
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-white">
                                        {user?.email || 'Admin User'}
                                    </p>
                                    <div className="flex flex-col">
                                        <p className="truncate text-xs text-gray-500">Administrator</p>
                                        <p className="text-[10px] text-yellow-500 truncate">
                                            Role: {userRole || 'None'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {isSidebarOpen && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-gray-400 hover:text-red-400 -mr-2"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-scope flex-1 overflow-auto bg-gray-50/50 relative">
                {/* Mobile Header */}
                <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
                        <Shield className="h-5 w-5 text-sport-blue" />
                        SSPL Admin
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <Menu className="h-6 w-6 text-slate-600" />
                    </Button>
                </div>

                {/* Mobile Sidebar Overlay */}
                {!isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    />
                )}

                <div className="container mx-auto max-w-7xl p-6 lg:p-8 animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
