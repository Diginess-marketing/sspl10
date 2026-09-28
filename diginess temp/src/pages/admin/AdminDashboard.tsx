import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users, Trophy, BookOpen, Activity, Calendar, Award, UserPlus, CreditCard, FileText, RefreshCw, QrCode,
} from 'lucide-react';
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

const isPaid = (status: string | null) => PAID_STATUSES.includes((status || '').toLowerCase());

const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recent, setRecent] = useState<RecentRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const { toast } = useToast();

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
        {
            title: 'Total Users',
            value: stats?.totalUsers,
            icon: Users,
            description: 'Registered platform users',
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            title: 'Player Registrations',
            value: stats?.totalRegistrations,
            icon: UserPlus,
            description: typeof stats?.paidRegistrations === 'number' ? `${stats.paidRegistrations} paid` : 'All player sign-ups',
            color: 'text-cyan-500',
            bg: 'bg-cyan-50',
        },
        {
            title: 'QR Scans',
            value: stats?.qrScans,
            icon: QrCode,
            description: 'Across all QR codes',
            color: 'text-pink-500',
            bg: 'bg-pink-50',
        },
        {
            title: 'Active Rewards',
            value: stats?.activeRewards,
            icon: Trophy,
            description: 'Live reward campaigns',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
        {
            title: 'Articles & News',
            value: stats?.publishedArticles,
            icon: BookOpen,
            description: 'Published content',
            color: 'text-green-500',
            bg: 'bg-green-50',
        },
        {
            title: 'Upcoming Trials',
            value: stats?.upcomingTrials,
            icon: Activity,
            description: 'Scheduled from today onward',
            color: 'text-purple-500',
            bg: 'bg-purple-50',
        },
    ];
    // While loading show every card; afterwards only those backed by an existing table
    const statCards = stats ? allStatCards.filter((card) => typeof card.value === 'number') : allStatCards;

    const refreshAll = () => setRefreshKey((k) => k + 1);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Welcome back! Here's an overview of the SSPL platform.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={refreshAll}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-slate-900 transition-colors"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Refresh'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-sans">
                                {loading || typeof stat.value !== 'number' ? '-' : stat.value.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Campaign Tracking */}
            <CampaignPerformanceWidget refreshKey={refreshKey} />

            {/* Recent Activity & Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3 animate-pulse">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                                ))}
                            </div>
                        ) : recent.length === 0 ? (
                            <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                No registrations yet
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recent.map((r) => (
                                    <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                {r.full_name || 'Unnamed player'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {[r.city, r.created_at && formatDistanceToNow(new Date(r.created_at), { addSuffix: true })]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                isPaid(r.payment_status)
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-amber-50 text-amber-700'
                                            }`}
                                        >
                                            {isPaid(r.payment_status) ? 'Paid' : (r.payment_status || 'pending')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.path}
                                    to={action.path}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                                >
                                    <action.icon className="h-6 w-6 text-slate-600 mb-2" />
                                    <span className="text-xs font-medium text-slate-900">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
