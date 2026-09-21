import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Trophy,
  RefreshCw,
  Mail,
  AlertCircle,
  FileText
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { TrialsReportViewer } from './workflow/TrialsReportViewer';
import { usePlayerWorkflow } from '@/hooks/usePlayerWorkflow';
import type { WorkflowDashboardStats } from '@/types/workflow';
import { 
  RegistrationWorkflowTab, 
  TrialsSectionTab, 
  TrialsAllocatedTab,
  TrialLevelView,
  TrialAnalyticsDashboard
} from './workflow';

const TrialsWorkflowTab = () => {
  const [activeTab, setActiveTab] = useState('registrations');
  const [stats, setStats] = useState<WorkflowDashboardStats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const { getDashboardStats, loading, error } = usePlayerWorkflow();

  const loadStats = useCallback(async () => {
    const data = await getDashboardStats();
    if (data) {
      setStats(data);
    }
  }, [getDashboardStats]);

  useEffect(() => {
    loadStats();
  }, [loadStats, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-cricket-blue flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Trials Workflow Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage player registration through trials allocation and selection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Reports Viewer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-amber-900 border-b pb-2">
                  <FileText className="w-5 h-5" />
                  Trials Assessment Reporting
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <TrialsReportViewer />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-cricket-blue text-cricket-blue hover:bg-cricket-blue hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-lg lg:text-xl font-bold">{stats?.total_registrations || 0}</div>
                <div className="text-xs opacity-90">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-lg lg:text-xl font-bold">{stats?.emails_sent || 0}</div>
                <div className="text-xs opacity-90">Emails Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-lg lg:text-xl font-bold">{stats?.in_trials_section || 0}</div>
                <div className="text-xs opacity-90">In Trials</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-lg lg:text-xl font-bold">{stats?.trials_allocated || 0}</div>
                <div className="text-xs opacity-90">Allocated</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-lg lg:text-xl font-bold">{stats?.attended || 0}</div>
                <div className="text-xs opacity-90">Attended</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-cricket-yellow to-yellow-500 text-cricket-blue">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 opacity-80" />
              <div>
                <div className="text-lg lg:text-xl font-bold">{stats?.selected || 0}</div>
                <div className="text-xs opacity-90">Selected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Registration Phase</p>
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid gap-1 bg-white border border-cricket-blue/20 p-1 rounded-lg">
              <TabsTrigger 
                value="registrations"
                className="flex items-center gap-2 data-[state=active]:bg-cricket-blue data-[state=active]:text-white"
              >
                <Users className="w-4 h-4" />
                <span>Verified Regs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="trials-section"
                className="flex items-center gap-2 data-[state=active]:bg-cricket-blue data-[state=active]:text-white"
              >
                <UserCheck className="w-4 h-4" />
                <span>Move to Trial System</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-2 ml-1 tracking-wider">Trial Progression System</p>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid gap-1 bg-white border border-cricket-blue/20 p-1 rounded-lg">
              <TabsTrigger value="level-1" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Level 1</TabsTrigger>
              <TabsTrigger value="level-2" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Level 2</TabsTrigger>
              <TabsTrigger value="level-3" className="data-[state=active]:bg-orange-700 data-[state=active]:text-white">Level 3</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Analytics</TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Reports
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="border-t border-slate-100 pt-2 opacity-50 hover:opacity-100 transition-opacity">
            <p className="text-[10px] font-semibold text-slate-400 uppercase mb-2 ml-1">Legacy Workflow</p>
            <TabsList className="bg-white border border-slate-200 p-1 rounded-lg scale-90 origin-left">
              <TabsTrigger value="trials-allocated" className="text-xs">Old Allocated View</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="registrations" className="mt-4">
          <RegistrationWorkflowTab key={`reg-${refreshKey}`} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="trials-section" className="mt-4">
          <TrialsSectionTab key={`trials-${refreshKey}`} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="trials-allocated" className="mt-4">
          <TrialsAllocatedTab key={`alloc-${refreshKey}`} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="level-1" className="mt-4">
          <TrialLevelView level={1} key={`l1-${refreshKey}`} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="level-2" className="mt-4">
          <TrialLevelView level={2} key={`l2-${refreshKey}`} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="level-3" className="mt-4">
          <TrialLevelView level={3} key={`l3-${refreshKey}`} onRefresh={handleRefresh} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <TrialAnalyticsDashboard key={`analytics-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card className="border-amber-100 shadow-sm bg-amber-50/10">
            <CardHeader className="bg-amber-500/5 border-b border-amber-100">
              <CardTitle className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Reports Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4">
                <TrialsReportViewer />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrialsWorkflowTab;
