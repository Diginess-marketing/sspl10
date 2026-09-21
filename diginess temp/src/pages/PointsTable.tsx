import React from 'react';
import SEO from '@/components/SEO';
import PointsTable from '@/components/PointsTable';
import standings from '@/data/standings';

const PointsTablePage: React.FC = () => {
  return (
    <main id="main-content" className="container mx-auto px-4 py-8 max-w-5xl">
      <SEO preset="standings" config={{ ogType: 'website' }} canonical="https://ssplt10.com/points-table" />
      <h1 className="sr-only">Points Table</h1>
      <PointsTable standings={standings} />
    </main>
  );
};

export default PointsTablePage;
