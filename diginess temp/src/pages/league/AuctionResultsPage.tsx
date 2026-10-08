import { Link, NavLink } from 'react-router-dom';
import { useCmsCollection } from '@/lib/cms/useCmsCollection';
import { Card, COLORS, EmptyState, PageShell } from '@/components/league/PageShell';

// Sold / unsold players from Admin → Content → Auction results.
interface AuctionPlayer { name: string; season: string; status: 'sold' | 'unsold'; team?: string; price?: number; role?: string; location?: string; image?: string }

const VIEWS = {
  all: { title: 'Auction Results', path: '/auction/results', intro: 'Every player from the SSPL player auction.' },
  sold: { title: 'Sold Players', path: '/auction/sold', intro: 'Players picked by the franchises, with their team and price.' },
  unsold: { title: 'Unsold Players', path: '/auction/unsold', intro: 'Players who went unsold at the auction.' },
} as const;

const inr = (n?: number) => (n ? `₹${Number(n).toLocaleString('en-IN')}` : '');

const AuctionResultsPage = ({ view }: { view: keyof typeof VIEWS }) => {
  const v = VIEWS[view];
  const players = useCmsCollection<AuctionPlayer>('auction_players', []);
  const latestSeason = players.map((p) => p.season).sort().pop();
  const shown = players
    .filter((p) => p.season === latestSeason && (view === 'all' || p.status === view))
    .sort((a, b) => (b.price || 0) - (a.price || 0) || a.name.localeCompare(b.name));
  const sold = players.filter((p) => p.season === latestSeason && p.status === 'sold');

  return (
    <PageShell eyebrow={latestSeason ? `Auction ${latestSeason}` : 'Auction'} title={v.title} intro={v.intro} path={v.path}>
      <nav className="flex flex-wrap gap-2" aria-label="Auction results">
        {(Object.keys(VIEWS) as (keyof typeof VIEWS)[]).map((k) => (
          <NavLink key={k} to={VIEWS[k].path} end className="rounded-full px-4 py-2 text-sm font-bold"
            style={({ isActive }) => ({ background: isActive ? '#dffc35' : 'rgba(255,255,255,0.12)', color: isActive ? COLORS.NAVY : '#fff' })}>
            {k === 'all' ? 'All' : k === 'sold' ? 'Sold' : 'Unsold'}
          </NavLink>
        ))}
      </nav>

      {players.length === 0 ? (
        <EmptyState title="Auction results will be published here" text="Players selected at the final trial level go to the auction. Results appear here after the auction." action={{ to: '/auction', label: 'See the auction pool' }} />
      ) : (
        <>
          {view !== 'unsold' && sold.length > 0 && (
            <Card className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
              <div><p className="text-2xl font-bold" style={{ color: COLORS.NAVY }}>{sold.length}</p><p className="text-sm" style={{ color: COLORS.MUTED }}>players sold</p></div>
              <div><p className="text-2xl font-bold" style={{ color: COLORS.NAVY }}>{inr(Math.max(...sold.map((p) => p.price || 0)))}</p><p className="text-sm" style={{ color: COLORS.MUTED }}>top price</p></div>
              <div className="col-span-2 sm:col-span-1"><p className="text-2xl font-bold" style={{ color: COLORS.NAVY }}>{new Set(sold.map((p) => p.team)).size}</p><p className="text-sm" style={{ color: COLORS.MUTED }}>teams</p></div>
            </Card>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {shown.map((p) => (
              <Card key={`${p.name}-${p.team}`} className="flex items-center gap-4 !p-4">
                {p.image
                  ? <img src={p.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-full object-cover" />
                  : <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl font-bold" style={{ background: '#eef2fb', color: COLORS.NAVY }}>{p.name.slice(0, 1)}</span>}
                <div className="min-w-0">
                  <p className="truncate font-bold" style={{ color: COLORS.NAVY }}>{p.name}</p>
                  <p className="text-sm" style={{ color: COLORS.MUTED }}>{[p.role, p.location].filter(Boolean).join(' · ')}</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: p.status === 'sold' ? '#1b7f3b' : COLORS.MUTED }}>
                    {p.status === 'sold' ? `Sold${p.team ? ` to ${p.team}` : ''}${p.price ? ` · ${inr(p.price)}` : ''}` : 'Unsold'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          {shown.length === 0 && <EmptyState title="No players in this list" text="Try another tab." />}
        </>
      )}
      <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <Link to="/auction" style={{ color: '#dffc35' }}>About the SSPL auction →</Link>
      </p>
    </PageShell>
  );
};

export default AuctionResultsPage;
