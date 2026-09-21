import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';
import { 
  getCampaignAnalytics, 
  getCampaignSummary,
  getUnifiedCampaignAnalytics,
  compareLocalVsGA4Data,
  getGA4SyncStatus
} from '@/utils/campaign-analytics';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Database,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import SEO from '@/components/SEO';

interface CampaignData {
  utm_campaign: string;
  total_registrations: number;
  total_paid: number;
  total_revenue: number;
  conversion_rate: number;
  avg_revenue_per_paid_user: number;
}

interface UnifiedCampaignData {
  utm_campaign: string;
  local_registrations: number;
  local_paid: number;
  local_revenue: number;
  local_conversion_rate: number;
  local_avg_revenue_per_paid_user: number;
  ga4_sessions: number;
  ga4_users: number;
  ga4_new_users: number;
  ga4_engaged_sessions: number;
  ga4_pageviews: number;
  ga4_avg_bounce_rate: number;
  ga4_avg_session_duration: number;
  ga4_conversions: number;
  ga4_avg_conversion_rate: number;
  ga4_revenue: number;
  ga4_avg_revenue_per_user: number;
  session_to_registration_rate: number | null;
  local_vs_ga4_revenue_match_rate: number | null;
  primary_source: string | null;
  primary_medium: string | null;
  first_local_registration: string | null;
  last_local_registration: string | null;
  first_ga4_data_date: string | null;
  last_ga4_data_date: string | null;
  last_ga4_sync: string | null;
  has_local_data: boolean;
  has_ga4_data: boolean;
}

interface SummaryData {
  total_campaigns: number;
  total_registrations: number;
  total_paid: number;
  total_revenue: number;
  overall_conversion_rate: string;
  avg_revenue_per_registration: string;
  avg_revenue_per_paid_user: string;
}

interface GA4SyncStatus {
  is_sync_running: boolean;
  last_successful_sync: string | null;
  latest_sync?: {
    status: string;
    campaigns_synced: number;
  };
}

