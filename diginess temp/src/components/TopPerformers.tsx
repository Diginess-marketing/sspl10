import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardGrid } from '@/components/ui/card';

type Performer = {
  id: string;
  name: string;
  team: string;
  statLabel: string;
  statValue: string | number;
};

interface TopPerformersProps {
  title: string;
  performers: Performer[];
}

const TopPerformers: React.FC<TopPerformersProps> = ({ title, performers }) => {
  return (
    <section aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`} className="sr-only">{title}</h2>
      <CardGrid variant="stats">
        {performers.map((p) => (
          <Card key={p.id} variant="stats" className="bg-gray-900/60 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-white/80">
              <div className="text-sm">{p.team}</div>
              <div className="mt-2 text-xs text-white/60">{p.statLabel}</div>
              <div className="text-2xl font-bold text-white">{p.statValue}</div>
            </CardContent>
          </Card>
        ))}
      </CardGrid>
    </section>
  );
};

export default TopPerformers;
