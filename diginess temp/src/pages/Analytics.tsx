import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '../components/ui/enhanced-loading';
import UTMAnalyticsService from '../services/utmAnalyticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import './Analytics.css';

// Type definitions
interface CampaignSummary {
  utm_id: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  scans: number;
  registrations: number;
  paid_registrations: number;
  total_revenue?: number;
  last_activity?: string;
}

interface CampaignDetail {
  utm_id: string;
  campaign_name: string;
  source: string;
  medium: string;
}

interface RevenueSummary {
  total_revenue: number;
  total_paid_users: number;
}

interface PaidUser {
  id?: string;
  registration_id: string;
  utm_id?: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  payment_amount: number;
  payment_timestamp: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface RegistrationDetail {
  registration_id: string;
  player_name: string;
  player_mobile: string;
  player_email: string;
  player_city: string;
  payment_status: string;
  registration_date: string;
}

interface FunnelData {
  scans: number;
  registrations: number;
  payments: number;
  scan_to_register: number;
  register_to_pay: number;
}

interface DetailedData {
  [key: string]: unknown;
}

interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

/**
 * Advanced Analytics Dashboard Page
 * - Queries the VIEW utm_summary (read-only)
 * - Displays scans, registrations, payments grouped by utm_id
 * - Joins user details where available
 * - Uses realtime subscription on utm_events and utm_payment_users
 * 
 * Does NOT modify any existing backend logic.
 */
export const AnalyticsPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<CampaignSummary[]>([]);
  const [campaignDetails, setCampaignDetails] = useState<Record<string, CampaignDetail>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUtmId, setSelectedUtmId] = useState<string | null>(null);
  const [detailedData, setDetailedData] = useState<DetailedData | null>(null);
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetail[]>([]);
  const [paidUsersDetails, setPaidUsersDetails] = useState<PaidUser[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null);
  const [showFunnel, setShowFunnel] = useState<boolean>(false);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);

  // Realtime state
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRealtime, setIsRealtime] = useState<boolean>(false);
  const [realtimeEvents, setRealtimeEvents] = useState<number>(0);

  // Refs for cleanup
  const utmEventsChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const paymentUsersChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Refs for progress bars
  const registrationProgressRef = useRef<HTMLDivElement>(null);
  const paymentProgressRef = useRef<HTMLDivElement>(null);

  // Memoized fetch function
  const fetchAnalyticsData = useCallback(async (showLoading = true): Promise<void> => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Query the utm_summary VIEW (read-only)
      const { data: summaryResult, error: queryError } = await (supabase as any)
        .from('utm_summary')
        .select('*')
        .order('scans', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setSummaryData((summaryResult || []) as CampaignSummary[]);

      // Fetch campaign details from utm_events
      const campaigns = await UTMAnalyticsService.getCampaignDetails();
      const campaignMap: Record<string, CampaignDetail> = {};
      campaigns.forEach((camp: CampaignDetail) => {
        campaignMap[camp.utm_id] = camp;
      });
      setCampaignDetails(campaignMap);

      // Fetch revenue summary from utm_payment_users
      const revenue = await UTMAnalyticsService.getRevenueSummary();
      setRevenueSummary(revenue);

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Setup realtime subscriptions
  useEffect(() => {
    // Initial data fetch
    fetchAnalyticsData();

    // Subscribe to utm_events table changes (scans, registrations, payments)
    utmEventsChannelRef.current = supabase
      .channel('analytics_utm_events')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'utm_events',
        },
        (payload: RealtimePayload) => {
          console.log('📊 utm_events change:', payload.eventType, payload.new);
          setRealtimeEvents(prev => prev + 1);
          // Refresh data without showing loading spinner
          fetchAnalyticsData(false);
        },
      )
      .subscribe((status: string) => {
        console.log('utm_events subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsRealtime(true);
        }
      });

    // Subscribe to utm_payment_users table changes
    paymentUsersChannelRef.current = supabase
      .channel('analytics_utm_payment_users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'utm_payment_users',
        },
        (payload: RealtimePayload) => {
          console.log('💰 utm_payment_users change:', payload.eventType, payload.new);
          setRealtimeEvents(prev => prev + 1);
          // Refresh data without showing loading spinner
          fetchAnalyticsData(false);
        },
      )
      .subscribe((status: string) => {
        console.log('utm_payment_users subscription status:', status);
      });

    // Cleanup subscriptions on unmount
    return () => {
      if (utmEventsChannelRef.current) {
        supabase.removeChannel(utmEventsChannelRef.current);
      }
      if (paymentUsersChannelRef.current) {
        supabase.removeChannel(paymentUsersChannelRef.current);
      }
    };
  }, [fetchAnalyticsData]);

  // Update progress bar widths when funnel data changes
  useEffect(() => {
    if (funnelData && registrationProgressRef.current && paymentProgressRef.current) {
      const registrationWidth = funnelData.scans > 0
        ? `${(funnelData.registrations / funnelData.scans) * 100}%`
        : '0%';
      const paymentWidth = funnelData.registrations > 0
        ? `${(funnelData.payments / funnelData.registrations) * 100}%`
        : '0%';

      registrationProgressRef.current.style.width = registrationWidth;
      paymentProgressRef.current.style.width = paymentWidth;
    }
  }, [funnelData]);

  const handleRowClick = async (utmId: string): Promise<void> => {
    try {
      setSelectedUtmId(utmId);
      const data = await UTMAnalyticsService.getDetailedAnalytics(utmId);
      setDetailedData(data);

      // Fetch registration details with player info
      const regDetails = await UTMAnalyticsService.getRegistrationDetails(utmId);
      setRegistrationDetails(regDetails);

      // Fetch paid users details from utm_paid_users_details view
      const { data: paidUsers, error: paidError } = await (supabase as any)
        .from('utm_paid_users_details')
        .select('*')
        .eq('utm_id', utmId)
        .order('payment_timestamp', { ascending: false });

      if (!paidError) {
        setPaidUsersDetails(paidUsers || []);
      } else {
        // Fallback to service method
        const paidUsersFromService = await UTMAnalyticsService.getPaidUsersDetails(utmId);
        setPaidUsersDetails(paidUsersFromService);
      }

      setShowFunnel(false);
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
    }
  };

  const handleShowFunnel = async (utmId: string): Promise<void> => {
    try {
      const funnel = await UTMAnalyticsService.getRegistrationFunnel(utmId);
      setFunnelData(funnel);
      setShowFunnel(true);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    }
  };

  const handleExport = async (utmId: string | null = null): Promise<void> => {
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
          <p className="text-gray-600 mt-1">
            Track and analyze your marketing campaigns
            {isRealtime && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
            {realtimeEvents > 0 && (
              <span className="ml-2 text-green-600">({realtimeEvents} live updates)</span>
            )}
          </p>
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
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        ref={registrationProgressRef}
                        className="bg-blue-500 rounded-full h-2 transition-all duration-300 funnel-progress-bar"
                      ></div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-center text-gray-400">↓ {funnelData.register_to_pay}%</div>

                  {/* Step 3: Payments */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">💳 Payments</span>
                      <span className="text-lg font-bold text-green-600">{funnelData.payments}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        ref={paymentProgressRef}
                        className="bg-green-500 rounded-full h-2 transition-all duration-300 funnel-progress-bar"
                      ></div>
                    </div>
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
