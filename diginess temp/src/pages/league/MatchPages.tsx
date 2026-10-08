import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Ticket, Radio } from 'lucide-react';
import { useCmsCollection } from '@/lib/cms/useCmsCollection';
import type { EnrichedFixture } from '@/data/fixtures';
import { Card, COLORS, EmptyState, PageShell } from '@/components/league/PageShell';

// Match pages read only admin-published fixtures (Admin → Content → Fixtures). The bundled
// fixtures file is placeholder data, so it is deliberately not used as a fallback here.
const NO_FIXTURES: EnrichedFixture[] = [];

const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const score = (s?: { runs: number; wickets: number; overs: number }) =>
  s && Number.isFinite(Number(s.runs)) ? `${s.runs}/${s.wickets ?? 0}${s.overs !== null && s.overs !== undefined ? ` (${s.overs})` : ''}` : '—';

const STAGE_LABEL: Record<string, string> = { league: 'League', playoff: 'Playoff', final: 'Final' };

/** One match row: teams, score, venue and status. */
const MatchCard = ({ m }: { m: EnrichedFixture }) => {
  const winner = m.winner_id === m.team_a_id ? m.homeTeam?.name : m.winner_id === m.team_b_id ? m.awayTeam?.name : null;
  return (
    <Card className="!p-5 md:!p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm" style={{ color: COLORS.MUTED }}>
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(m.date)} · {m.time}</span>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase" style={{
          background: m.result === 'live' ? '#ffe3e3' : m.result === 'completed' ? '#e7f6ec' : '#eef2fb',
          color: m.result === 'live' ? '#c62828' : m.result === 'completed' ? '#1b7f3b' : COLORS.NAVY,
        }}>
          {m.result === 'live' ? '● Live' : m.result === 'completed' ? 'Result' : m.result === 'cancelled' ? 'Cancelled' : 'Upcoming'} · {STAGE_LABEL[m.match_type] || 'Match'} {m.match_number ? `#${m.match_number}` : ''}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 text-lg">
        <span className="font-bold" style={{ color: COLORS.NAVY }}>{m.homeTeam?.name || m.team_a_id}</span>
        <span className="font-bold tabular-nums" style={{ color: COLORS.NAVY }}>{score(m.team_a_score)}</span>
        <span className="font-bold" style={{ color: COLORS.NAVY }}>{m.awayTeam?.name || m.team_b_id}</span>
        <span className="font-bold tabular-nums" style={{ color: COLORS.NAVY }}>{score(m.team_b_score)}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm" style={{ color: COLORS.MUTED }}>
        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{m.venue}</span>
        {winner && <span style={{ color: '#1b7f3b', fontWeight: 600 }}>{winner} won{m.man_of_the_match ? ` · Player of the match: ${m.man_of_the_match}` : ''}</span>}
        <Link to={`/match/${m.id}`} className="font-semibold" style={{ color: COLORS.BLUE }}>Match centre →</Link>
      </div>
    </Card>
  );
};

const byDate = (dir: 1 | -1) => (a: EnrichedFixture, b: EnrichedFixture) =>
  dir * `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

export const ResultsPage = () => {
  const results = useCmsCollection<EnrichedFixture>('fixtures', NO_FIXTURES).filter((m) => m.result === 'completed').sort(byDate(-1));
  return (
    <PageShell eyebrow="Matches" title="Results" intro="Scores and winners from every completed SSPL match." path="/matches/results">
      {results.length
        ? results.map((m) => <MatchCard key={m.id} m={m} />)
        : <EmptyState title="No results yet" text="Match results appear here as soon as matches are completed." action={{ to: '/matches', label: 'See fixtures' }} />}
    </PageShell>
  );
};

export const LiveScorePage = () => {
  const fixtures = useCmsCollection<EnrichedFixture>('fixtures', NO_FIXTURES);
  const live = fixtures.filter((m) => m.result === 'live');
  const next = fixtures.filter((m) => m.result === 'upcoming').sort(byDate(1))[0];
  return (
    <PageShell eyebrow="Matches" title="Live Score" intro="Follow SSPL matches as they happen." path="/matches/live">
      {live.length ? (
        live.map((m) => <MatchCard key={m.id} m={m} />)
      ) : (
        <>
          <Card className="text-center">
            <Radio className="mx-auto h-8 w-8" style={{ color: COLORS.MUTED }} aria-hidden="true" />
            <p className="mt-3 text-lg font-bold" style={{ color: COLORS.NAVY }}>No match is live right now</p>
            <p className="mt-1" style={{ color: COLORS.MUTED }}>{next ? 'Next up:' : 'The schedule will be published here.'}</p>
          </Card>
          {next && <MatchCard m={next} />}
        </>
      )}
    </PageShell>
  );
};

const STAGES = {
  schedule: { title: 'Schedule', intro: 'Every SSPL match, in order.', path: '/tournament/schedule', filter: () => true },
  'league-stage': { title: 'League Stage', intro: 'All twelve franchises play the league stage; the top four qualify for the playoffs.', path: '/tournament/league-stage', filter: (m: EnrichedFixture) => m.match_type === 'league' },
  playoffs: { title: 'Playoffs', intro: 'The top four teams from the league stage.', path: '/tournament/playoffs', filter: (m: EnrichedFixture) => m.match_type === 'playoff' },
  final: { title: 'Final', intro: 'The SSPL final at Sharjah Stadium.', path: '/tournament/final', filter: (m: EnrichedFixture) => m.match_type === 'final' },
} as const;

export const TournamentStagePage = ({ stage }: { stage: keyof typeof STAGES }) => {
  const s = STAGES[stage];
  const matches = useCmsCollection<EnrichedFixture>('fixtures', NO_FIXTURES).filter(s.filter).sort(byDate(1));
  return (
    <PageShell eyebrow="Tournament" title={s.title} intro={s.intro} path={s.path}>
      {matches.length
        ? matches.map((m) => <MatchCard key={m.id} m={m} />)
        : <EmptyState title="Schedule coming soon" text="Fixtures for this stage will be published here once they are announced." action={{ to: '/league/process', label: 'How the league works' }} />}
    </PageShell>
  );
};

interface TicketItem { id: string; title: string; date: string; time?: string; venue: string; price?: string; url?: string; soldOut?: boolean }

export const TicketsPage = () => {
  const tickets = useCmsCollection<TicketItem>('tickets', []).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <PageShell eyebrow="Matches" title="Tickets" intro="Watch SSPL live at the ground." path="/matches/tickets">
      {tickets.length ? tickets.map((t) => (
        <Card key={t.id} className="flex flex-wrap items-center justify-between gap-4 !p-5 md:!p-6">
          <div>
            <p className="text-lg font-bold" style={{ color: COLORS.NAVY }}>{t.title}</p>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: COLORS.MUTED }}>
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(t.date)}{t.time ? ` · ${t.time}` : ''}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{t.venue}</span>
              {t.price && <span>{t.price}</span>}
            </p>
          </div>
          {t.soldOut ? (
            <span className="rounded-full px-4 py-2 text-sm font-bold" style={{ background: '#eef2fb', color: COLORS.MUTED }}>Sold out</span>
          ) : t.url ? (
            <a href={t.url} target="_blank" rel="noopener noreferrer" className="site-btn site-btn--primary inline-flex items-center gap-2"><Ticket className="h-4 w-4" />Book tickets</a>
          ) : null}
        </Card>
      )) : (
        <EmptyState title="Tickets are not on sale yet" text="Ticket sales open closer to the season. Follow us on social media to hear first." action={{ to: '/social', label: 'Follow SSPL' }} />
      )}
    </PageShell>
  );
};
