import React from 'react';
import SEO from '@/components/SEO';
import MatchFixtures from '@/components/MatchFixtures';

const MatchesPage: React.FC = () => {
  return (
    <main id="main-content" className="container mx-auto px-4 py-8 max-w-7xl">
      <SEO preset="matches" config={{ ogType: 'website' }} canonical="https://ssplt10.com/matches" />
      <MatchFixtures />
    </main>
  );
};

export default MatchesPage;
