import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ga4DataFetchService, GA4UTMReport } from '../services/ga4DataFetchService';
import { Alert, AlertDescription } from './ui/alert';
import { RefreshCw, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

/**
 * GA4 Report Viewer Component
 * Displays UTM campaign data from Google Analytics 4
 */
const GA4ReportViewer: React.FC = () => {
  const [reports, setReports] = useState<GA4UTMReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState({ start: '30daysAgo', end: 'today' });

  const fetchGA4Data = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ga4DataFetchService.getUTMCampaignReport(
        dateRange.start,
        dateRange.end,
      );

      const data = response.data || [];
      setReports(data);
      setLastUpdated(new Date());

      if (data.length === 0) {
        setError('No data available for the selected date range. This could mean no UTM events were tracked in GA4 or the custom dimensions are not set up.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GA4 data');
      console.error('Error fetching GA4 data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    return reports.reduce(
      (acc, report) => ({
        totalUsers: acc.totalUsers + (report.users || 0),
        totalSessions: acc.totalSessions + (report.sessions || 0),
        totalConversions: acc.totalConversions + (report.conversions || 0),
        totalRevenue: acc.totalRevenue + (report.revenue || 0),
      }),
      { totalUsers: 0, totalSessions: 0, totalConversions: 0, totalRevenue: 0 },
    );
  };

  const stats = getTotalStats();
  const conversionRate = stats.totalSessions > 0 
    ? ((stats.totalConversions / stats.totalSessions) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Google Analytics 4 Reports</CardTitle>
              <CardDescription>
                UTM Campaign Performance from GA4 Data API
                {lastUpdated && (
                  <span className="ml-2 text-xs">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              onClick={fetchGA4Data}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Fetch GA4 Data'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" htmlFor="ga4-start-date">
                Start Date
              </label>
              <select
                id="ga4-start-date"
                className="w-full p-2 border rounded-md"
                value={dateRange.start}
                aria-label="Select GA4 start date range"
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              >
                <option value="7daysAgo">Last 7 days</option>
                <option value="14daysAgo">Last 14 days</option>
                <option value="30daysAgo">Last 30 days</option>
                <option value="60daysAgo">Last 60 days</option>
                <option value="90daysAgo">Last 90 days</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" htmlFor="ga4-end-date">
                End Date
              </label>
              <select
                id="ga4-end-date"
                className="w-full p-2 border rounded-md"
                value={dateRange.end}
                aria-label="Select GA4 end date range"
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
              </select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.totalSessions.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold">{stats.totalConversions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{conversionRate}% rate</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Details Table */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Breakdown</CardTitle>
            <CardDescription>UTM campaign performance details from GA4</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">UTM ID</th>
                    <th className="text-left p-3">Source</th>
                    <th className="text-left p-3">Medium</th>
                    <th className="text-left p-3">Campaign</th>
                    <th className="text-right p-3">Users</th>
                    <th className="text-right p-3">Sessions</th>
                    <th className="text-right p-3">Conversions</th>
                    <th className="text-right p-3">Revenue</th>
                    <th className="text-right p-3">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => {
                    const rate = report.sessions > 0
                      ? ((report.conversions / report.sessions) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm">{report.utm_id || 'N/A'}</td>
                        <td className="p-3">{report.utm_source || 'N/A'}</td>
                        <td className="p-3">{report.utm_medium || 'N/A'}</td>
                        <td className="p-3">{report.utm_campaign || 'N/A'}</td>
                        <td className="p-3 text-right">{report.users || 0}</td>
                        <td className="p-3 text-right">{report.sessions || 0}</td>
                        <td className="p-3 text-right font-semibold">{report.conversions || 0}</td>
                        <td className="p-3 text-right">₹{(report.revenue || 0).toLocaleString()}</td>
                        <td className="p-3 text-right text-sm text-muted-foreground">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && reports.length === 0 && !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-semibold mb-2">No GA4 Data</h3>
            <p className="text-muted-foreground mb-4">
              Click "Fetch GA4 Data" to load analytics from Google Analytics 4
            </p>
            <Button onClick={fetchGA4Data} disabled={loading}>
              Fetch GA4 Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GA4ReportViewer;
