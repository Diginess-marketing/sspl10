import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, LogOut, Users, UserCheck, CalendarCheck, RefreshCw } from 'lucide-react';
import { RegistrationWorkflowTab, TrialsSectionTab, TrialsAllocatedTab } from '@/components/admin/workflow';

const TrialsWorkflow = () => {
  console.log('🏏 TrialsWorkflow page rendering');

  const { user, userRole, signOut, loading } = useAuth();
  const [forceShow, setForceShow] = useState(false);
  const [activeTab, setActiveTab] = useState('registrations');
  const [refreshKey, setRefreshKey] = useState(0);

  console.log('🏏 Page state:', { hasUser: !!user, userRole, loading, activeTab });

  // Force show after 5 seconds if loading is stuck (increased timeout)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('⚠️ Auth loading timeout - forcing page display');
        setForceShow(true);
      }
    }, 5000); // Increased from 2s to 5s
    return () => clearTimeout(timer);
  }, [loading]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Show loading only if not forced and still loading
  if (loading && !forceShow) {
    console.log('🏏 Showing loading screen...');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-xl">Loading authentication...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show login prompt (including forceShow cases without user)
  if (!user) {
    console.log('🏏 No user - showing login prompt');
    console.log('🏏 Auth state details:', { user, loading, userRole, forceShow });
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Authentication Required</h2>
          <p className="text-slate-600 mb-6">Please log in to access the Trials Workflow Management system.</p>
          <div className="space-y-3">
            <Link to="/auth" state={{ returnUrl: '/trials-workflow' }}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                Login to Continue
              </Button>
            </Link>
            <div className="text-xs text-slate-400 my-2">or</div>
            <Link to="/admin/login">
              <Button variant="outline" className="w-full border-slate-300">
                Admin Login
              </Button>
            </Link>
          </div>
          <Link to="/" className="block mt-4 text-sm text-slate-500 hover:text-slate-700">
            ← Back to Home
          </Link>
          <div className="mt-4 p-3 bg-slate-100 rounded text-xs text-left text-slate-600">
            <strong>Debug Info:</strong><br />
            Loading: {loading.toString()}<br />
            User: {(user as any)?.email || 'null'}<br />
            Role: {userRole || 'null'}
          </div>
          <Button
            onClick={() => {
              console.log('🔄 Emergency auth clear triggered');
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/auth';
            }}
            variant="destructive"
            size="sm"
            className="mt-3 w-full text-xs"
          >
            Emergency: Clear Auth & Reload
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated - show main content
  console.log('🏏 User authenticated - showing main content');

  // Main content
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-300" />
            <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-yellow-500" />
              Trials Workflow Management
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-slate-600">{user.email}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                  {userRole || 'user'}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-slate-600 hover:bg-slate-100">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="registrations"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Registrations</span>
            </TabsTrigger>
            <TabsTrigger
              value="trials-section"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Trials Section</span>
            </TabsTrigger>
            <TabsTrigger
              value="allocated"
              className="flex items-center gap-2 data-[state=active]:bg-sport-orange data-[state=active]:text-black"
            >
              <CalendarCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Trials Allocated</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="mt-0">
            <RegistrationWorkflowTab key={`reg-${refreshKey}`} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="trials-section" className="mt-0">
            <TrialsSectionTab key={`trials-${refreshKey}`} onRefresh={handleRefresh} />
          </TabsContent>

          <TabsContent value="allocated" className="mt-0">
            <TrialsAllocatedTab key={`alloc-${refreshKey}`} onRefresh={handleRefresh} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          SSPLT10 Trials Workflow Management System
        </div>
      </footer>
    </div>
  );
};

export default TrialsWorkflow;