const CampaignDashboard = () => {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [unifiedCampaigns, setUnifiedCampaigns] = useState<UnifiedCampaignData[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [ga4SyncStatus, setGA4SyncStatus] = useState<GA4SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'local' | 'unified'>('local');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load local data
      const [campaignsResult, summaryResult] = await Promise.all([
        getCampaignAnalytics(),
        getCampaignSummary()
      ]);
      
      if (campaignsResult.success) {
        setCampaigns(campaignsResult.data);
      }
      
      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }

      // Try to load unified GA4 data
      try {
        const [unifiedResult, syncStatusResult] = await Promise.all([
          getUnifiedCampaignAnalytics({ limit: 50 }),
          getGA4SyncStatus()
        ]);

        if (unifiedResult.success && unifiedResult.data.length > 0) {
          setUnifiedCampaigns(unifiedResult.data);
        }

        if (syncStatusResult.success) {
          setGA4SyncStatus(syncStatusResult.data);
        }
      } catch (ga4Error) {
        // GA4 data is optional, don't fail the whole dashboard
        console.log('GA4 data not available:', ga4Error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load campaign data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const hasGA4Data = unifiedCampaigns.length > 0 && unifiedCampaigns.some(c => c.has_ga4_data);

  return (
    <>
      <SEO
        preset="home"
        config={{
          title: 'Campaign Analytics Dashboard - SSPL T10',
          description: 'Track UTM campaign performance and registration analytics',
          keywords: ['campaign analytics', 'utm tracking', 'marketing dashboard'],
        }}
      />

      <main className="min-h-screen py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Campaign Analytics
              </h1>
              <p className="text-gray-600">
                Track your marketing campaigns and registration performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              {ga4SyncStatus && (
                <div className="flex items-center gap-2 text-sm">
                  {ga4SyncStatus.is_sync_running ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-gray-600">Syncing GA4...</span>
                    </>
                  ) : ga4SyncStatus.last_successful_sync ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">
                        Last sync: {new Date(ga4SyncStatus.last_successful_sync).toLocaleDateString()}
                      </span>
                    </>
                  ) : null}
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadDashboardData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Registrations
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.total_registrations}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all campaigns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Paid Users
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.total_paid}</div>
                  <p className="text-xs text-muted-foreground">
                    Converted to paid
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{summary.total_revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Gross revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg Conversion
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.overall_conversion_rate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Overall conversion rate
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Campaign Performance Tables with Tabs */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>
                    {hasGA4Data 
                      ? 'Compare local tracking with Google Analytics 4 data'
                      : 'Detailed breakdown of each marketing campaign'
                    }
                  </CardDescription>
                </div>
                {hasGA4Data && (
                  <Badge variant="outline" className="w-fit">
                    <Database className="w-3 h-3 mr-1" />
                    GA4 Data Available
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={hasGA4Data ? "unified" : "local"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="local" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Local Tracking
                  </TabsTrigger>
                  <TabsTrigger value="unified" disabled={!hasGA4Data} className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Unified (Local + GA4)
                  </TabsTrigger>
                </TabsList>

                {/* Local Data Table */}
                <TabsContent value="local">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Campaign</th>
                          <th className="text-right p-4 font-medium">Registrations</th>
                          <th className="text-right p-4 font-medium">Paid</th>
                          <th className="text-right p-4 font-medium">Conversion</th>
                          <th className="text-right p-4 font-medium">Revenue</th>
                          <th className="text-right p-4 font-medium">Avg/User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map((campaign) => (
                          <tr key={campaign.utm_campaign} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <Badge variant={campaign.utm_campaign === 'Direct Traffic' ? 'secondary' : 'default'}>
                                {campaign.utm_campaign}
                              </Badge>
                            </td>
                            <td className="p-4 text-right">{campaign.total_registrations}</td>
                            <td className="p-4 text-right">{campaign.total_paid}</td>
                            <td className="p-4 text-right">
                              <span className={`font-medium ${
                                campaign.conversion_rate >= 70 ? 'text-green-600' :
                                campaign.conversion_rate >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {campaign.conversion_rate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-4 text-right">₹{campaign.total_revenue.toLocaleString()}</td>
                            <td className="p-4 text-right">₹{campaign.avg_revenue_per_paid_user.toFixed(0)}</td>
                          </tr>
                        ))}
                        {campaigns.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                              No campaign data available yet. Start driving traffic with UTM parameters!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                {/* Unified Data Table */}
                <TabsContent value="unified">
                  {hasGA4Data ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium">Campaign</th>
                            <th className="text-right p-3 font-medium">
                              <div className="text-xs text-blue-600">GA4</div>
                              Sessions
                            </th>
                            <th className="text-right p-3 font-medium">
                              <div className="text-xs text-green-600">Local</div>
                              Registrations
                            </th>
                            <th className="text-right p-3 font-medium">
                              Session→Reg
                            </th>
                            <th className="text-right p-3 font-medium">
                              <div className="text-xs text-green-600">Local</div>
                              Revenue
                            </th>
                            <th className="text-right p-3 font-medium">
                              <div className="text-xs text-blue-600">GA4</div>
                              Revenue
                            </th>
                            <th className="text-right p-3 font-medium">Match %</th>
                            <th className="text-right p-3 font-medium">
                              <div className="text-xs text-blue-600">GA4</div>
                              Bounce
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {unifiedCampaigns.map((campaign) => {
                            const revenueMatch = campaign.local_vs_ga4_revenue_match_rate || 0;
                            const isGoodMatch = revenueMatch >= 80 && revenueMatch <= 120;
                            
                            return (
                              <tr key={campaign.utm_campaign} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                  <div className="flex flex-col gap-1">
                                    <Badge variant={campaign.utm_campaign === 'Direct Traffic' ? 'secondary' : 'default'}>
                                      {campaign.utm_campaign}
                                    </Badge>
                                    <div className="flex gap-1">
                                      {campaign.has_local_data && (
                                        <span className="text-xs text-green-600" title="Has local data">L</span>
                                      )}
                                      {campaign.has_ga4_data && (
                                        <span className="text-xs text-blue-600" title="Has GA4 data">G</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-right text-blue-600 font-medium">
                                  {campaign.ga4_sessions || '-'}
                                </td>
                                <td className="p-3 text-right text-green-600 font-medium">
                                  {campaign.local_registrations || '-'}
                                </td>
                                <td className="p-3 text-right">
                                  {campaign.session_to_registration_rate ? (
                                    <span className="text-gray-700 font-medium">
                                      {campaign.session_to_registration_rate.toFixed(1)}%
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="p-3 text-right text-green-600 font-medium">
                                  ₹{(campaign.local_revenue || 0).toLocaleString()}
                                </td>
                                <td className="p-3 text-right text-blue-600 font-medium">
                                  ₹{(campaign.ga4_revenue || 0).toLocaleString()}
                                </td>
                                <td className="p-3 text-right">
                                  {revenueMatch > 0 ? (
                                    <div className="flex items-center justify-end gap-1">
                                      <span className={`font-medium ${
                                        isGoodMatch ? 'text-green-600' : 'text-yellow-600'
                                      }`}>
                                        {revenueMatch.toFixed(0)}%
                                      </span>
                                      {isGoodMatch ? (
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <AlertCircle className="w-3 h-3 text-yellow-600" />
                                      )}
                                    </div>
                                  ) : '-'}
                                </td>
                                <td className="p-3 text-right">
                                  {campaign.ga4_avg_bounce_rate > 0 ? (
                                    <span className={`font-medium ${
                                      campaign.ga4_avg_bounce_rate <= 40 ? 'text-green-600' :
                                      campaign.ga4_avg_bounce_rate <= 60 ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {campaign.ga4_avg_bounce_rate.toFixed(1)}%
                                    </span>
                                  ) : '-'}
                                </td>
                              </tr>
                            );
                          })}
                          {unifiedCampaigns.length === 0 && (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-gray-500">
                                No unified data available. Sync GA4 data from Admin Panel.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      
                      {/* Legend */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 space-y-2">
                          <div className="font-medium mb-2">Legend:</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-medium">GA4</span>
                              <span>Google Analytics data</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-medium">Local</span>
                              <span>Direct tracking data</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Session→Reg</span>
                              <span>% of sessions that registered</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Match %</span>
                              <span>Local/GA4 revenue comparison</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 space-y-4">
                      <Database className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <p className="font-medium mb-2">GA4 Data Not Available</p>
                        <p className="text-sm">
                          Configure GA4 sync in the Admin Panel to see unified analytics.
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How to Track Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  Add UTM parameters to your registration links to track campaign performance:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs">
                  https://ssplt10.com/register?utm_campaign=facebook_ads<br />
                  https://ssplt10.com/register?utm_campaign=google_ads<br />
                  https://ssplt10.com/register?utm_campaign=instagram_stories
                </div>
                <p className="text-gray-600">
                  The system automatically captures the UTM campaign parameter and tracks it through
                  registration and payment completion.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default CampaignDashboard;
