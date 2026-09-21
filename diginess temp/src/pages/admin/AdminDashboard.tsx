import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, BookOpen, Activity, Calendar, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CoimbatoreCampaignWidget from '@/components/admin/CoimbatoreCampaignWidget';
const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRewards: 0,
        totalArticles: 0,
        activeTrials: 0,
    });
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Use any cast to bypass strict type checks for new tables
                const supabaseClient = supabase as any;

                const { count: usersCount } = await supabaseClient
                    .from('user_profiles')
                    .select('*', { count: 'exact', head: true });

                const { count: rewardsCount } = await supabaseClient
                    .from('rewards')
                    .select('*', { count: 'exact', head: true });

                const { count: articlesCount } = await supabaseClient
                    .from('news_articles')
                    .select('*', { count: 'exact', head: true });

                setStats({
                    totalUsers: usersCount || 0,
                    totalRewards: rewardsCount || 0,
                    totalArticles: articlesCount || 0,
                    activeTrials: 3,
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                toast({
                    title: 'Error loading stats',
                    description: 'Could not fetch dashboard data',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [toast]);

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            description: 'Registered platform users',
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            title: 'Active Rewards',
            value: stats.totalRewards,
            icon: Trophy,
            description: 'Live reward campaigns',
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
        {
            title: 'Articles & News',
            value: stats.totalArticles,
            icon: BookOpen,
            description: 'Published content',
            color: 'text-green-500',
            bg: 'bg-green-50',
        },
        {
            title: 'Active Trials',
            value: stats.activeTrials,
            icon: Activity,
            description: 'Ongoing trial events',
            color: 'text-purple-500',
            bg: 'bg-purple-50',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back! Here's an overview of the SSPL platform.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-sans">{loading ? '-' : stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Campaign Tracking */}
            <div className="mt-8">
                <CoimbatoreCampaignWidget />
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                            Activity feed integration coming soon
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100">
                                <Calendar className="h-6 w-6 text-slate-600 mb-2" />
                                <span className="text-xs font-medium text-slate-900">Schedule Trial</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100">
                                <Award className="h-6 w-6 text-slate-600 mb-2" />
                                <span className="text-xs font-medium text-slate-900">Add Reward</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
