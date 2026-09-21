import React from 'react';
import UTMAnalyticsDashboard from '../components/UTMAnalyticsDashboard';

/**
 * Google Analytics 4 Integration Page
 * 
 * This page displays real-time data from Google Analytics 4
 * combined with Supabase registration and payment tracking
 */
const GA4Analytics: React.FC = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Combined GA4 traffic data with UTM campaign performance and paid registrations
        </p>
      </div>

      <UTMAnalyticsDashboard />
    </div>
  );
};

export default GA4Analytics;
