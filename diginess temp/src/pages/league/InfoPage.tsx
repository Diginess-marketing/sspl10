import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { findInfoPage } from '@/content/infoPages';
import { Card, CardTitle, COLORS, PageShell } from '@/components/league/PageShell';
import NotFound from '@/pages/NotFound';

// Renders a league information page from src/content/infoPages.ts by URL.
const InfoPage = () => {
  const { pathname } = useLocation();
  const page = findInfoPage(pathname);
  if (!page) return <NotFound />;

  return (
    <PageShell eyebrow={page.eyebrow} title={page.title} intro={page.intro} draft={page.draft} path={page.path}>
      {page.sections.map((s) => (
        <Card key={s.heading}>
          <CardTitle>{s.heading}</CardTitle>

          {s.text?.map((t) => (
            <p key={t} className="mb-3 text-base leading-relaxed last:mb-0" style={{ color: COLORS.NAVY }}>{t}</p>
          ))}

          {s.bullets && (
            <ul className="space-y-2">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-3 leading-relaxed">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS.BLUE }} aria-hidden="true" />
                  <span style={{ color: COLORS.NAVY }}>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {s.steps && (
            <ol className="relative space-y-5">
              {s.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold"
                    style={{ background: COLORS.LIME, color: COLORS.NAVY }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold" style={{ color: COLORS.NAVY }}>{step.title}</p>
                    <p className="mt-1 leading-relaxed" style={{ color: COLORS.MUTED }}>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {s.cards && (
            <div className="grid gap-4 sm:grid-cols-2">
              {s.cards.map((c) => (
                <div key={c.title} className="rounded-xl border p-5" style={{ borderColor: '#e3e8f4', background: '#f7f9fd' }}>
                  <p className="font-bold" style={{ color: COLORS.NAVY }}>{c.title}</p>
                  <p className="mt-1 leading-relaxed" style={{ color: COLORS.MUTED }}>{c.text}</p>
                </div>
              ))}
            </div>
          )}

          {s.links && (
            <div className="mt-5 flex flex-wrap gap-3">
              {s.links.map((l) => (
                <Link key={l.to} to={l.to} className="inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline" style={{ color: COLORS.BLUE }}>
                  {l.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      ))}

      {page.cta && (
        <div className="flex justify-center pt-2">
          <Link to={page.cta.to} className="site-btn site-btn--primary">{page.cta.label}</Link>
        </div>
      )}
    </PageShell>
  );
};

export default InfoPage;
