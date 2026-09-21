import React from 'react';
import type { EnrichedFixture } from '@/data/fixtures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MatchCenterProps {
  match: EnrichedFixture;
}

const Score: React.FC<{ label: string; runs?: number; wickets?: number; overs?: number }>
  = ({ label, runs, wickets, overs }) => (
  <div className="text-center">
    <div className="text-xs text-white/60">{label}</div>
    {typeof runs === 'number' ? (
      <div className="text-2xl font-extrabold text-white">{runs}/{wickets ?? 0}</div>
    ) : (
      <div className="text-lg font-semibold text-white">-/-</div>
    )}
    {typeof overs === 'number' && (
      <div className="text-xs text-white/60">({overs} ov)</div>
    )}
  </div>
);

const MatchCenter: React.FC<MatchCenterProps> = ({ match }) => {
  const isCompleted = match.result === 'completed';
  const isLive = match.result === 'live';

  return (
    <section aria-labelledby="match-center-heading" className="space-y-6">
      <Card variant="stats" className="bg-gray-900/60 border-white/10">
        <CardHeader>
          <CardTitle id="match-center-heading" className="text-white">
            Match {match.match_number}: {match.homeTeam.name} vs {match.awayTeam.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teams & score */}
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
            <div className="flex items-center gap-3">
              {match.homeTeam.logo && (
                <img src={match.homeTeam.logo} alt="" className="w-10 h-10 rounded-full" loading="lazy" />
              )}
              <div className="text-white">
                <div className="font-semibold">{match.homeTeam.name}</div>
                <div className="text-xs text-white/60">{match.venue}</div>
              </div>
            </div>
            <div className="flex justify-center gap-8">
              <Score label={isLive ? 'LIVE' : isCompleted ? 'FINAL' : '—'}
                     runs={match.team_a_score?.runs}
                     wickets={match.team_a_score?.wickets}
                     overs={match.team_a_score?.overs}
              />
              <Score label=""
                     runs={match.team_b_score?.runs}
                     wickets={match.team_b_score?.wickets}
                     overs={match.team_b_score?.overs}
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              {match.awayTeam.logo && (
                <img src={match.awayTeam.logo} alt="" className="w-10 h-10 rounded-full" loading="lazy" />
              )}
              <div className="text-white text-right">
                <div className="font-semibold">{match.awayTeam.name}</div>
                <div className="text-xs text-white/60">{new Date(match.date).toLocaleDateString('en-IN')} · {match.time}</div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-white/80">
            <div>
              <div className="text-white/60">Venue</div>
              <div>{match.venue}</div>
            </div>
            <div>
              <div className="text-white/60">Status</div>
              <div className="capitalize">{match.result}</div>
            </div>
            <div>
              <div className="text-white/60">Type</div>
              <div className="capitalize">{match.match_type}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default MatchCenter;
