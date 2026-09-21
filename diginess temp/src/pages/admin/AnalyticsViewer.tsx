import { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/enhanced-loading';

// Lazy load the existing GA4 Analytics page component to reuse it
const GA4Analytics = lazy(() => import('@/pages/GA4Analytics'));
const CampaignDashboard = lazy(() => import('@/pages/CampaignDashboard'));

const AnalyticsViewer = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Analytics</h1>
                    <p className="text-muted-foreground mt-1">Track user engagement and system performance.</p>
                </div>
            </div>

            <Tabs defaultValue="ga4" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="ga4">Google Analytics 4</TabsTrigger>
                    <TabsTrigger value="campaign">Campaigns</TabsTrigger>
                </TabsList>

                <TabsContent value="ga4" className="mt-6 space-y-4">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <CardTitle>Traffic & Engagement</CardTitle>
                            <CardDescription>Real-time data from Google Analytics 4</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Suspense fallback={<div className="p-12"><LoadingSpinner text="Loading Analytics..." /></div>}>
                                <div className="admin-analytics-wrapper [&>div]:p-0 [&>div]:shadow-none">
                                    {/* Passing embedded prop if the component supports it to hide headers */}
                                    <GA4Analytics />
                                </div>
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="campaign" className="mt-6 space-y-4">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <CardTitle>Campaign Performance</CardTitle>
                            <CardDescription>Ad campaign tracking and conversions</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Suspense fallback={<div className="p-12"><LoadingSpinner text="Loading Campaign Data..." /></div>}>
                                <div className="admin-analytics-wrapper [&>div]:p-6 [&>div]:shadow-none">
                                    <CampaignDashboard />
                                </div>
                            </Suspense>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AnalyticsViewer;
