import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
    Users, Trophy, BookOpen, Activity, Calendar, Award, UserPlus, CreditCard, FileText, RefreshCw, QrCode,
    ArrowUpRight, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import type { WorkflowDashboardStats } from '@/types/workflow';
import { PageHeader, StatCard, StatusBadge, EmptyState, ActionButton } from '@/components/admin/ui';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CampaignPerformanceWidget from '@/components/admin/CampaignPerformanceWidget';

const PAID_STATUSES = ['captured', 'paid', 'success', 'completed'];
const REFRESH_INTERVAL_MS = 60000;
const RECENT_LIMIT = 8;

// null means the table is not in the database, so its card is hidden.
type Stats = {
    totalUsers: number | null;
    totalRegistrations: number | null;
    paidRegistrations: number | null;
    qrScans: number | null;
    activeRewards: number | null;
    publishedArticles: number | null;
    upcomingTrials: number | null;
};

type RecentRegistration = {
    id: string;
    full_name: string | null;
    city: string | null;
    payment_status: string | null;
    created_at: string | null;
};

const quickActions = [
    { label: 'Schedule Trial', path: '/admin/trials', icon: Calendar },
    { label: 'Add Reward', path: '/admin/rewards', icon: Award },
    { label: 'Payments', path: '/admin/razorpay', icon: CreditCard },
    { label: 'Reports', path: '/admin/reports', icon: FileText },
];


