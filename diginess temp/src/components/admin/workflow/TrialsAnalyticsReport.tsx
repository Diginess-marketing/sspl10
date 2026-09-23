import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, Users, CreditCard, MapPin, XCircle, Trophy } from 'lucide-react';
import stagingData from '@/data/registration_import_staging.json';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const TrialsAnalyticsReport = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-trials-analytics'],
    queryFn: async () => {
      const [regsResponse, progressResponse] = await Promise.all([
        supabase
          .from('player_registrations')
          .select('payment_status, city, state, position, status, created_at, phone'),
        supabase
          .from('trial_progress')
          .select('l1_result, l2_result, l3_result, l1_attendance, l2_attendance, l3_attendance, l1_called, l2_called, l3_called, final_status'),
      ]);

      if (regsResponse.error) throw regsResponse.error;
      if (progressResponse.error) throw progressResponse.error;

      return {
        dbPlayers: regsResponse.data,
        trialProgress: progressResponse.data,
      };
    },
  });

  const dbPlayers = analyticsData?.dbPlayers;
  const trialProgress = analyticsData?.trialProgress;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  // Combine DB and Staging data for overview
  const totalDb = dbPlayers?.length || 0;
  const totalStaging = stagingData.length;
  const totalPotential = totalDb + totalStaging;

  // Process transactions and unique player attempts
  const playerGroups = dbPlayers?.reduce((acc: any, p) => {
    const key = p.phone || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p.payment_status?.toLowerCase());
    return acc;
  }, {});

  const totalTransactions = totalDb;
  const capturedTransactionsCount = dbPlayers?.filter(p => 
    ['captured', 'completed', 'paid', 'success'].includes(p.payment_status?.toLowerCase() || ''),
  ).length || 0;
  const failedTransactionsCount = totalTransactions - capturedTransactionsCount;

  const totalUniquePlayers = Object.keys(playerGroups || {}).length;
  const capturedPlayersCount = Object.values(playerGroups || {}).filter((statuses: any) => 
    statuses.some((s: string) => ['captured', 'completed', 'paid', 'success'].includes(s)),
  ).length;
  const netFailedPlayers = totalUniquePlayers - capturedPlayersCount;

  // Process Location data (Top 5 States)
  const stateCounts = dbPlayers?.reduce((acc: any, p) => {
    acc[p.state] = (acc[p.state] || 0) + 1;
    return acc;
  }, {});
  
  const stateData = Object.entries(stateCounts || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  // Process Category data
  const categoryCounts = dbPlayers?.reduce((acc: any, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryCounts || {}).map(([name, value]) => ({ name, value }));

  // Process Payment status
  const paymentCounts = dbPlayers?.reduce((acc: any, p) => {
    acc[p.payment_status] = (acc[p.payment_status] || 0) + 1;
    return acc;
  }, {});
  const paymentData = Object.entries(paymentCounts || {}).map(([name, value]) => ({ name, value }));

  // Process Trial Funnel Data
  const funnelData = [
    { name: 'L1 Pool', count: trialProgress?.length || 0, color: '#3b82f6' },
    { name: 'L1 Selected', count: trialProgress?.filter(p => p.l1_result === 'SELECTED' || p.l3_result === 'SELECTED').length || 0, color: '#6366f1' },
    { name: 'L2 Selected', count: trialProgress?.filter(p => p.l2_result === 'SELECTED' || p.l3_result === 'SELECTED').length || 0, color: '#8b5cf6' },
    { name: 'L3 Selected', count: trialProgress?.filter(p => p.l3_result === 'SELECTED').length || 0, color: '#10b981' },
  ];

  return (
    <div className="space-y-6 container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Attempts</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">All registration records</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Failed Trans.</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedTransactionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Non-captured attempts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Net Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{netFailedPlayers}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique users lost</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Successful</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {capturedPlayersCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unique paid players</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Trial Selection</CardTitle>
            <MapPin className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funnelData[3].count}</div>
            <p className="text-xs text-muted-foreground mt-1">Final selected candidates</p>
          </CardContent>
        </Card>
      </div>

      {/* Trial Funnel Chart */}
      <Card className="shadow-lg border-none bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Trial Progression Funnel</CardTitle>
            <p className="text-sm text-slate-500">Sequential drop-off analysis across trial levels</p>
          </div>
          <TrendingUp className="h-6 w-6 text-blue-500 opacity-50" />
        </CardHeader>
        <CardContent className="h-[350px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Distribution */}
        <Card className="shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle>Top 5 States - Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="value" fill="url(#blueGradient)" radius={[4, 4, 0, 0]}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TrialsAnalyticsReport;
