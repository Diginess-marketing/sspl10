import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { RefreshCw, Download, Percent, UserCheck, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader, StatCard, ActionButton, EmptyState } from '@/components/admin/ui';

const TICK = { fontSize: 'var(--brand-fs-small)', fill: 'var(--brand-navy)' } as const;

export const TrialAnalyticsDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const { getTrialOverallStats, loading } = usePlayerWorkflow();

  const loadData = async () => {
    const stats = await getTrialOverallStats();
    if (stats) setData(stats);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportDetailedLogs = async () => {
    setExporting(true);
    try {
      const { data: records, error } = await (supabase as any).from('trial_view').select('*');
      if (error) throw error;
      if (!records || records.length === 0) {
        toast.info('No records to export');
        return;
      }
      const headers = Object.keys(records[0]);
      const csvContent = [
        headers.join(','),
        ...records.map((r: any) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sspl_trials_full_audit_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Full logs downloaded');
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const header = (
    <PageHeader
      eyebrow="Trials"
      title={<>Lifecycle <em>analytics</em></>}
      actions={
        <>
          <ActionButton variant="outline" icon={Download} loading={exporting} onClick={exportDetailedLogs}>Export full logs</ActionButton>
          <ActionButton variant="soft" icon={RefreshCw} loading={loading} onClick={loadData}>Refresh stats</ActionButton>
        </>
      }
    />
  );

  if (!data) {
    return (
      <div className="space-y-6">
        {header}
        <div className="admin-card">
          {loading
            ? <div className="space-y-3 p-5">{[...Array(4)].map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--brand-sky)]" />)}</div>
            : <EmptyState title="No analytics data yet" description="Start processing candidates and the funnel will appear here." />}
        </div>
      </div>
    );
  }

  const f = data.funnel;
  const funnelData = [
    { name: 'L1 Pool', count: f.l1_pool },
    { name: 'L1 Attended', count: f.l1_attended },
    { name: 'L1 Selected', count: f.l1_selected },
    { name: 'L2 Attended', count: f.l2_attended },
    { name: 'L2 Selected', count: f.l2_selected },
    { name: 'L3 Attended', count: f.l3_attended },
    { name: 'L3 Selected', count: f.l3_selected },
  ];

  const attritionData = [
    { name: 'Selected', value: f.net_finalists, color: 'var(--admin-ok)' },
    { name: 'Rejected', value: data.attrition.rejected, color: 'var(--admin-bad)' },
    { name: 'Absent / dropout', value: data.attrition.absent, color: 'var(--brand-muted)' },
  ];

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Conversion rate" value={`${((f.net_finalists / (f.l1_pool || 1)) * 100).toFixed(1)}%`} hint="L1 pool to final selection" icon={Percent} tone="blue" />
        <StatCard label="Attendance rate" value={`${((f.l1_attended / (f.l1_called || 1)) * 100).toFixed(1)}%`} hint="L1 attendance, from called" icon={UserCheck} tone="amber" />
        <StatCard label="Selection yield" value={f.net_finalists} hint="Final selected players" icon={Trophy} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="admin-card p-5">
          <h3 className="admin-h3 mb-4">Trials funnel analysis</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--brand-line)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={TICK} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--brand-sky)' }} contentStyle={{ borderRadius: 12, border: '1px solid var(--brand-line)', fontSize: 'var(--brand-fs-small)' }} />
                <Bar dataKey="count" fill="var(--brand-blue)" radius={[0, 6, 6, 0]} label={{ position: 'right', ...TICK }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="admin-card p-5">
          <h3 className="admin-h3 mb-4">Outcome distribution</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attritionData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {attritionData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--brand-line)', fontSize: 'var(--brand-fs-small)' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 'var(--brand-fs-small)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};
