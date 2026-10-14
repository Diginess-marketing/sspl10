import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { QrCode, Plus, RefreshCw, Download, Printer, Link2, Users, AlertTriangle } from 'lucide-react';
import { PageHeader, StatCard, ActionButton, DataTableShell, StatusBadge, DetailDrawer } from '@/components/admin/ui';
import { adminApi } from '@/lib/adminApi';
import { qrSvg, qrPng, downloadBlob, printQrCard } from '@/lib/qrImage';

// QR and campaign manager (PRD section 7): create a partner's code in one step, download the
// print-ready image or card, share the partner's private page, and see each code's funnel.

interface Campaign {
  code: string;
  title: string;
  description: string | null;
  target_url: string;
  is_active: boolean;
  current_scans: number | null;
  created_at: string;
  metadata: { person?: string; region?: string | null } | null;
  source: string;
  campaign: string;
  oldDomain: boolean;
  partnerPath: string;
  signups: number;
  paid: number;
  revenue: number;
  selected: number;
}

interface ListResponse { data: Campaign[]; unknownSource: number; totalRegistrations: number; sources: string[]; mediums: string[] }

const SOURCE_LABEL: Record<string, string> = {
  qr: 'QR code', whatsapp: 'WhatsApp', fb: 'Facebook', ig: 'Instagram', partner: 'Partner', email: 'Email', sms: 'SMS', offline: 'Offline',
};
const COMPANY_LINE_KEY = 'sspl_qr_company_line';
const DEFAULT_COMPANY_LINE = 'South State Pro League T10 · ssplt10.co.in';
const num = (n: number) => n.toLocaleString('en-IN');
const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '—');

const readCompanyLine = () => {
  try { return localStorage.getItem(COMPANY_LINE_KEY) || DEFAULT_COMPANY_LINE; } catch { return DEFAULT_COMPANY_LINE; }
};

