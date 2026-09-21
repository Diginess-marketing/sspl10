import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import fixtures from '@/data/fixtures';
import MatchCenter from '@/components/MatchCenter';

const MatchCenterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const match = fixtures.find((m) => m.id === id);

  const title = match
    ? `SSPL T10 Match ${match.match_number}: ${match.homeTeam.name} vs ${match.awayTeam.name}`
    : 'Match Not Found';

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 max-w-5xl">
      <SEO
        config={{
          title,
          description: 'Live scores, results and match details for SSPL T10.',
          ogType: 'website',
          canonical: match ? `https://ssplt10.com/match/${match.id}` : 'https://ssplt10.com/matches',
        }}
      />
      {!match ? (
        <div className="text-white">
          <h1 className="text-2xl font-bold mb-2">Match not found</h1>
          <p className="mb-4">The match you are looking for does not exist.</p>
          <Link to="/matches" className="text-sport-orange underline">Back to Matches</Link>
        </div>
      ) : (
        <>
          <h1 className="sr-only">{title}</h1>
          <MatchCenter match={match} />
        </>
      )}
    </main>
  );
};

export default MatchCenterPage;