const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recent, setRecent] = useState<RecentRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [funnel, setFunnel] = useState<WorkflowDashboardStats | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();
    const { getDashboardStats } = usePlayerWorkflow();

    useEffect(() => {
        getDashboardStats().then(setFunnel);
    }, [getDashboardStats, refreshKey]);

    useEffect(() => {
        let isMounted = true;

        const fetchDashboard = async (showErrors: boolean) => {
            // Use any cast to bypass strict type checks for new tables
            const supabaseClient = supabase as any;
            const today = new Date().toISOString().split('T')[0];
            // limit(0) instead of head so a missing table reports an error rather than an empty count
            const count = (query: any): Promise<number | null> => query.limit(0).then(({ count, error }: any) => {
                if (error) {
                    console.error('Dashboard count error:', error);
                    return null;
                }
                return count ?? 0;
            });
    
            try {
                const [
                    totalUsers, totalRegistrations, paidRegistrations,
                    activeRewards, publishedArticles, upcomingTrials, qrResult, recentResult,
                ] = await Promise.all([
                    count(supabaseClient.from('user_profiles').select('*', { count: 'exact' })),
                    count(supabaseClient.from('player_registrations').select('*', { count: 'exact' })),
                    count(supabaseClient.from('player_registrations').select('*', { count: 'exact' })
                        .in('payment_status', PAID_STATUSES)),
                    count(supabaseClient.from('rewards').select('*', { count: 'exact' })
                        .eq('is_active', true)),
                    count(supabaseClient.from('news_articles').select('*', { count: 'exact' })
                        .eq('is_published', true)),
                    count(supabaseClient.from('trials').select('*', { count: 'exact' })
                        .gte('trial_date', today)),
                    supabaseClient.from('qr_code_performance').select('total_scans'),
                    supabaseClient.from('player_registrations')
                        .select('id, full_name, city, payment_status, created_at')
                        .order('created_at', { ascending: false })
                        .limit(RECENT_LIMIT),
                ]);
    
                if (recentResult.error) console.error('Recent activity error:', recentResult.error);
                if (qrResult.error) console.error('QR scans error:', qrResult.error);
                const qrScans = qrResult.error
                    ? null
                    : (qrResult.data || []).reduce((sum: number, q: any) => sum + (q.total_scans || 0), 0);
    
                if (!isMounted) return;
                setStats({
                    totalUsers, totalRegistrations, paidRegistrations, qrScans,
                    activeRewards, publishedArticles, upcomingTrials,
                });
                setRecent(recentResult.data || []);
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                if (showErrors && isMounted) {
                    toast({
                        title: 'Error loading stats',
                        description: 'Could not fetch dashboard data',
                        variant: 'destructive',
                    });
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDashboard(true);
        const interval = setInterval(() => fetchDashboard(false), REFRESH_INTERVAL_MS);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [refreshKey, toast]);

    const allStatCards = [
        { title: 'Total Users', value: stats?.totalUsers, icon: Users, description: 'Registered platform users', tone: 'blue' as const, to: '/admin/users' },
        { title: 'Player Registrations', value: stats?.totalRegistrations, icon: UserPlus, description: typeof stats?.paidRegistrations === 'number' ? `${stats.paidRegistrations} paid` : 'All player sign-ups', tone: 'lime' as const, to: '/admin/trials' },
        { title: 'QR Scans', value: stats?.qrScans, icon: QrCode, description: 'Across all QR codes', tone: 'blue' as const, to: '/admin/analytics' },
        { title: 'Active Rewards', value: stats?.activeRewards, icon: Trophy, description: 'Live reward campaigns', tone: 'amber' as const, to: '/admin/rewards' },
        { title: 'Articles & News', value: stats?.publishedArticles, icon: BookOpen, description: 'Published content', tone: 'green' as const, to: '/admin/content' },
        { title: 'Upcoming Trials', value: stats?.upcomingTrials, icon: Activity, description: 'Scheduled from today onward', tone: 'blue' as const, to: '/admin/trials' },
    ];
    // While loading show every card; afterwards only those backed by an existing table
    const statCards = stats ? allStatCards.filter((card) => typeof card.value === 'number') : allStatCards;

    const refreshAll = () => setRefreshKey((k) => k + 1);

    const firstName = (user?.email || 'Admin').split('@')[0].replace(/[._-]+/g, ' ');

    const funnelSteps = funnel ? [
        { label: 'Registered', value: Number(funnel.total_registrations) },
        { label: 'Paid', value: Number(funnel.completed_payments) },
        { label: 'In trials section', value: Number(funnel.in_trials_section) },
        { label: 'Allocated', value: Number(funnel.trials_allocated) },
        { label: 'Attended', value: Number(funnel.attended) },
        { label: 'Selected', value: Number(funnel.selected) },
    ] : [];
    const funnelMax = Math.max(1, ...funnelSteps.map((f) => f.value));

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="Overview"
                title={<>Dash<em>board</em></>}
                description="Live view of registrations, payments and the trials pipeline."
                actions={(
                    <ActionButton variant="outline" icon={RefreshCw} onClick={refreshAll}>
                        {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Refresh'}
                    </ActionButton>
                )}
            />

            {/* Welcome hero */}
            <section className="admin-hero">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                    <div className="max-w-xl space-y-2">
                        <p className="admin-eyebrow !mb-0 !text-[var(--brand-lime)]"><Sparkles className="mr-2 inline h-4 w-4" />Welcome back</p>
                        <h2 className="font-[family-name:var(--brand-font-display)] text-[length:var(--brand-fs-h2-sub)] font-bold italic uppercase leading-none text-white">{firstName}</h2>
                        <p className="text-[length:var(--brand-fs-body)] text-white/80">
                            {typeof funnel?.pending_payments === 'number' || typeof funnel?.in_trials_section === 'number'
                                ? `${Number(funnel?.in_trials_section ?? 0)} players are waiting to be allocated to a trial.`
                                : 'Pick up where you left off.'}
                        </p>
                    </div>
                    <Link to="/admin/trials" className="admin-btn admin-btn--primary">
                        Open trials workflow <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* Stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {statCards.map((stat) => (
                    <StatCard
                        key={stat.title}
                        label={stat.title}
                        value={typeof stat.value === 'number' ? stat.value.toLocaleString() : '-'}
                        hint={stat.description}
                        icon={stat.icon}
                        tone={stat.tone}
                        to={stat.to}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Pipeline funnel */}
            <section className="admin-card p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="admin-eyebrow">Trials pipeline</p>
                        <h2 className="admin-h3">Registration to selection</h2>
                    </div>
                    <Link to="/admin/trials" className="admin-btn admin-btn--soft admin-btn--sm">Manage <ArrowUpRight className="h-4 w-4" /></Link>
                </div>
                {!funnel ? (
                    <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-8 animate-pulse rounded-full bg-[var(--brand-sky)]" />)}</div>
                ) : (
                    <ul className="space-y-3">
                        {funnelSteps.map((step, i) => (
                            <li key={step.label} className="grid grid-cols-[120px_1fr_48px] items-center gap-3 sm:grid-cols-[160px_1fr_56px]">
                                <span className="admin-muted truncate">{step.label}</span>
                                <div className="h-8 overflow-hidden rounded-full bg-[var(--brand-sky)]">
                                    <div
                                        className="h-full rounded-full transition-[width] duration-700"
                                        style={{
                                            width: `${Math.max(step.value ? 4 : 0, (step.value / funnelMax) * 100)}%`,
                                            background: i === funnelSteps.length - 1
                                                ? 'linear-gradient(90deg, var(--brand-lime), var(--brand-lime-deep))'
                                                : 'linear-gradient(90deg, var(--brand-blue), #4c7ff0)',
                                        }}
                                    />
                                </div>
                                <span className="admin-num !text-[length:var(--brand-fs-h3)] text-right">{step.value}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Campaign Tracking */}
            <CampaignPerformanceWidget refreshKey={refreshKey} />

            {/* Recent activity & quick actions */}
            <div className="grid gap-4 lg:grid-cols-7">
                <section className="admin-card overflow-hidden lg:col-span-4">
                    <header className="flex items-center justify-between border-b border-[var(--admin-line)] p-5">
                        <h2 className="admin-h3">Recent registrations</h2>
                        <Link to="/admin/trials" className="admin-btn admin-btn--ghost admin-btn--sm">View all</Link>
                    </header>
                    {loading ? (
                        <div className="space-y-3 p-5">{[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--brand-sky)]" />)}</div>
                    ) : recent.length === 0 ? (
                        <EmptyState icon={UserPlus} title="No registrations yet" description="New player sign-ups will appear here." />
                    ) : (
                        <ul className="divide-y divide-[var(--admin-line)]">
                            {recent.map((r) => (
                                <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#f8fbff]">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-sky-2)] font-[family-name:var(--brand-font-display)] font-bold text-[var(--brand-blue)]">
                                            {(r.full_name || '?').slice(0, 1).toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-[var(--admin-ink)]">{r.full_name || 'Unnamed player'}</p>
                                            <p className="admin-muted truncate">
                                                {[r.city, r.created_at && formatDistanceToNow(new Date(r.created_at), { addSuffix: true })].filter(Boolean).join(' · ')}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={r.payment_status || 'pending'} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="admin-card p-5 lg:col-span-3">
                    <h2 className="admin-h3 mb-4">Quick actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <Link
                                key={action.path}
                                to={action.path}
                                className="admin-card admin-card--lift group flex flex-col items-start gap-3 !shadow-none p-4"
                            >
                                <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-sky-2)] text-[var(--brand-blue)] transition-colors group-hover:bg-[var(--brand-lime)] group-hover:text-[var(--brand-navy)]">
                                    <action.icon className="h-5 w-5" />
                                </span>
                                <span className="font-[family-name:var(--brand-font-display)] font-bold uppercase tracking-[var(--brand-ls-btn)] text-[var(--admin-ink)]">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
