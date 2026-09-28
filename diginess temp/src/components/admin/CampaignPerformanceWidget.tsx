import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DrillDownModal from './DrillDownModal';

const PAID_STATUSES = ['captured', 'paid', 'success', 'completed'];
const PAGE_SIZE = 1000;
const TOP_LIMIT = 10;

type CampaignRow = {
  source: string | null;
  campaign: string | null;
  total: number;
  paid: number;
  pending: number;
  failed: number;
};

const isPaid = (status: string | null) => PAID_STATUSES.includes((status || '').toLowerCase());

// Groups every registration by its UTM source + campaign so each campaign that exists in the database is listed.
async function fetchCampaigns(): Promise<CampaignRow[]> {
  const groups = new Map<string, CampaignRow>();

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('player_registrations')
      .select('utm_source, utm_campaign, payment_status')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    for (const r of data || []) {
      const source = r.utm_source ?? null;
      const campaign = r.utm_campaign ?? null;
      const key = `${source}|${campaign}`;
      const row = groups.get(key) || { source, campaign, total: 0, paid: 0, pending: 0, failed: 0 };
      row.total++;
      if (isPaid(r.payment_status)) row.paid++;
      else if ((r.payment_status || '').toLowerCase() === 'failed') row.failed++;
      else row.pending++;
      groups.set(key, row);
    }

    if (!data || data.length < PAGE_SIZE) break;
  }

  return [...groups.values()].sort((a, b) => b.total - a.total);
}

const campaignLabel = (row: CampaignRow) =>
  !row.source && !row.campaign ? 'Direct (no campaign)' : [row.source, row.campaign].filter(Boolean).join(' / ');

export default function CampaignPerformanceWidget({ refreshKey = 0 }: { refreshKey?: number }) {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [drillDown, setDrillDown] = useState<{ isOpen: boolean; title: string; players: any[]; loading: boolean }>({
    isOpen: false,
    title: '',
    players: [],
    loading: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadCampaigns() {
      setLoading(true);
      try {
        const rows = await fetchCampaigns();
        if (!isMounted) return;
        setCampaigns(rows);
        setError(null);
      } catch (err) {
        console.error('Error fetching campaign performance:', err);
        if (isMounted) setError('Could not load campaign data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCampaigns();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const openDrillDown = async (row: CampaignRow) => {
    const title = `${campaignLabel(row)} Registrations`;
    setDrillDown({ isOpen: true, title, players: [], loading: true });

    let query = supabase
      .from('player_registrations')
      .select('full_name, phone, email, city, state, status, payment_status, created_at')
      .order('created_at', { ascending: false });
    query = row.source !== null ? query.eq('utm_source', row.source) : query.is('utm_source', null);
    query = row.campaign !== null ? query.eq('utm_campaign', row.campaign) : query.is('utm_campaign', null);

    const { data, error } = await query;
    if (error) console.error('Error fetching campaign registrations:', error);

    setDrillDown({
      isOpen: true,
      title,
      loading: false,
      players: (data || []).map((p) => ({
        name: p.full_name,
        phone: p.phone,
        email: p.email,
        city: p.city,
        state: p.state,
        status: p.status,
        payment_status: p.payment_status,
        date: p.created_at ? new Date(p.created_at).toLocaleDateString() : undefined,
      })),
    });
  };

  const visible = showAll ? campaigns : campaigns.slice(0, TOP_LIMIT);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Campaign Performance</CardTitle>
        {!loading && !error && (
          <span className="text-xs text-muted-foreground">{campaigns.length} campaigns</span>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-9 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="flex h-[120px] items-center justify-center text-sm text-red-600 border-2 border-dashed rounded-lg">
            {error}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex h-[120px] items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-lg">
            No campaign registrations yet
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-4 font-medium">Source / Campaign</th>
                    <th className="py-2 px-2 font-medium text-right">Registrations</th>
                    <th className="py-2 px-2 font-medium text-right text-green-700">Paid</th>
                    <th className="py-2 px-2 font-medium text-right text-amber-700">Pending</th>
                    <th className="py-2 px-2 font-medium text-right text-red-700">Failed</th>
                    <th className="py-2 pl-2 font-medium text-right">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((row) => (
                    <tr
                      key={`${row.source}|${row.campaign}`}
                      onClick={() => openDrillDown(row)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 pr-4 font-medium text-slate-900 break-all">{campaignLabel(row)}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{row.total}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{row.paid}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{row.pending}</td>
                      <td className="py-2.5 px-2 text-right tabular-nums">{row.failed}</td>
                      <td className="py-2.5 pl-2 text-right tabular-nums">
                        {Math.round((row.paid / row.total) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {campaigns.length > TOP_LIMIT && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="mt-4 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                {showAll ? 'Show top campaigns' : `Show all ${campaigns.length} campaigns`}
              </button>
            )}
          </>
        )}
      </CardContent>

      <DrillDownModal
        isOpen={drillDown.isOpen}
        onClose={() => setDrillDown((prev) => ({ ...prev, isOpen: false }))}
        title={drillDown.title}
        players={drillDown.players}
        loading={drillDown.loading}
      />
    </Card>
  );
}
