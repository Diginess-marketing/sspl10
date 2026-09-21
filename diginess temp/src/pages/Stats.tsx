import React from 'react';
import SEO from '@/components/SEO';
import StatsTabs from '@/components/StatsTabs';

const StatsPage: React.FC = () => {
  return (
    <main id="main-content" className="container mx-auto px-4 py-8 max-w-7xl">
      <SEO
        config={{
          title: 'SSPL T10 Statistics',
          description: 'Top run scorers, strike rates, wicket-takers and economy rates for SSPL T10.',
          ogType: 'website',
          canonical: 'https://ssplt10.com/stats',
        }}
      />
      <h1 className="text-2xl font-bold text-white mb-4">Statistics</h1>
      <p className="text-white/70 mb-6">Season leaders across batting and bowling</p>
      <StatsTabs />
    </main>
  );
};

export default StatsPage;
