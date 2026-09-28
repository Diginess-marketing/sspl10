import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Mail, MailCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ActionButton, ConfirmDialog, DataTableShell, DetailDrawer, StatusBadge } from '@/components/admin/ui';
import type { PlayerRegistrationWithEmailStatus, WorkflowStage } from '@/types/workflow';

interface RegistrationWorkflowTabProps {
  onRefresh: () => void;
}

const PAID = ['completed', 'captured', 'paid', 'success'];
const isPaid = (p: PlayerRegistrationWithEmailStatus) => PAID.includes((p.payment_status || '').toLowerCase());

const REST_FIELDS = 'id,full_name,email,phone,payment_status,payment_amount,razorpay_order_id,razorpay_payment_id,created_at,updated_at,position,date_of_birth,city,state,status';

// Reads one table over REST. Uses the signed-in admin's token when there is one, so row-level
// security sees the admin rather than an anonymous visitor.
const restGet = async (path: string, token?: string) => {
  const base = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`${base}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${token || key}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
};

const RegistrationWorkflowTab = ({ onRefresh }: RegistrationWorkflowTabProps) => {
  const [players, setPlayers] = useState<PlayerRegistrationWithEmailStatus[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState('all');
  const [filterEmail, setFilterEmail] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [processing, setProcessing] = useState(false);
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  // ids waiting for the "move to trials" confirmation
  const [pendingMove, setPendingMove] = useState<string[] | null>(null);
  const [detail, setDetail] = useState<PlayerRegistrationWithEmailStatus | null>(null);

  const { user } = useAuth();
  const { moveToTrialsSection, sendConfirmationEmail } = usePlayerWorkflow();

  const reloadData = useCallback(() => setReloadTrigger(prev => prev + 1), []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token && !user) {
          throw new Error('Authentication required. Please log in to view player registrations.');
        }

        const regs = await restGet(`player_registrations?select=${REST_FIELDS}&order=created_at.desc`, token);
        // Workflow and email data only decorate the list, so a failure there must not hide players.
        const [workflows, emailLogs] = await Promise.all([
          restGet('player_workflow?select=*', token).catch(() => []),
          restGet('email_logs?select=registration_id,status,sent_at&email_type=eq.registration_confirmation&status=eq.success', token).catch(() => []),
        ]);

        const workflowMap = new Map((workflows as any[]).map(w => [w.registration_id, w]));
        const emailMap = new Map((emailLogs as any[]).map(e => [e.registration_id, e]));
        const merged = (regs as any[]).map((reg): PlayerRegistrationWithEmailStatus => {
          const wf = workflowMap.get(reg.id);
          const mail = emailMap.get(reg.id);
          return {
            ...reg,
            status: reg.status || 'pending',
            payment_status: reg.payment_status || 'pending',
            workflow_id: wf?.workflow_id,
            workflow_stage: (wf?.workflow_stage || 'registration') as WorkflowStage,
            confirmation_email_sent: wf?.confirmation_email_sent || Boolean(mail),
            confirmation_email_sent_at: wf?.confirmation_email_sent_at || mail?.sent_at,
          };
        });
        if (isMounted) setPlayers(merged);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load registrations');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [reloadTrigger, user]);

  // Players still in the registration stage (paid or not), excluding cancelled ones.
  const inStage = useMemo(() => players.filter(p => {
    const stage = p.workflow_stage as string | undefined;
    return (stage === 'registration' || stage === 'registration_completed' || stage === undefined) && p.status !== 'cancelled';
  }), [players]);

  const uniqueCities = useMemo(
    () => Array.from(new Set(inStage.map(p => p.city).filter((c): c is string => Boolean(c)))).sort(),
    [inStage],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inStage.filter(p => {
      if (payment === 'paid' && !isPaid(p)) return false;
      if (payment !== 'all' && payment !== 'paid' && (p.payment_status || '').toLowerCase() !== payment) return false;
      if (filterEmail === 'sent' && !p.confirmation_email_sent) return false;
      if (filterEmail === 'not_sent' && p.confirmation_email_sent) return false;
      if (filterCity !== 'all' && p.city !== filterCity) return false;
      if (q && ![p.full_name, p.email, p.phone].some(v => (v || '').toLowerCase().includes(q))) return false;
      return true;
    });
  }, [inStage, search, payment, filterEmail, filterCity]);

  const eligible = useMemo(() => filtered.filter(isPaid), [filtered]);
  const allSelected = eligible.length > 0 && eligible.every(p => selectedIds.has(p.id));

  const chips = [
    { value: 'all', label: 'All', count: inStage.length },
    { value: 'paid', label: 'Paid', count: inStage.filter(isPaid).length },
    { value: 'pending', label: 'Pending', count: inStage.filter(p => (p.payment_status || '').toLowerCase() === 'pending').length },
    { value: 'failed', label: 'Failed', count: inStage.filter(p => (p.payment_status || '').toLowerCase() === 'failed').length },
  ];

  const toggleAll = (checked: boolean) => setSelectedIds(checked ? new Set(eligible.map(p => p.id)) : new Set());
  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id); else next.delete(id);
    setSelectedIds(next);
  };

  const confirmMove = async () => {
    if (!pendingMove) return;
    setProcessing(true);
    try {
      const results = await moveToTrialsSection(pendingMove, user?.id);
      const ok = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success);
      if (failed.length) toast.error(`Moved ${ok} player(s); ${failed.length} failed`, { description: failed[0]?.message });
      else toast.success(`${ok} player(s) moved to the Trials Section`);
      setSelectedIds(new Set());
      setPendingMove(null);
      setDetail(null);
      reloadData();
      onRefresh();
    } catch (err: any) {
      toast.error('Could not move players', { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = async (player: PlayerRegistrationWithEmailStatus) => {
    if (!isPaid(player)) {
      toast.error('Payment not completed', { description: 'A confirmation email can only go to paid players.' });
      return;
    }
    setSendingEmailFor(player.id);
    try {
      const ok = await sendConfirmationEmail(player.id, player.full_name, player.email, player.payment_amount || 0, player.razorpay_payment_id || '');
      if (ok) {
        toast.success(`Confirmation email sent to ${player.full_name}`);
        reloadData();
      } else {
        toast.error('Failed to send confirmation email');
      }
    } catch (err: any) {
      toast.error('Failed to send confirmation email', { description: err.message });
    } finally {
      setSendingEmailFor(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-[var(--admin-bad)]/30 bg-[var(--admin-bad-bg)] px-4 py-3 text-[var(--admin-bad)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <ActionButton variant="outline" size="sm" icon={RefreshCw} onClick={reloadData}>Retry</ActionButton>
        </div>
      )}

      <DataTableShell
        title="Player registrations"
        description="Select paid players and move them to the Trials Section."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email or phone"
        filters={chips}
        activeFilter={payment}
        onFilterChange={setPayment}
        actions={(
          <>
            <select className="admin-select" value={filterCity} onChange={e => setFilterCity(e.target.value)} aria-label="Filter by location">
              <option value="all">All locations</option>
              {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="admin-select" value={filterEmail} onChange={e => setFilterEmail(e.target.value)} aria-label="Filter by email status">
              <option value="all">All emails</option>
              <option value="sent">Email sent</option>
              <option value="not_sent">Not sent</option>
            </select>
            <ActionButton variant="ghost" size="sm" icon={RefreshCw} onClick={reloadData} aria-label="Refresh" />
          </>
        )}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        bulkActions={(
          <ActionButton variant="primary" size="sm" icon={ArrowRight} onClick={() => setPendingMove(Array.from(selectedIds))}>
            Move to trials
          </ActionButton>
        )}
        loading={loading}
        isEmpty={filtered.length === 0}
        emptyTitle="No registrations found"
        emptyDescription="Adjust the filters or wait for new registrations."
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th className="w-12">
                <Checkbox checked={allSelected} onCheckedChange={c => toggleAll(c === true)} aria-label="Select all paid players" />
              </th>
              <th>Player</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Payment</th>
              <th>Email</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(player => (
              <tr key={player.id} data-selected={selectedIds.has(player.id)}>
                <td>
                  <Checkbox
                    checked={selectedIds.has(player.id)}
                    onCheckedChange={c => toggleOne(player.id, c === true)}
                    disabled={!isPaid(player)}
                    aria-label={`Select ${player.full_name}`}
                  />
                </td>
                <td>
                  <button type="button" className="flex items-center gap-3 text-left" onClick={() => setDetail(player)}>
                    <span className="admin-avatar">{(player.full_name || '?').slice(0, 1).toUpperCase()}</span>
                    <span>
                      <span className="block font-semibold text-[var(--admin-ink)] hover:text-[var(--admin-accent)]">{player.full_name}</span>
                      <span className="admin-muted">{player.position || 'Position n/a'}</span>
                    </span>
                  </button>
                </td>
                <td>
                  <span className="block">{player.email}</span>
                  <span className="admin-muted">{player.phone}</span>
                </td>
                <td>{player.city && player.state ? `${player.city}, ${player.state}` : player.state || 'N/A'}</td>
                <td>
                  <StatusBadge status={player.payment_status} />
                  {player.payment_amount ? <span className="admin-muted mt-1 block">₹{player.payment_amount}</span> : null}
                </td>
                <td>
                  {player.confirmation_email_sent
                    ? <span className="admin-badge admin-badge--ok">Sent</span>
                    : <span className="admin-badge admin-badge--neutral">Not sent</span>}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {!player.confirmation_email_sent && isPaid(player) && (
                      <ActionButton variant="soft" size="sm" icon={Mail} loading={sendingEmailFor === player.id} onClick={() => handleSendEmail(player)}>
                        Email
                      </ActionButton>
                    )}
                    {isPaid(player) && (
                      <ActionButton variant="outline" size="sm" icon={ArrowRight} disabled={processing} onClick={() => setPendingMove([player.id])}>
                        To trials
                      </ActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>

      <ConfirmDialog
        open={pendingMove !== null}
        onOpenChange={open => { if (!open) setPendingMove(null); }}
        title="Move to Trials Section?"
        description={`${pendingMove?.length ?? 0} paid player(s) will leave the registration stage and appear in the Trials Section, ready to be allocated a trial.`}
        confirmLabel="Move players"
        loading={processing}
        onConfirm={confirmMove}
      />

      <DetailDrawer
        open={detail !== null}
        onOpenChange={open => { if (!open) setDetail(null); }}
        eyebrow="Registration"
        title={detail?.full_name || ''}
        description={detail?.email}
        footer={detail && (
          <>
            {!detail.confirmation_email_sent && isPaid(detail) && (
              <ActionButton variant="soft" icon={MailCheck} loading={sendingEmailFor === detail.id} onClick={() => handleSendEmail(detail)}>Send email</ActionButton>
            )}
            {isPaid(detail) && <ActionButton variant="primary" icon={ArrowRight} onClick={() => setPendingMove([detail.id])}>Move to trials</ActionButton>}
          </>
        )}
      >
        {detail && (
          <dl className="admin-kv">
            <dt>Payment</dt><dd><StatusBadge status={detail.payment_status} />{detail.payment_amount ? ` ₹${detail.payment_amount}` : ''}</dd>
            <dt>Phone</dt><dd>{detail.phone || 'N/A'}</dd>
            <dt>Position</dt><dd>{detail.position || 'N/A'}</dd>
            <dt>Born</dt><dd>{detail.date_of_birth ? new Date(detail.date_of_birth).toLocaleDateString() : 'N/A'}</dd>
            <dt>Location</dt><dd>{[detail.city, detail.state].filter(Boolean).join(', ') || 'N/A'}</dd>
            <dt>Email</dt><dd>{detail.confirmation_email_sent ? 'Confirmation sent' : 'Not sent yet'}</dd>
            <dt>Registered</dt><dd>{detail.created_at ? new Date(detail.created_at).toLocaleString() : 'N/A'}</dd>
            <dt>Order id</dt><dd>{detail.razorpay_order_id || 'N/A'}</dd>
            <dt>Payment id</dt><dd>{detail.razorpay_payment_id || 'N/A'}</dd>
          </dl>
        )}
      </DetailDrawer>
    </div>
  );
};

export default RegistrationWorkflowTab;
