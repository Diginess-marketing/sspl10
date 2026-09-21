import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from './ui/enhanced-loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

/**
 * Analytics Dashboard Component
 * Displays UTM tracking summary data in a table format
 */
export const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: summaryData, error: queryError } = await supabase
        .from('utm_summary')
        .select('*')
        .order('scans', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setData(summaryData || []);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>UTM Analytics Dashboard</CardTitle>
            <CardDescription>Tracking summary by UTM source</CardDescription>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
              Error: {error}
            </div>
          )}

          {data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No analytics data available yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">UTM ID</th>
                    <th className="px-4 py-3 text-right font-semibold">Scans</th>
                    <th className="px-4 py-3 text-right font-semibold">Registrations</th>
                    <th className="px-4 py-3 text-right font-semibold">Paid Registrations</th>
                    <th className="px-4 py-3 text-right font-semibold">Conversion Rate</th>
                    <th className="px-4 py-3 text-right font-semibold">Payment Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => {
                    const conversionRate =
                      row.scans > 0
                        ? ((row.registrations / row.scans) * 100).toFixed(2)
                        : '0.00';
                    const paymentRate =
                      row.registrations > 0
                        ? ((row.paid_registrations / row.registrations) * 100).toFixed(2)
                        : '0.00';

                    return (
                      <tr
                        key={row.utm_id || index}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className="px-4 py-3 font-medium">{row.utm_id || 'N/A'}</td>
                        <td className="px-4 py-3 text-right">{row.scans || 0}</td>
                        <td className="px-4 py-3 text-right">{row.registrations || 0}</td>
                        <td className="px-4 py-3 text-right">{row.paid_registrations || 0}</td>
                        <td className="px-4 py-3 text-right">{conversionRate}%</td>
                        <td className="px-4 py-3 text-right">{paymentRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-xs text-gray-600 uppercase font-semibold">Total Scans</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {data.reduce((sum, row) => sum + (row.scans || 0), 0)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-xs text-gray-600 uppercase font-semibold">
                    Total Registrations
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {data.reduce((sum, row) => sum + (row.registrations || 0), 0)}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-xs text-gray-600 uppercase font-semibold">
                    Total Paid Registrations
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mt-1">
                    {data.reduce((sum, row) => sum + (row.paid_registrations || 0), 0)}
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-xs text-gray-600 uppercase font-semibold">
                    Overall Conversion
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mt-1">
                    {data.reduce((sum, row) => sum + (row.scans || 0), 0) > 0
                      ? (
                        (data.reduce((sum, row) => sum + (row.registrations || 0), 0) /
                          data.reduce((sum, row) => sum + (row.scans || 0), 0)) *
                        100
                      ).toFixed(2)
                      : '0.00'}
                    %
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
