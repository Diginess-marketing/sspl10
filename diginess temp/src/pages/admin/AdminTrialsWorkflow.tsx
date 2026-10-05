import { useState, useCallback, useEffect } from 'react';
import { Users, UserCheck, CalendarCheck, BarChart3, UploadCloud, FileText, Layers, RefreshCw } from 'lucide-react';
import { RegistrationWorkflowTab, TrialsSectionTab, TrialsAllocatedTab } from '@/components/admin/workflow';
import { TrialLevelsTab } from '@/components/admin/workflow/TrialLevelsTab';
import { TrialsAnalyticsReport } from '@/components/admin/workflow/TrialsAnalyticsReport';
import { ImportVerificationTab } from '@/components/admin/workflow/ImportVerificationTab';
import { TrialsReportViewer } from '@/components/admin/workflow/TrialsReportViewer';
import { PageHeader, ActionButton } from '@/components/admin/ui';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import type { WorkflowDashboardStats } from '@/types/workflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const STEPS = [
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
    { value: 'registrations', label: 'Registrations', icon: Users, count: 'total_registrations' as const },
    { value: 'trials-section', label: 'Trials section', icon: UserCheck, count: 'in_trials_section' as const },
    { value: 'allocated', label: 'Allocated', icon: CalendarCheck, count: 'trials_allocated' as const },
    { value: 'levels', label: 'Levels L1-L5', icon: Layers },
    { value: 'import', label: 'Import data', icon: UploadCloud },
];

const AdminTrialsWorkflow = () => {
    const [activeTab, setActiveTab] = useState('registrations');
    const [refreshKey, setRefreshKey] = useState(0);
    const [reportOpen, setReportOpen] = useState(false);
    const [stats, setStats] = useState<WorkflowDashboardStats | null>(null);
    const { getDashboardStats } = usePlayerWorkflow();

    useEffect(() => {
        getDashboardStats().then(setStats);
    }, [getDashboardStats, refreshKey]);

    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Players & trials"
                title={<>Trials <em>workflow</em></>}
                description="Move players from registration to trials, record attendance and results."
                actions={(
                    <>
                        <ActionButton variant="ghost" icon={RefreshCw} onClick={handleRefresh}>Refresh</ActionButton>
                        <ActionButton variant="primary" icon={FileText} onClick={() => setReportOpen(true)}>Reports viewer</ActionButton>
                    </>
                )}
            />

            {/* Stage stepper: acts as the tab bar and shows live counts */}
            <div className="admin-stepper" role="tablist" aria-label="Workflow stages">
                {STEPS.map((step, i) => {
                    const count = step.count && stats ? Number(stats[step.count]) : null;
                    return (
                        <button
                            key={step.value}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === step.value}
                            data-active={activeTab === step.value}
                            className="admin-step"
                            onClick={() => setActiveTab(step.value)}
                        >
                            <span className="admin-step__dot"><step.icon className="h-4 w-4" /></span>
                            <span className="min-w-0">
                                <span className="admin-eyebrow !mb-0 block !text-inherit opacity-70">Step {i + 1}</span>
                                <span className="block truncate font-[family-name:var(--brand-font-display)] font-bold uppercase tracking-[var(--brand-ls-btn)]">{step.label}</span>
                            </span>
                            {count !== null && <span className="admin-badge admin-badge--info ml-auto !p-0 !px-2.5 before:hidden">{count}</span>}
                        </button>
                    );
                })}
            </div>

            <div role="tabpanel" className="min-h-[480px]">
                {activeTab === 'analytics' && <TrialsAnalyticsReport key={`analytics-${refreshKey}`} />}
                {activeTab === 'registrations' && <RegistrationWorkflowTab key={`reg-${refreshKey}`} onRefresh={handleRefresh} />}
                {activeTab === 'trials-section' && <TrialsSectionTab key={`trials-${refreshKey}`} onRefresh={handleRefresh} />}
                {activeTab === 'allocated' && <TrialsAllocatedTab key={`alloc-${refreshKey}`} onRefresh={handleRefresh} />}
                {activeTab === 'levels' && <TrialLevelsTab key={`levels-${refreshKey}`} />}
                {activeTab === 'import' && <ImportVerificationTab key={`import-${refreshKey}`} />}
            </div>

            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogContent className="admin-shell h-[90vh] w-[1200px] max-w-[95vw] overflow-y-auto rounded-[18px] border-[var(--admin-line)] bg-white">
                    <DialogHeader>
                        <DialogTitle className="admin-title !text-[length:var(--brand-fs-h3)]">Trials assessment &amp; reporting</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <TrialsReportViewer />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminTrialsWorkflow;
