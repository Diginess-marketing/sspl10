import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Trophy, ChartBar, Settings, LogOut, Menu, FileText, ClipboardList, Building2, Award,
    CheckCircle, MessageCircle, Mail, UserCheck, Search, PanelLeftClose, PanelLeftOpen, ExternalLink, ChevronRight, Home,
    type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import '@/styles/admin.css';

interface NavItem { label: string; path: string; icon: LucideIcon; permission?: string }
interface NavGroup { title: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
    { title: 'Overview', items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ] },
    { title: 'Players & Trials', items: [
        { label: 'All Players', path: '/admin/players', icon: Users, permission: 'manage_trials' },
        { label: 'Trials', path: '/admin/trials', icon: ClipboardList, permission: 'manage_trials' },
        { label: 'Selection Status', path: '/admin/selection-status', icon: CheckCircle },
        { label: 'Certificates', path: '/admin/certificates', icon: Award },
        { label: 'Selectors', path: '/admin/selectors', icon: UserCheck, permission: 'manage_users' },
        { label: 'Organizers', path: '/admin/organizers', icon: Building2, permission: 'manage_users' },
    ] },
    { title: 'Growth', items: [
        { label: 'Payments', path: '/admin/razorpay', icon: ChartBar, permission: 'manage_trials' },
        { label: 'Reports', path: '/admin/reports', icon: FileText, permission: 'manage_trials' },
        { label: 'WhatsApp', path: '/admin/whatsapp', icon: MessageCircle },
        { label: 'Emails', path: '/admin/emails', icon: Mail },
    ] },
    { title: 'Content', items: [
        { label: 'Content', path: '/admin/content', icon: FileText },
        { label: 'Rewards', path: '/admin/rewards', icon: Trophy, permission: 'manage_rewards' },
    ] },
    { title: 'System', items: [
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
    ] },
];

const isActivePath = (current: string, path: string) =>
    path === '/admin' ? current === '/admin' : current === path || current.startsWith(`${path}/`);

interface SidebarContentProps {
    groups: NavGroup[];
    pathname: string;
    collapsed?: boolean;
    onNavigate?: () => void;
}

const SidebarContent = ({ groups, pathname, collapsed = false, onNavigate }: SidebarContentProps) => (
    <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Admin">
        {groups.map((group) => (
            <div key={group.title}>
                {collapsed
                    ? <div className="mx-3 my-3 h-px bg-[var(--admin-line)]" />
                    : <p className="admin-nav-group">{group.title}</p>}
                <div className="space-y-1">
                    {group.items.map((item) => {
                        const active = isActivePath(pathname, item.path);
                        const link = (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onNavigate}
                                data-active={active}
                                aria-current={active ? 'page' : undefined}
                                className={`admin-nav-item ${collapsed ? 'justify-center !px-0' : ''}`}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                                {active && !collapsed && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
                            </Link>
                        );
                        return collapsed ? (
                            <Tooltip key={item.path}>
                                <TooltipTrigger asChild>{link}</TooltipTrigger>
                                <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                        ) : link;
                    })}
                </div>
            </div>
        ))}
    </nav>
);

// Always-visible sign out at the bottom of the sidebar (the avatar menu also has one)
const SignOutButton = ({ collapsed = false, onSignOut }: { collapsed?: boolean; onSignOut: () => void }) => (
    <button
        type="button"
        onClick={onSignOut}
        className={`admin-nav-item admin-nav-item--danger w-full ${collapsed ? 'justify-center !px-0' : ''}`}
        aria-label="Sign out"
        title="Sign out"
    >
        <LogOut className="h-5 w-5 shrink-0" />
        {!collapsed && <span>Sign out</span>}
    </button>
);

const Brand = ({ collapsed = false }: { collapsed?: boolean }) => (
    <Link to="/admin" className="flex h-[72px] items-center gap-3 px-5" aria-label="SSPL Admin home">
        <img src="/assets/img/sspl-logo-color.png" alt="" className="h-10 w-10 shrink-0 object-contain" />
        {!collapsed && (
            <span className="leading-none">
                <span className="block font-[family-name:var(--brand-font-display)] text-[length:var(--brand-fs-h3)] font-bold uppercase italic text-[var(--brand-navy)]">SSPL</span>
                <span className="admin-eyebrow !mb-0">Admin console</span>
            </span>
        )}
    </Link>
);

