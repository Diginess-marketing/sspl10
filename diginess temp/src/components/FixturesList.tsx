import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FixtureCard } from '@/components/FixtureCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EnrichedFixture } from '@/data/fixtures';
import { cn } from '@/lib/utils';

interface FixturesListProps {
  fixtures: EnrichedFixture[];
  className?: string;
}

const sortByDate = (a: EnrichedFixture, b: EnrichedFixture) =>
  new Date(a.date).getTime() - new Date(b.date).getTime();

const FixturesList: React.FC<FixturesListProps> = ({ fixtures, className }) => {
  const navigate = useNavigate();
  const upcoming = fixtures
    .filter((f) => f.result === 'upcoming')
    .sort(sortByDate);
  const live = fixtures.filter((f) => f.result === 'live').sort(sortByDate);
  const completed = fixtures
    .filter((f) => f.result === 'completed')
    .sort(sortByDate)
    .reverse();

  const Grid = ({ items }: { items: EnrichedFixture[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((m) => (
        <FixtureCard
          key={m.id}
          homeTeam={{
            name: m.homeTeam.name,
            abbreviation: m.homeTeam.abbreviation,
            logo: m.homeTeam.logo,
          }}
          awayTeam={{
            name: m.awayTeam.name,
            abbreviation: m.awayTeam.abbreviation,
            logo: m.awayTeam.logo,
          }}
          date={m.date}
          time={m.time}
          venue={m.venue}
          status={m.result}
          score={
            m.result === 'completed' && m.team_a_score && m.team_b_score
              ? { home: m.team_a_score.runs, away: m.team_b_score.runs }
              : undefined
          }
          onClick={() => navigate(`/match/${m.id}`)}
        />
      ))}
    </div>
  );

  return (
    <section className={cn('w-full', className)} aria-labelledby="fixtures-heading">
      <div className="mb-4">
        <h2 id="fixtures-heading" className="text-2xl font-bold text-white">Matches</h2>
        <p className="text-sm text-white/70">Schedule, live and results</p>
      </div>
      <Tabs defaultValue={live.length ? 'live' : 'upcoming'} className="w-full">
        <TabsList aria-label="Filter matches by status">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="live" disabled={!live.length}>Live ({live.length})</TabsTrigger>
          <TabsTrigger value="completed">Results ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <Grid items={upcoming} />
          {!upcoming.length && (
            <p className="text-white/70">No upcoming matches announced.</p>
          )}
        </TabsContent>
        <TabsContent value="live" className="mt-4">
          <Grid items={live} />
          {!live.length && <p className="text-white/70">No live matches currently.</p>}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <Grid items={completed} />
          {!completed.length && (
            <p className="text-white/70">No results available yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default FixturesList;
