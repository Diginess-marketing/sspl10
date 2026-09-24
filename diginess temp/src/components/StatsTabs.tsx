import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopPerformers from '@/components/TopPerformers';
import { topBatting as builtInBatting, topBowling as builtInBowling } from '@/data/stats';
import { useCmsCollection } from '@/lib/cms/useCmsCollection';

const TEAM_NAME: Record<string, string> = {
  tn: 'Tamil Nadu',
  ka: 'Karnataka',
  ke: 'Kerala',
  ts: 'Telangana',
  ap: 'Andhra Pradesh',
  py: 'Puducherry',
};

const StatsTabs: React.FC = () => {
  const topBatting = useCmsCollection('batting_leaders', builtInBatting);
  const topBowling = useCmsCollection('bowling_leaders', builtInBowling);
  const batting = topBatting.map((p) => ({
    id: p.id,
    name: p.name,
    team: TEAM_NAME[p.team_id] || p.team_id.toUpperCase(),
    statLabel: 'Runs (SR)',
    statValue: `${p.runs} (${p.strike_rate.toFixed(1)})`,
  }));
  const bowling = topBowling.map((p) => ({
    id: p.id,
    name: p.name,
    team: TEAM_NAME[p.team_id] || p.team_id.toUpperCase(),
    statLabel: 'Wickets (Econ)',
    statValue: `${p.wickets} (${p.economy.toFixed(1)})`,
  }));

  return (
    <Tabs defaultValue="batting" className="w-full">
      <TabsList aria-label="Select stats category">
        <TabsTrigger value="batting">Batting</TabsTrigger>
        <TabsTrigger value="bowling">Bowling</TabsTrigger>
      </TabsList>
      <TabsContent value="batting" className="mt-6">
        <TopPerformers title="Top Batters" performers={batting} />
      </TabsContent>
      <TabsContent value="bowling" className="mt-6">
        <TopPerformers title="Top Bowlers" performers={bowling} />
      </TabsContent>
    </Tabs>
  );
};

export default StatsTabs;
