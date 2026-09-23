import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, DollarSign, TrendingUp, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AnalyticsData {
  totalRegistrations: number;
  paymentStats: { name: string; value: number; color: string }[];
  registrationTrends: { date: string; count: number }[];
  userRoles: { name: string; value: number; color: string }[];
  stateStats: { state: string; count: number }[];
}

interface RegistrationData {
  payment_status: string | null;
  created_at: string | null;
  state: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalRegistrations: 0,
    paymentStats: [],
    registrationTrends: [],
    userRoles: [],
    stateStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch player registrations from deduplicated view
      const { data: rawRegistrations, error: regError } = await (supabase as any)
        .from('v_admin_player_registrations')
        .select('*')
        .range(0, 10000);

      const registrations = rawRegistrations as RegistrationData[] | null;

      if (regError) throw regError;

      // Fetch user roles
      const { data: roles, error: roleError } = await supabase
        .from('user_roles')
        .select('*');

      if (roleError) throw roleError;

      // Process data
      const totalRegistrations = registrations?.length || 0;

      // Payment status stats
      const paymentStats = [
        { name: 'Completed', value: registrations?.filter(r => r.payment_status === 'completed' || r.payment_status === 'captured').length || 0, color: '#00C49F' },
        { name: 'Pending', value: registrations?.filter(r => (r.payment_status === 'pending' || !r.payment_status) && r.payment_status !== 'captured').length || 0, color: '#FFBB28' },
        { name: 'Failed', value: registrations?.filter(r => r.payment_status === 'failed').length || 0, color: '#FF8042' },
      ];

      // Registration trends (last 30 days)
      const trends = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = registrations?.filter(r => r.created_at?.split('T')[0] === dateStr).length || 0;
        trends.push({ date: dateStr, count });
      }

      // User roles stats
      const userRoles = [
        { name: 'Admin', value: roles?.filter(r => r.role === 'admin').length || 0, color: '#0088FE' },
        { name: 'User', value: roles?.filter(r => r.role === 'user').length || 0, color: '#00C49F' },
      ];

      // State-wise stats
      const stateMap = new Map<string, number>();
      registrations?.forEach(reg => {
        if (reg.state) {
          stateMap.set(reg.state, (stateMap.get(reg.state) || 0) + 1);
        }
      });
      const stateStats = Array.from(stateMap.entries())
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 states

      setData({
        totalRegistrations,
        paymentStats,
        registrationTrends: trends,
        userRoles,
        stateStats,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const chartConfig = {
    completed: { label: 'Completed', color: '#00C49F' },
    pending: { label: 'Pending', color: '#FFBB28' },
    failed: { label: 'Failed', color: '#FF8042' },
    admin: { label: 'Admin', color: '#0088FE' },
    user: { label: 'User', color: '#00C49F' },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{data.totalRegistrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed Payments</p>
                <p className="text-2xl font-bold">
                  {data.paymentStats.find(s => s.name === 'Completed')?.value || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Daily Registrations</p>
                <p className="text-2xl font-bold">
                  {Math.round(data.totalRegistrations / 30)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">States Represented</p>
                <p className="text-2xl font-bold">{data.stateStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={data.paymentStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {data.paymentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Roles Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Roles Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={data.userRoles}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || 'Unknown'} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {data.userRoles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Registration Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Trends (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <LineChart data={data.registrationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ fill: '#0088FE' }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* State-wise Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Top States by Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={data.stateStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#00C49F" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;