const CampaignManager = () => {
  const [res, setRes] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState<Campaign | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ person: '', region: '', source: 'qr', medium: 'offline', notes: '' });
  const [companyLine, setCompanyLine] = useState(readCompanyLine);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRes(await adminApi.get<ListResponse>('/admin/campaigns/qr'));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (res?.data || []).filter((c) => (filter === 'all' || (filter === 'active' ? c.is_active : filter === 'old' ? c.oldDomain : c.source === filter))
      && (!q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.metadata?.region || '').toLowerCase().includes(q)));
  }, [res, search, filter]);

  const totals = useMemo(() => (res?.data || []).reduce((t, c) => ({
    scans: t.scans + (c.current_scans || 0), signups: t.signups + c.signups, paid: t.paid + c.paid, revenue: t.revenue + c.revenue,
  }), { scans: 0, signups: 0, paid: 0, revenue: 0 }), [res]);

  const fullPartnerUrl = (c: Campaign) => `${window.location.origin}${c.partnerPath}`;
  const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${what} copied`); } catch { toast.error('Could not copy'); }
  };
  const saveCompanyLine = (v: string) => {
    setCompanyLine(v);
    try { localStorage.setItem(COMPANY_LINE_KEY, v); } catch { /* per-browser convenience only */ }
  };

  const create = async () => {
    setSaving(true);
    try {
      const created = await adminApi.post<Campaign>('/admin/campaigns/qr', form);
      toast.success(`QR code ${created.code} created`, { description: 'Download the image or print the card.' });
      setCreating(false);
      setForm({ person: '', region: '', source: 'qr', medium: 'offline', notes: '' });
      await load();
      setOpen({ ...created, oldDomain: false });
    } catch (err) {
      toast.error('Could not create the code', { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Campaign) => {
    try {
      await adminApi.patch(`/admin/campaigns/qr/${encodeURIComponent(c.code)}`, { is_active: !c.is_active });
      toast.success(c.is_active ? 'Code switched off' : 'Code switched on');
      setOpen(null);
      load();
    } catch (err) {
      toast.error('Could not update', { description: (err as Error).message });
    }
  };

  const sources = res?.sources || Object.keys(SOURCE_LABEL);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Growth"
        title={<>QR & <em>campaigns</em></>}
        description="Create a code for a partner or campaign in one step, print it, and see what each one brings in."
        actions={(
          <>
            <ActionButton variant="ghost" icon={RefreshCw} loading={loading} onClick={load}>Refresh</ActionButton>
            <ActionButton variant="primary" icon={Plus} onClick={() => setCreating(true)}>New QR code</ActionButton>
          </>
        )}
      />

      {error && <div role="alert" className="admin-card p-4 text-[var(--admin-bad)]">{error}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Codes" value={num(res?.data.length || 0)} icon={QrCode} loading={loading && !res} />
        <StatCard label="Scans" value={num(totals.scans)} icon={QrCode} tone="blue" loading={loading && !res} />
        <StatCard label="Sign-ups" value={num(totals.signups)} hint={`${pct(totals.paid, totals.signups)} paid`} icon={Users} tone="lime" loading={loading && !res} />
        <StatCard label="Paid revenue" value={inr(totals.revenue)} hint={`${num(totals.paid)} paid sign-ups`} icon={Users} tone="green" loading={loading && !res} />
        <StatCard label="Unknown source" value={num(res?.unknownSource || 0)} hint={`of ${num(res?.totalRegistrations || 0)} registrations`} icon={AlertTriangle} tone="amber" loading={loading && !res} />
      </div>

      <DataTableShell
        title="Codes and their results"
        description="Sign-ups count when a registration carries the code or its campaign link. Click a row for the image, card and partner link."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, code, region…"
        filters={[
          { value: 'all', label: 'All', count: res?.data.length || 0 },
          { value: 'active', label: 'Active' },
          ...sources.filter((s) => (res?.data || []).some((c) => c.source === s)).map((s) => ({ value: s, label: SOURCE_LABEL[s] || s })),
          { value: 'old', label: 'Old address', count: (res?.data || []).filter((c) => c.oldDomain).length },
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
        loading={loading && !res}
        isEmpty={!loading && rows.length === 0}
        emptyTitle="No codes match"
        emptyDescription="Create a code with New QR code."
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Campaign</th><th>Source</th>
              <th className="text-right">Scans</th><th className="text-right">Sign-ups</th><th className="text-right">Paid</th>
              <th className="text-right">Conversion</th><th className="text-right">Revenue</th><th className="text-right">Selected</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.code} className="cursor-pointer" onClick={() => setOpen(c)}>
                <td>
                  <span className="block font-semibold text-[var(--admin-ink)]">{c.metadata?.person || c.title}</span>
                  <span className="admin-muted text-sm">{[c.metadata?.region, c.code].filter(Boolean).join(' · ')}</span>
                </td>
                <td className="whitespace-nowrap">{SOURCE_LABEL[c.source] || c.source || '—'}</td>
                <td className="text-right tabular-nums">{num(c.current_scans || 0)}</td>
                <td className="text-right tabular-nums">{num(c.signups)}</td>
                <td className="text-right tabular-nums text-[var(--admin-ok)]">{num(c.paid)}</td>
                <td className="text-right tabular-nums">{pct(c.paid, c.signups)}</td>
                <td className="text-right tabular-nums">{inr(c.revenue)}</td>
                <td className="text-right tabular-nums">{num(c.selected)}</td>
                <td className="whitespace-nowrap">
                  <StatusBadge status={c.is_active ? 'active' : 'neutral'} label={c.is_active ? 'Active' : 'Off'} />
                  {c.oldDomain && <span className="ml-1"><StatusBadge status="pending" label="Old address" /></span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>

      <DetailDrawer
        open={open !== null}
        onOpenChange={(o) => { if (!o) setOpen(null); }}
        eyebrow={open?.code}
        title={open?.metadata?.person || open?.title || ''}
        description={open ? [open.metadata?.region, SOURCE_LABEL[open.source] || open.source].filter(Boolean).join(' · ') : undefined}
        footer={open && (
          <ActionButton variant={open.is_active ? 'outline' : 'primary'} onClick={() => toggle(open)}>{open.is_active ? 'Switch off' : 'Switch on'}</ActionButton>
        )}
      >
        {open && (
          <div className="space-y-5">
            {open.oldDomain && (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-[var(--admin-ink)]">This code still points at the old address (sspl10.com). Run the pending database update to correct it before printing again.</p>
            )}
            {/* SVG generated locally from the code's link (no user-supplied HTML) */}
            <div className="mx-auto w-56 rounded-xl border border-[var(--admin-line)] p-2" dangerouslySetInnerHTML={{ __html: qrSvg(open.target_url, 208) }} />
            <div className="flex flex-wrap justify-center gap-2">
              <ActionButton size="sm" variant="soft" icon={Download} onClick={async () => downloadBlob(await qrPng(open.target_url), `${open.code}.png`)}>PNG</ActionButton>
              <ActionButton size="sm" variant="soft" icon={Download} onClick={() => downloadBlob(new Blob([qrSvg(open.target_url)], { type: 'image/svg+xml' }), `${open.code}.svg`)}>SVG</ActionButton>
              <ActionButton size="sm" variant="soft" icon={Printer} onClick={() => {
                try { printQrCard({ url: open.target_url, name: open.metadata?.person || open.title, region: open.metadata?.region, companyLine }); } catch (err) { toast.error((err as Error).message); }
              }}>Print card</ActionButton>
            </div>
            <dl className="admin-kv">
              <dt>Link</dt>
              <dd><button type="button" className="break-all text-left text-sm hover:text-[var(--admin-accent)]" onClick={() => copy(open.target_url, 'Link')}>{open.target_url}</button></dd>
              <dt>Partner page</dt>
              <dd><ActionButton size="sm" variant="ghost" icon={Link2} onClick={() => copy(fullPartnerUrl(open), 'Partner page link')}>Copy partner link</ActionButton></dd>
              <dt>Funnel</dt>
              <dd>{num(open.current_scans || 0)} scans → {num(open.signups)} sign-ups → {num(open.paid)} paid ({inr(open.revenue)}) → {num(open.selected)} selected</dd>
            </dl>
            <div>
              <label htmlFor="company-line" className="admin-label">Company line on the printed card</label>
              <input id="company-line" className="admin-field" value={companyLine} onChange={(e) => saveCompanyLine(e.target.value)} />
            </div>
          </div>
        )}
      </DetailDrawer>

      <DetailDrawer
        open={creating}
        onOpenChange={(o) => { if (!saving) setCreating(o); }}
        eyebrow="New QR code"
        title="Create a code"
        description="The name becomes the campaign name, e.g. Divya-Saravanan, so every report counts it once."
        footer={(
          <>
            <ActionButton variant="ghost" onClick={() => setCreating(false)} disabled={saving}>Cancel</ActionButton>
            <ActionButton variant="primary" icon={QrCode} loading={saving} disabled={!form.person.trim()} onClick={create}>Create code</ActionButton>
          </>
        )}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="qr-person" className="admin-label">Person or campaign name</label>
            <input id="qr-person" className="admin-field" value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} placeholder="e.g. Divya" />
          </div>
          <div>
            <label htmlFor="qr-region" className="admin-label">Region (optional)</label>
            <input id="qr-region" className="admin-field" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. Saravanan or Coimbatore" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qr-source" className="admin-label">Source</label>
              <select id="qr-source" className="admin-field" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                {sources.map((s) => <option key={s} value={s}>{SOURCE_LABEL[s] || s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="qr-medium" className="admin-label">Medium</label>
              <select id="qr-medium" className="admin-field" value={form.medium} onChange={(e) => setForm({ ...form, medium: e.target.value })}>
                {(res?.mediums || ['offline', 'paid', 'social', 'referral', 'broadcast']).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="qr-notes" className="admin-label">Notes (optional)</label>
            <textarea id="qr-notes" className="admin-field !h-auto min-h-[70px] py-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {form.person.trim() && (
            <p className="admin-muted text-sm">Campaign name: <strong className="text-[var(--admin-ink)]">{[form.person, form.region].join(' ').trim().split(/[\s_-]+/).filter(Boolean).map((w) => (/^\d+$/.test(w) ? w : w[0].toUpperCase() + w.slice(1).toLowerCase())).join('-')}</strong></p>
          )}
        </div>
      </DetailDrawer>
    </div>
  );
};

export default CampaignManager;
