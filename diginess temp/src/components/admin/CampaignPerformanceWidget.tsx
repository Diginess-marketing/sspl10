import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataTableShell, ActionButton } from '@/components/admin/ui';
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
    <>
      <DataTableShell
        title="Campaign performance"
        description={!loading && !error ? `${campaigns.length} campaigns` : undefined}
        loading={loading}
        isEmpty={Boolean(error) || campaigns.length === 0}
        emptyTitle={error ?? 'No campaign registrations yet'}
        emptyDescription={error ? 'Refresh the dashboard to try again.' : 'Registrations with UTM tags will appear here.'}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Source / campaign</th>
              <th className="text-right">Registrations</th>
              <th className="text-right">Paid</th>
              <th className="text-right">Pending</th>
              <th className="text-right">Failed</th>
              <th className="text-right">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={`${row.source}|${row.campaign}`}
                onClick={() => openDrillDown(row)}
                className="cursor-pointer"
              >
                <td className="break-all font-semibold">{campaignLabel(row)}</td>
                <td className="text-right tabular-nums">{row.total}</td>
                <td className="text-right tabular-nums text-[var(--admin-ok)]">{row.paid}</td>
                <td className="text-right tabular-nums text-[var(--admin-warn)]">{row.pending}</td>
                <td className="text-right tabular-nums text-[var(--admin-bad)]">{row.failed}</td>
                <td className="text-right tabular-nums">{Math.round((row.paid / row.total) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length > TOP_LIMIT && (
          <div className="border-t border-[var(--admin-line)] p-4">
            <ActionButton variant="soft" size="sm" onClick={() => setShowAll((v) => !v)}>
              {showAll ? 'Show top campaigns' : `Show all ${campaigns.length} campaigns`}
            </ActionButton>
          </div>
        )}
      </DataTableShell>

      <DrillDownModal
        isOpen={drillDown.isOpen}
        onClose={() => setDrillDown((prev) => ({ ...prev, isOpen: false }))}
        title={drillDown.title}
        players={drillDown.players}
        loading={drillDown.loading}
      />
    </>
  );
}
