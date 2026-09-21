import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '../components/ui/enhanced-loading';
import UTMAnalyticsService from '../services/utmAnalyticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

/**
 * Advanced Analytics Dashboard Page
 * Displays comprehensive UTM tracking and conversion analytics
 */
export const AnalyticsPage = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [campaignDetails, setCampaignDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUtmId, setSelectedUtmId] = useState(null);
  const [detailedData, setDetailedData] = useState(null);
  const [registrationDetails, setRegistrationDetails] = useState([]);
  const [paidUsersDetails, setPaidUsersDetails] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [showFunnel, setShowFunnel] = useState(false);
  const [funnelData, setFunnelData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchAnalyticsData, 10000);

    // Subscribe to real-time paid users updates
    const paidUsersChannel = UTMAnalyticsService.subscribeToPaidUsers((payload) => {
      console.log('New paid user:', payload);
      fetchAnalyticsData();
    });

    return () => {
      clearInterval(interval);
      if (paidUsersChannel) {
        supabase.removeChannel(paidUsersChannel);
      }
    };
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

      setSummaryData(summaryData || []);

      // Fetch campaign details
      const campaigns = await UTMAnalyticsService.getCampaignDetails();
      const campaignMap = {};
      campaigns.forEach(camp => {
        campaignMap[camp.utm_id] = camp;
      });
      setCampaignDetails(campaignMap);

      // Fetch revenue summary from utm_payment_users
      const revenue = await UTMAnalyticsService.getRevenueSummary();
      setRevenueSummary(revenue);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (utmId) => {
    try {
      setSelectedUtmId(utmId);
      const data = await UTMAnalyticsService.getDetailedAnalytics(utmId);
      setDetailedData(data);

      // Fetch registration details with player info
      const regDetails = await UTMAnalyticsService.getRegistrationDetails(utmId);
      setRegistrationDetails(regDetails);

      // Fetch paid users details from utm_payment_users
      const paidUsers = await UTMAnalyticsService.getPaidUsersDetails(utmId);
      setPaidUsersDetails(paidUsers);

      setShowFunnel(false);
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
    }
  };

  const handleShowFunnel = async (utmId) => {
    try {
      const funnel = await UTMAnalyticsService.getRegistrationFunnel(utmId);
      setFunnelData(funnel);
      setShowFunnel(true);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    }
  };

  const handleExport = async (utmId = null) => {
    try {
      const csv = await UTMAnalyticsService.exportToCSV(utmId);
      if (csv) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `utm_analytics_${utmId || 'all'}_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">UTM Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and analyze your marketing campaigns</p>
        </div>
        <button
          onClick={() => fetchAnalyticsData()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
          Error: {error}
        </div>
      )}

      {/* Summary Cards */}
      {summaryData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.reduce((sum, row) => sum + (row.scans || 0), 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">{summaryData.length} campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.reduce((sum, row) => sum + (row.registrations || 0), 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">From scans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Paid Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.reduce((sum, row) => sum + (row.paid_registrations || 0), 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">Payment completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.reduce((sum, row) => sum + (row.scans || 0), 0) > 0
                  ? (
                    (summaryData.reduce((sum, row) => sum + (row.registrations || 0), 0) /
                      summaryData.reduce((sum, row) => sum + (row.scans || 0), 0)) *
                    100
                  ).toFixed(2)
                  : '0.00'}
                %
              </div>
              <p className="text-xs text-gray-600 mt-1">Scan to register</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revenue Summary Card */}
      {revenueSummary && (
        <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-green-800">💰 Revenue Summary</CardTitle>
            <CardDescription>Total revenue from paid users tracked via UTM campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">₹{revenueSummary.total_revenue?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-sm text-gray-600">Paid Users</p>
                <p className="text-2xl font-bold text-green-700">{revenueSummary.total_paid_users?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <p className="text-sm text-gray-600">Avg. Payment</p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{revenueSummary.total_paid_users > 0
                    ? Math.round(revenueSummary.total_revenue / revenueSummary.total_paid_users).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paid Users Details Table */}
      {selectedUtmId && paidUsersDetails.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">💳 Paid Users - {campaignDetails[selectedUtmId]?.campaign_name || selectedUtmId}</CardTitle>
            <CardDescription>Users who completed payment from this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-green-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">User Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold">City</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paidUsersDetails.map((user, index) => (
                    <tr key={user.registration_id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-green-50/50'}>
                      <td className="px-4 py-3 font-medium">{user.user_name || 'N/A'}</td>
                      <td className="px-4 py-3">{user.user_email || 'N/A'}</td>
                      <td className="px-4 py-3">{user.user_phone || 'N/A'}</td>
                      <td className="px-4 py-3">{user.user_city || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-mono text-green-700">
                        ₹{user.payment_amount?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {user.payment_timestamp
                          ? new Date(user.payment_timestamp).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Registration Details Table */}
      {selectedUtmId && registrationDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Players - {campaignDetails[selectedUtmId]?.campaign_name || selectedUtmId}</CardTitle>
            <CardDescription>Player details for {campaignDetails[selectedUtmId]?.source || 'N/A'} ({campaignDetails[selectedUtmId]?.medium || 'N/A'})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Player Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Mobile</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">City</th>
                    <th className="px-4 py-3 text-left font-semibold">Payment Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationDetails.map((detail, index) => (
                    <tr key={detail.registration_id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-medium">{detail.player_name}</td>
                      <td className="px-4 py-3">{detail.player_mobile}</td>
                      <td className="px-4 py-3">{detail.player_email}</td>
                      <td className="px-4 py-3">{detail.player_city}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${detail.payment_status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : detail.payment_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {detail.payment_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {detail.registration_date
                          ? new Date(detail.registration_date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Click on a row to view detailed analytics</CardDescription>
          </CardHeader>
          <CardContent>
            {summaryData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No analytics data available yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Campaign Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Source</th>
                      <th className="px-4 py-3 text-left font-semibold">Medium</th>
                      <th className="px-4 py-3 text-right font-semibold">Scans</th>
                      <th className="px-4 py-3 text-right font-semibold">Registrations</th>
                      <th className="px-4 py-3 text-right font-semibold">Paid</th>
                      <th className="px-4 py-3 text-right font-semibold">Conv. %</th>
                      <th className="px-4 py-3 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map((row, index) => {
                      const conversionRate =
                        row.scans > 0
                          ? ((row.registrations / row.scans) * 100).toFixed(2)
                          : '0.00';

                      const campaign = campaignDetails[row.utm_id];

                      return (
                        <tr
                          key={row.utm_id || index}
                          className={`cursor-pointer hover:bg-gray-100 ${selectedUtmId === row.utm_id ? 'bg-blue-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                          onClick={() => handleRowClick(row.utm_id)}
                        >
                          <td className="px-4 py-3 font-medium">{campaign?.campaign_name || row.utm_id || 'N/A'}</td>
                          <td className="px-4 py-3">{campaign?.source || 'N/A'}</td>
                          <td className="px-4 py-3">{campaign?.medium || 'N/A'}</td>
                          <td className="px-4 py-3 text-right">{row.scans || 0}</td>
                          <td className="px-4 py-3 text-right">{row.registrations || 0}</td>
                          <td className="px-4 py-3 text-right">{row.paid_registrations || 0}</td>
                          <td className="px-4 py-3 text-right font-medium">{conversionRate}%</td>
                          <td className="px-4 py-3 text-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowFunnel(row.utm_id);
                              }}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Funnel
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExport(row.utm_id);
                              }}
                              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Export
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Funnel View */}
          {showFunnel && funnelData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversion Funnel</CardTitle>
                <CardDescription>{selectedUtmId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Step 1: Scans */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">🔍 Scans</span>
                      <span className="text-lg font-bold">{funnelData.scans}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                  </div>

                  {/* Arrow */}
                  <div className="text-center text-gray-400">↓ {funnelData.scan_to_register}%</div>

                  {/* Step 2: Registrations */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">📝 Registrations</span>
                      <span className="text-lg font-bold">{funnelData.registrations}</span>
                    </div>
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{
                        width: funnelData.scans > 0 ? `${(funnelData.registrations / funnelData.scans) * 100}%` : '0%',
                      }}
                    ></div>
                  </div>

                  {/* Arrow */}
                  <div className="text-center text-gray-400">↓ {funnelData.register_to_pay}%</div>

                  {/* Step 3: Payments */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">💳 Payments</span>
                      <span className="text-lg font-bold text-green-600">{funnelData.payments}</span>
                    </div>
                    <div
                      className="bg-green-500 rounded-full h-2"
                      style={{
                        width: funnelData.registrations > 0 ? `${(funnelData.payments / funnelData.registrations) * 100}%` : '0%',
                      }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => setShowFunnel(false)}
                  className="w-full mt-4 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  Close
                </button>
              </CardContent>
            </Card>
          )}

          {/* Export All */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => handleExport()}
                className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
              >
                Export All Data
              </button>
              {selectedUtmId && (
                <button
                  onClick={() => handleExport(selectedUtmId)}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                >
                  Export {selectedUtmId}
                </button>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-gray-600">
              <p>
                <strong>Scans:</strong> Users visiting with UTM parameters
              </p>
              <p>
                <strong>Registrations:</strong> Users who completed registration
              </p>
              <p>
                <strong>Payments:</strong> Registrations with successful payment
              </p>
              <p>
                <strong>Conversion %:</strong> Percentage moving to next step
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
