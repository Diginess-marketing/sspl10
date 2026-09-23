import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, CalendarCheck, BarChart3, UploadCloud, FileText } from 'lucide-react';
import { RegistrationWorkflowTab, TrialsSectionTab, TrialsAllocatedTab } from '@/components/admin/workflow';
import { TrialsAnalyticsReport } from '@/components/admin/workflow/TrialsAnalyticsReport';
import { ImportVerificationTab } from '@/components/admin/workflow/ImportVerificationTab';
import { TrialsReportViewer } from '@/components/admin/workflow/TrialsReportViewer';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const AdminTrialsWorkflow = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trials Workflow</h1>
                    <p className="text-muted-foreground mt-1">Manage player registrations and trial process.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-lg shadow-amber-600/20">
                            <FileText className="w-4 h-4" />
                            <span>Reports Viewer</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="w-6 h-6 text-amber-600" />
                                Trials Assessment & Reporting
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <TrialsReportViewer />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-slate-100 px-4 pt-2">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                            <TabsTrigger
                                value="analytics"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2 py-3 gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>Analytics</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="registrations"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-2 py-3 gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <Users className="w-4 h-4" />
                                <span>Registrations</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="trials-section"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-2 py-3 gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <UserCheck className="w-4 h-4" />
                                <span>Trials Section</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="allocated"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-sport-orange data-[state=active]:text-lime-700 rounded-none px-2 py-3 gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <CalendarCheck className="w-4 h-4" />
                                <span>Trials Allocated</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="import"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 rounded-none px-2 py-3 gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <UploadCloud className="w-4 h-4" />
                                <span>Import Data</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 bg-slate-50/30 min-h-[500px]">
                        <TabsContent value="analytics" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <TrialsAnalyticsReport key={`analytics-${refreshKey}`} />
                        </TabsContent>

                        <TabsContent value="registrations" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <RegistrationWorkflowTab key={`reg-${refreshKey}`} onRefresh={handleRefresh} />
                        </TabsContent>

                        <TabsContent value="trials-section" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <TrialsSectionTab key={`trials-${refreshKey}`} onRefresh={handleRefresh} />
                        </TabsContent>

                        <TabsContent value="allocated" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <TrialsAllocatedTab key={`alloc-${refreshKey}`} onRefresh={handleRefresh} />
                        </TabsContent>

                        <TabsContent value="import" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                            <ImportVerificationTab key={`import-${refreshKey}`} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminTrialsWorkflow;
