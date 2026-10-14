import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Search } from 'lucide-react';
import { PageShell, Card, CardTitle, COLORS } from '@/components/league/PageShell';
import { API_BASE_URL } from '@/config/api';

// Public certificate check (PRD feature 9): enter a number, see the name, level and date.

interface Result { valid: boolean; number: string; name?: string | null; level?: number; title?: string; issuedAt?: string }

const VerifyCertificate = () => {
  const { number: fromUrl = '' } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(fromUrl);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!fromUrl) return;
    let active = true;
    setChecking(true);
    fetch(`${API_BASE_URL}/certificates/${encodeURIComponent(fromUrl)}`)
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error || 'Could not check the certificate');
        return body as Result;
      })
      .then((r) => { if (active) { setResult(r); setError(null); } })
      .catch((err: Error) => { if (active) { setError(err.message); setResult(null); } })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [fromUrl]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = input.trim().toUpperCase();
    if (n) navigate(`/verify-certificate/${encodeURIComponent(n)}`);
  };

  return (
    <PageShell eyebrow="Certificates" title="Verify a certificate" intro="Check that an SSPL trial certificate is genuine. The number is printed at the bottom of every certificate." path="/verify-certificate">
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="cert-number" className="sr-only">Certificate number</label>
          <input
            id="cert-number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. SSPL-L1-A-ABC123"
            autoCapitalize="characters"
            className="w-full rounded-xl border-2 px-4 py-3 text-base font-semibold uppercase"
            style={{ borderColor: '#cfd6ea', color: COLORS.NAVY }}
          />
          <button type="submit" disabled={checking} className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold uppercase"
            style={{ background: COLORS.LIME, color: COLORS.NAVY }}>
            <Search className="h-5 w-5" aria-hidden="true" />{checking ? 'Checking…' : 'Check'}
          </button>
        </form>
      </Card>

      {error && <Card><p role="alert" style={{ color: '#b42318' }}>{error}</p></Card>}

      {result && (
        <Card>
          {result.valid ? (
            <div role="status" className="flex items-start gap-4">
              <CheckCircle2 className="h-10 w-10 shrink-0" style={{ color: '#1b7f3b' }} aria-hidden="true" />
              <div>
                <CardTitle>Genuine certificate</CardTitle>
                <dl className="mt-3 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1" style={{ color: COLORS.NAVY }}>
                  <dt style={{ color: COLORS.MUTED }}>Number</dt><dd className="font-mono font-semibold">{result.number}</dd>
                  <dt style={{ color: COLORS.MUTED }}>Awarded to</dt><dd className="font-semibold">{result.name || '—'}</dd>
                  <dt style={{ color: COLORS.MUTED }}>Certificate</dt><dd>{result.title}</dd>
                  {result.issuedAt && <><dt style={{ color: COLORS.MUTED }}>Date</dt><dd>{new Date(result.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</dd></>}
                </dl>
              </div>
            </div>
          ) : (
            <div role="status" className="flex items-start gap-4">
              <XCircle className="h-10 w-10 shrink-0" style={{ color: '#b42318' }} aria-hidden="true" />
              <div>
                <CardTitle>Not found</CardTitle>
                <p className="mt-2" style={{ color: COLORS.MUTED }}>No SSPL certificate has the number {result.number}. Check it for typing mistakes, or contact SSPL if you think this is wrong.</p>
              </div>
            </div>
          )}
        </Card>
      )}
    </PageShell>
  );
};

export default VerifyCertificate;
