import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, CreditCard, MapPin, XCircle, Trophy } from 'lucide-react';
import { StatCard } from '@/components/admin/ui';

const COLORS = ['var(--brand-blue)', 'var(--admin-ok)', 'var(--admin-warn)', 'var(--brand-navy)', 'var(--brand-lime-deep)'];
const TICK = { fontSize: 'var(--brand-fs-small)', fill: 'var(--brand-navy)' } as const;
const TIP = { borderRadius: 12, border: '1px solid var(--brand-line)', fontSize: 'var(--brand-fs-small)' } as const;

export const TrialsAnalyticsReport = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-trials-analytics'],
    queryFn: async () => {
      const db = supabase as any;
      const [regsResponse, progressResponse] = await Promise.all([
        db
          .from('player_registrations')
          .select('payment_status, city, state, position, status, created_at, phone'),
        db
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
      <div className="space-y-4" aria-busy="true">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-[18px] bg-[var(--brand-sky)]" />)}
        </div>
        <div className="h-80 animate-pulse rounded-[18px] bg-[var(--brand-sky)]" />
      </div>
    );
  }

  // Combine DB and Staging data for overview
  const totalDb = dbPlayers?.length || 0;

  // Process transactions and unique player attempts
  const playerGroups = dbPlayers?.reduce((acc: any, p: any) => {
    const key = p.phone || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p.payment_status?.toLowerCase());
    return acc;
  }, {});

  const totalTransactions = totalDb;
  const capturedTransactionsCount = dbPlayers?.filter((p: any) => 
    ['captured', 'completed', 'paid', 'success'].includes(p.payment_status?.toLowerCase() || ''),
  ).length || 0;
  const failedTransactionsCount = totalTransactions - capturedTransactionsCount;

  const totalUniquePlayers = Object.keys(playerGroups || {}).length;
  const capturedPlayersCount = Object.values(playerGroups || {}).filter((statuses: any) => 
    statuses.some((s: string) => ['captured', 'completed', 'paid', 'success'].includes(s)),
  ).length;
  const netFailedPlayers = totalUniquePlayers - capturedPlayersCount;

  // Process Location data (Top 5 States)
  const stateCounts = dbPlayers?.reduce((acc: any, p: any) => {
    acc[p.state] = (acc[p.state] || 0) + 1;
    return acc;
  }, {});
  
  const stateData = Object.entries(stateCounts || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 5);

  // Process Category data
  const categoryCounts = dbPlayers?.reduce((acc: any, p: any) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryCounts || {}).map(([name, value]) => ({ name, value }));

  // Process Payment status

  // Process Trial Funnel Data
  const funnelData = [
    { name: 'L1 Pool', count: trialProgress?.length || 0, color: 'var(--brand-blue)' },
    { name: 'L1 Selected', count: trialProgress?.filter((p: any) => p.l1_result === 'SELECTED' || p.l3_result === 'SELECTED').length || 0, color: 'var(--brand-blue)' },
    { name: 'L2 Selected', count: trialProgress?.filter((p: any) => p.l2_result === 'SELECTED' || p.l3_result === 'SELECTED').length || 0, color: 'var(--brand-blue)' },
    { name: 'L3 Selected', count: trialProgress?.filter((p: any) => p.l3_result === 'SELECTED').length || 0, color: 'var(--admin-ok)' },
  ];

  const chartCard = 'admin-card p-5';
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total attempts" value={totalTransactions} hint="All registration records" icon={Users} tone="blue" />
        <StatCard label="Failed transactions" value={failedTransactionsCount} hint="Non-captured attempts" icon={CreditCard} tone="amber" />
        <StatCard label="Net failed" value={netFailedPlayers} hint="Unique users lost" icon={XCircle} tone="amber" />
        <StatCard label="Successful" value={capturedPlayersCount} hint="Unique paid players" icon={Trophy} tone="green" />
        <StatCard label="Trial selection" value={funnelData[3].count} hint="Final selected candidates" icon={MapPin} tone="lime" />
      </div>

      <section className={chartCard}>
        <h3 className="admin-h3">Trial progression funnel</h3>
        <p className="admin-muted mb-4 mt-1">Sequential drop-off analysis across trial levels</p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-line)" />
              <XAxis dataKey="name" tick={TICK} tickLine={false} axisLine={false} />
              <YAxis tick={TICK} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TIP} cursor={{ fill: 'var(--brand-sky)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                {funnelData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className={chartCard}>
          <h3 className="admin-h3 mb-4">Top 5 states</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-line)" />
                <XAxis dataKey="name" tick={TICK} tickLine={false} axisLine={false} />
                <YAxis tick={TICK} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TIP} cursor={{ fill: 'var(--brand-sky)' }} />
                <Bar dataKey="value" fill="var(--brand-blue)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={chartCard}>
          <h3 className="admin-h3 mb-4">Category breakdown</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                  style={{ fontSize: 'var(--brand-fs-small)' }}
                >
                  {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TIP} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TrialsAnalyticsReport;