interface AdminLayoutProps { children?: ReactNode }

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut, hasPermission, userRole } = useAuth();

    // Dialogs, dropdowns and popovers render in portals outside the shell; this body class
    // keeps the legacy admin text-colour fix in index.css working for pages not yet redesigned.
    useEffect(() => {
        document.body.classList.add('admin-mode');
        return () => document.body.classList.remove('admin-mode');
    }, []);

    // Cmd/Ctrl+K opens the command palette
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen((o) => !o);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const groups = useMemo(
        () => NAV_GROUPS
            .map((g) => ({ ...g, items: g.items.filter((i) => !i.permission || hasPermission(i.permission)) }))
            .filter((g) => g.items.length > 0),
        [hasPermission],
    );
    const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
    const current = flatItems.find((i) => isActivePath(location.pathname, i.path));
    const currentGroup = groups.find((g) => g.items.some((i) => i === current));

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    const go = (path: string) => { setPaletteOpen(false); navigate(path); };
    const initials = (user?.email || 'AD').slice(0, 2).toUpperCase();

    return (
        <div className="admin-shell flex h-screen overflow-hidden">
            {/* Desktop sidebar */}
            <aside
                className={`hidden shrink-0 flex-col border-r border-[var(--admin-line)] bg-white transition-[width] duration-300 lg:flex ${collapsed ? 'w-[84px]' : 'w-[272px]'}`}
            >
                <Brand collapsed={collapsed} />
                <SidebarContent groups={groups} pathname={location.pathname} collapsed={collapsed} />
                <div className="space-y-1 border-t border-[var(--admin-line)] p-3">
                    <a href="/" target="_blank" rel="noreferrer" className={`admin-nav-item ${collapsed ? 'justify-center !px-0' : ''}`}>
                        <ExternalLink className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>View website</span>}
                    </a>
                    <SignOutButton collapsed={collapsed} onSignOut={handleSignOut} />
                </div>
            </aside>

            {/* Mobile drawer */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="admin-shell flex w-[300px] flex-col gap-0 border-r border-[var(--admin-line)] bg-white p-0">
                    <SheetTitle className="sr-only">Admin navigation</SheetTitle>
                    <Brand />
                    <SidebarContent groups={groups} pathname={location.pathname} onNavigate={() => setMobileOpen(false)} />
                    <div className="border-t border-[var(--admin-line)] p-3">
                        <SignOutButton onSignOut={handleSignOut} />
                    </div>
                </SheetContent>
            </Sheet>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Top bar */}
                <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-[var(--admin-line)] bg-white/85 px-4 backdrop-blur lg:px-8">
                    <button type="button" className="admin-btn admin-btn--ghost admin-btn--icon lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                        <Menu className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--icon hidden lg:inline-flex"
                        onClick={() => setCollapsed((c) => !c)}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                    </button>

                    <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 sm:flex">
                        <Link to="/admin" className="admin-muted inline-flex items-center gap-1 hover:text-[var(--admin-accent)]"><Home className="h-4 w-4" />Admin</Link>
                        {currentGroup && current && current.path !== '/admin' && (
                            <>
                                <ChevronRight className="h-4 w-4 text-[var(--admin-ink-soft)]" />
                                <span className="admin-muted">{currentGroup.title}</span>
                                <ChevronRight className="h-4 w-4 text-[var(--admin-ink-soft)]" />
                                <span className="truncate font-semibold text-[var(--admin-ink)]">{current.label}</span>
                            </>
                        )}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPaletteOpen(true)}
                            className="admin-input !flex !w-auto items-center gap-3 !pl-4 pr-3 text-left text-[var(--admin-ink-soft)] sm:!w-64"
                            aria-label="Search pages and actions"
                        >
                            <Search className="h-4 w-4" />
                            <span className="hidden flex-1 sm:inline">Search or jump to…</span>
                            <kbd className="hidden rounded-md border border-[var(--admin-line)] bg-[var(--admin-bg)] px-1.5 text-sm sm:inline">⌘K</kbd>
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-blue)]/30" aria-label="Account menu">
                                    <Avatar className="h-10 w-10 border-2 border-[var(--brand-lime)]">
                                        <AvatarFallback className="bg-[var(--brand-navy)] font-[family-name:var(--brand-font-display)] font-bold text-white">{initials}</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="admin-shell w-64 rounded-2xl border-[var(--admin-line)] bg-white p-2">
                                <DropdownMenuLabel className="space-y-1">
                                    <p className="truncate font-semibold text-[var(--admin-ink)]">{user?.email || 'Admin'}</p>
                                    <span className="admin-badge admin-badge--info">{userRole || 'no role'}</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer rounded-xl" onClick={() => navigate('/admin/settings')}><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer rounded-xl" onClick={() => window.open('/', '_blank')}><ExternalLink className="mr-2 h-4 w-4" />View website</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer rounded-xl text-[var(--admin-bad)] focus:text-[var(--admin-bad)]" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="admin-scope flex-1 overflow-auto">
                    <div className="mx-auto w-full max-w-[1480px] p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
                        {children ?? <Outlet />}
                    </div>
                </main>
            </div>

            {/* Command palette */}
            <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
                <CommandInput placeholder="Jump to a page or action…" />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Pages">
                        {flatItems.map((item) => (
                            <CommandItem key={item.path} value={item.label} onSelect={() => go(item.path)} className="cursor-pointer">
                                <item.icon className="mr-2 h-4 w-4" />{item.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandGroup heading="Actions">
                        <CommandItem value="move players to trials" onSelect={() => go('/admin/trials')} className="cursor-pointer"><ClipboardList className="mr-2 h-4 w-4" />Move players to trials</CommandItem>
                        <CommandItem value="add reward" onSelect={() => go('/admin/rewards')} className="cursor-pointer"><Trophy className="mr-2 h-4 w-4" />Add a reward</CommandItem>
                        <CommandItem value="sign out" onSelect={handleSignOut} className="cursor-pointer"><LogOut className="mr-2 h-4 w-4" />Sign out</CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </div>
    );
};

export default AdminLayout;
