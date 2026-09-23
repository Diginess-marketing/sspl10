import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
} from 'recharts';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { RefreshCw, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const TrialAnalyticsDashboard = () => {
  const [data, setData] = useState<any>(null);
  const { getTrialOverallStats, loading } = usePlayerWorkflow();

  const loadData = async () => {
    const stats = await getTrialOverallStats();
    if (stats) {
      setData(stats);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="w-8 h-8 animate-spin text-cricket-blue" />
        <span className="ml-3 text-lg font-medium">Crunching trial data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-20 text-slate-400">
        No analytics data available yet. Start processing candidates.
      </div>
    );
  }

  const funnelData = [
    { name: 'L1 Pool', count: data.funnel.l1_pool },
    { name: 'L1 Attended', count: data.funnel.l1_attended },
    { name: 'L1 Selected', count: data.funnel.l1_selected },
    { name: 'L2 Attended', count: data.funnel.l2_attended },
    { name: 'L2 Selected', count: data.funnel.l2_selected },
    { name: 'L3 Attended', count: data.funnel.l3_attended },
    { name: 'L3 Selected', count: data.funnel.l3_selected },
  ];

  const attritionData = [
    { name: 'Selected', value: data.funnel.net_finalists, color: '#10b981' },
    { name: 'Rejected', value: data.attrition.rejected, color: '#ef4444' },
    { name: 'Absent/Dropout', value: data.attrition.absent, color: '#94a3b8' },
  ];

  const exportDetailedLogs = async () => {
    try {
      const { data: records, error } = await supabase.from('trial_view' as any).select('*');
      if (error) throw error;

      if (!records || records.length === 0) {
        alert('No records to export');
        return;
      }

      const headers = Object.keys(records[0]);
      const csvContent = [
        headers.join(','),
        ...records.map((r: any) => headers.map(h => `"${r[h] || ''}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sspl_trials_full_audit_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trials Lifecycle Analytics
        </h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={exportDetailedLogs} variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
            <Download className="w-4 h-4 mr-2" />
            Export Full Logs
          </Button>
          <Button size="sm" onClick={loadData} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {((data.funnel.net_finalists / (data.funnel.l1_pool || 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">L1 Pool to Final Selection</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {((data.funnel.l1_attended / (data.funnel.l1_called || 1)) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">L1 Attendance (from Called)</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase">Selection Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {data.funnel.net_finalists}
            </div>
            <p className="text-xs text-slate-400 mt-1">Final Selected Players</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardTitle className="text-lg mb-6">Trials Funnel Analysis</CardTitle>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <CardTitle className="text-lg mb-6">Outcome Distribution</CardTitle>
          <div className="h-[350px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attritionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attritionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
