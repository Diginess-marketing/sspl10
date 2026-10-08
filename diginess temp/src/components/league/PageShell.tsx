import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import SEO from '@/components/SEO';

// Shared layout for league information and data pages: navy hero, then white content cards.
// Colours are set inline: the site's global CSS forces text colour on p/span/headings,
// which beats Tailwind colour classes.

const NAVY = '#0a1240';
const LIME = '#dffc35';

interface PageShellProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  /** Shows the "Draft – subject to SSPL approval" banner (policy text not yet signed off). */
  draft?: boolean;
  /** Canonical path for SEO, e.g. /players/eligibility */
  path: string;
  children: ReactNode;
}

export const PageShell = ({ eyebrow, title, intro, draft, path, children }: PageShellProps) => (
  <div className="league-page relative z-10" style={{ background: '#001b69' }}>
    <SEO config={{ title: `${title} | SSPL T10`, description: intro || title }} canonical={`https://ssplt10.co.in${path}`} />
    <header className="mx-auto w-full max-w-5xl px-4 pt-14 pb-10 md:pt-20 md:pb-14">
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] md:text-sm" style={{ color: LIME }}>{eyebrow}</p>
      )}
      <h1 className="text-3xl font-bold uppercase md:text-5xl" style={{ color: '#fff' }}>{title}</h1>
      {intro && (
        <p className="mt-4 max-w-3xl text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.82)' }}>{intro}</p>
      )}
    </header>
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-16 md:pb-24">
      {draft && (
        <div role="note" className="flex items-start gap-3 rounded-2xl border px-4 py-3" style={{ background: '#fff8e1', borderColor: '#f5c451', color: '#5c4300' }}>
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm" style={{ color: '#5c4300' }}>
            <strong>Draft – subject to SSPL approval.</strong> This page is an initial draft and may change before the
            official version is published. For questions, <Link to="/enquiry" style={{ color: '#5c4300', textDecoration: 'underline' }}>contact us</Link>.
          </p>
        </div>
      )}
      {children}
    </main>
  </div>
);

/** White content card; text inside is navy. */
export const Card = ({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) => (
  <section id={id} className={`rounded-2xl p-6 shadow-sm md:p-8 ${className}`} style={{ background: '#fff', color: NAVY }}>
    {children}
  </section>
);

export const CardTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-4 text-xl font-bold md:text-2xl" style={{ color: NAVY }}>{children}</h2>
);

/** Friendly empty state for admin-managed lists that have nothing published yet. */
export const EmptyState = ({ title, text, action }: { title: string; text: string; action?: { to: string; label: string } }) => (
  <Card className="text-center">
    <p className="text-lg font-bold" style={{ color: NAVY }}>{title}</p>
    <p className="mx-auto mt-2 max-w-xl" style={{ color: '#55607a' }}>{text}</p>
    {action && (
      <Link to={action.to} className="site-btn site-btn--primary mt-6 inline-flex">{action.label}</Link>
    )}
  </Card>
);

export const COLORS = { NAVY, LIME, MUTED: '#55607a', BLUE: '#1f57d6' };
