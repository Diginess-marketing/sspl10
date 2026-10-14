import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PageShell, Card, CardTitle, EmptyState, COLORS } from '@/components/league/PageShell';
import { API_BASE_URL } from '@/config/api';

// A campaign partner's private page (PRD 7.5): their scans, sign-ups and paid sign-ups.
// The link is signed by the server; no personal data is shown.

interface Stats { name: string; region: string | null; since: string; scans: number; signups: number; paid: number; updatedAt: string }

const PartnerStats = () => {
  const { code = '' } = useParams();
  const [params] = useSearchParams();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/partner/${encodeURIComponent(code)}?k=${encodeURIComponent(params.get('k') || '')}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error || 'This partner link is not valid');
        return body as Stats;
      })
      .then((s) => { if (active) setStats(s); })
      .catch((err: Error) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [code, params]);

  const tiles = stats ? [
    { label: 'Scans', value: stats.scans, hint: 'People who opened your code or link' },
    { label: 'Sign-ups', value: stats.signups, hint: 'Started a registration' },
    { label: 'Paid sign-ups', value: stats.paid, hint: 'Completed payment' },
  ] : [];

  return (
    <PageShell eyebrow="Partner" title={stats ? stats.name : 'Your sign-ups'} intro={stats?.region ? `Region: ${stats.region}` : 'Your QR code results with SSPL T10.'} path="/partner">
      {error ? (
        <EmptyState title="Link not valid" text={`${error}. Ask the SSPL team for your partner link.`} action={{ to: '/', label: 'Go to the home page' }} />
      ) : !stats ? (
        <Card><p style={{ color: COLORS.MUTED }}>Loading your numbers…</p></Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {tiles.map((t) => (
              <Card key={t.label}>
                <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: COLORS.MUTED }}>{t.label}</p>
                <p className="mt-2 text-4xl font-bold" style={{ color: COLORS.NAVY }}>{t.value.toLocaleString('en-IN')}</p>
                <p className="mt-1 text-sm" style={{ color: COLORS.MUTED }}>{t.hint}</p>
              </Card>
            ))}
          </div>
          <Card>
            <CardTitle>How this is counted</CardTitle>
            <p className="mt-2" style={{ color: COLORS.MUTED }}>
              Counted since {new Date(stats.since).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}. Updated {new Date(stats.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}.
              Keep this link private: it shows only your own results.
            </p>
          </Card>
        </>
      )}
    </PageShell>
  );
};

export default PartnerStats;
