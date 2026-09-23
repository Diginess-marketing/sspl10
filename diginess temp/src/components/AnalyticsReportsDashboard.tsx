import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  Users,
  Eye,
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  Target,
  Activity,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { BarChart, PieChart, AreaChart, MetricCard } from '@/components/charts';
import { googleAnalyticsService } from '@/services/googleAnalyticsService';

interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ReportData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number; percentage: number }>;
  trafficSources: Array<{ source: string; visitors: number; percentage: number }>;
  deviceBreakdown: Array<{ device: string; users: number; percentage: number }>;
  conversionFunnel: Array<{ step: string; users: number; conversion: number }>;
  realtimeUsers: number;
}

const AnalyticsReportsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration - replace with actual GA API calls
  const mockReportData: ReportData = {
    pageViews: 15420,
    uniqueVisitors: 8934,
    bounceRate: 34.2,
    avgSessionDuration: 185,
    topPages: [
      { page: '/', views: 4520, percentage: 29.3 },
      { page: '/registration', views: 3210, percentage: 20.8 },
      { page: '/teams', views: 2890, percentage: 18.7 },
      { page: '/gallery', views: 2150, percentage: 13.9 },
      { page: '/contact', views: 1650, percentage: 10.7 },
    ],
    trafficSources: [
      { source: 'Direct', visitors: 4230, percentage: 47.3 },
      { source: 'Google Search', visitors: 2890, percentage: 32.3 },
      { source: 'Social Media', visitors: 1230, percentage: 13.7 },
      { source: 'Referral', visitors: 584, percentage: 6.5 },
    ],
    deviceBreakdown: [
      { device: 'Mobile', users: 6234, percentage: 69.8 },
      { device: 'Desktop', users: 2340, percentage: 26.2 },
      { device: 'Tablet', users: 360, percentage: 4.0 },
    ],
    conversionFunnel: [
      { step: 'Page Visit', users: 8934, conversion: 100 },
      { step: 'Registration Start', users: 3210, conversion: 35.9 },
      { step: 'Form Completion', users: 2890, conversion: 32.4 },
      { step: 'Payment', users: 2150, conversion: 24.1 },
      { step: 'Success', users: 1650, conversion: 18.5 },
    ],
    realtimeUsers: 47,
  };

  const metrics: AnalyticsMetric[] = [
    {
      name: 'Page Views',
      value: reportData?.pageViews || 0,
      change: 12.5,
      changeType: 'increase',
      icon: Eye,
      color: 'text-blue-600',
    },
    {
      name: 'Unique Visitors',
      value: reportData?.uniqueVisitors || 0,
      change: 8.3,
      changeType: 'increase',
      icon: Users,
      color: 'text-green-600',
    },
    {
      name: 'Bounce Rate',
      value: reportData?.bounceRate || 0,
      change: -2.1,
      changeType: 'decrease',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
    {
      name: 'Avg. Session',
      value: reportData?.avgSessionDuration || 0,
      change: 5.7,
      changeType: 'increase',
      icon: Activity,
      color: 'text-purple-600',
    },
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Initialize Google Analytics service
      const isInitialized = await googleAnalyticsService.initialize();

      if (!isInitialized) {
        toast({
          title: 'Google Analytics Not Configured',
          description: 'Please configure Google Analytics in the admin panel to view reports.',
          variant: 'destructive',
        });
        return;
      }

      // In a real implementation, you would fetch data from Google Analytics API
      // For now, we'll use mock data but track real events
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Track dashboard view
      await googleAnalyticsService.trackEvent('dashboard_view', {
        category: 'analytics',
        label: 'reports_dashboard',
        page: 'admin_analytics',
      });

      // Simulate loading report data
      setReportData(mockReportData);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();

    switch (period) {
      case '7d':
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case '30d':
        setDateRange({ from: subDays(now, 30), to: now });
        break;
      case '90d':
        setDateRange({ from: subDays(now, 90), to: now });
        break;
      case 'custom':
        // Keep current custom range
        break;
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const exportReport = () => {
    // In a real implementation, this would generate and download a report
    toast({
      title: 'Export Started',
      description: 'Your analytics report is being prepared for download.',
    });
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)  }M`;
    } if (num >= 1000) {
      return `${(num / 1000).toFixed(1)  }K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Monitor your website performance and user engagement</p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Google Analytics is not configured or enabled. Please configure it in the admin panel to view analytics reports.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Monitor your website performance and user engagement</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-32 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                      setSelectedPeriod('custom');
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Users Indicator */}
      <Card className="bg-linear-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold text-green-800">Real-time Users</p>
                <p className="text-sm text-green-600">Active users on your site right now</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-800">{reportData.realtimeUsers}</div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const value = metric.name === 'Avg. Session'
            ? formatDuration(metric.value)
            : metric.name === 'Bounce Rate'
            ? `${metric.value}%`
            : formatNumber(metric.value);

          return (
            <MetricCard
              key={index}
              title={metric.name}
              value={value}
              change={metric.change}
              changeLabel="vs last period"
              icon={IconComponent}
              color={metric.color}
            />
          );
        })}
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Sources</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages Bar Chart */}
            <BarChart
              title="Top Pages"
              data={reportData.topPages.map(page => ({
                label: page.page,
                value: page.views,
              }))}
              height={300}
            />

            {/* Device Breakdown Pie Chart */}
            <PieChart
              title="Device Breakdown"
              data={reportData.deviceBreakdown.map(device => ({
                label: device.device,
                value: device.users,
              }))}
              size={250}
            />
          </div>

          {/* Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChart
              title="Traffic Sources"
              data={reportData.trafficSources.map(source => ({
                label: source.source,
                value: source.visitors,
              }))}
              size={250}
            />

            {/* Page Views Trend (Mock Data) */}
            <AreaChart
              title="Page Views Trend"
              data={[
                { label: 'Day 1', value: 1200, date: 'Aug 1' },
                { label: 'Day 2', value: 1350, date: 'Aug 2' },
                { label: 'Day 3', value: 1180, date: 'Aug 3' },
                { label: 'Day 4', value: 1420, date: 'Aug 4' },
                { label: 'Day 5', value: 1380, date: 'Aug 5' },
                { label: 'Day 6', value: 1520, date: 'Aug 6' },
                { label: 'Day 7', value: 1650, date: 'Aug 7' },
              ]}
              height={250}
              color="#3b82f6"
            />
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${
                        source.source === 'Direct' ? 'bg-blue-500' :
                        source.source === 'Google Search' ? 'bg-red-500' :
                        source.source === 'Social Media' ? 'bg-pink-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{source.source}</p>
                        <p className="text-sm text-gray-500">{source.percentage}% of total traffic</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(source.visitors)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              User behavior analytics show how visitors interact with your site, including time spent, pages visited, and engagement patterns.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.pageViews)}</p>
                <p className="text-sm text-gray-600">Total Page Views</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{formatNumber(reportData.uniqueVisitors)}</p>
                <p className="text-sm text-gray-600">Unique Visitors</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{formatDuration(reportData.avgSessionDuration)}</p>
                <p className="text-sm text-gray-600">Avg. Session Duration</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.conversionFunnel.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{step.step}</span>
                        <span className="text-sm text-gray-500">{step.conversion}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-linear-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 w-[${Math.round(
                            step.conversion,
                          )}%]`}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right min-w-20">
                      <p className="font-semibold">{formatNumber(step.users)}</p>
                      <p className="text-xs text-gray-500">users</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReportsDashboard;