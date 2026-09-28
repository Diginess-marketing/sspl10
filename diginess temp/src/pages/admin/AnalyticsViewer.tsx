import { Suspense, lazy, useState } from 'react';
import { PageHeader } from '@/components/admin/ui';

// Lazy load the existing GA4 Analytics page component to reuse it
const GA4Analytics = lazy(() => import('@/pages/GA4Analytics'));
const CampaignDashboard = lazy(() => import('@/pages/CampaignDashboard'));

const TABS = [
    { value: 'ga4', label: 'Google Analytics 4', title: 'Traffic & engagement', description: 'Real-time data from Google Analytics 4' },
    { value: 'campaign', label: 'Campaigns', title: 'Campaign performance', description: 'Ad campaign tracking and conversions' },
] as const;

const PanelSkeleton = () => (
    <div className="space-y-3 p-5" aria-busy="true">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--brand-sky)]" />)}
    </div>
);

const AnalyticsViewer = () => {
    const [tab, setTab] = useState<(typeof TABS)[number]['value']>('ga4');
    const active = TABS.find((t) => t.value === tab)!;

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Insights"
                title={<>Platform <em>analytics</em></>}
                description="Track user engagement and system performance."
            />

            <div className="flex flex-wrap gap-2" role="tablist">
                {TABS.map((t) => (
                    <button key={t.value} type="button" role="tab" aria-selected={tab === t.value} className="admin-chip" data-active={tab === t.value} onClick={() => setTab(t.value)}>
                        {t.label}
                    </button>
                ))}
            </div>

            <section className="admin-card min-w-0 overflow-hidden">
                <header className="border-b border-[var(--admin-line)] p-5">
                    <h2 className="admin-h3">{active.title}</h2>
                    <p className="admin-muted mt-1">{active.description}</p>
                </header>
                <div className="max-w-full overflow-x-auto">
                    <Suspense fallback={<PanelSkeleton />}>
                        {tab === 'ga4' ? (
                            <div className="admin-analytics-wrapper [&>div]:p-0 [&>div]:shadow-none"><GA4Analytics /></div>
                        ) : (
                            <div className="admin-analytics-wrapper [&>div]:p-5 [&>div]:shadow-none"><CampaignDashboard /></div>
                        )}
                    </Suspense>
                </div>
            </section>
        </div>
    );
};

export default AnalyticsViewer;
