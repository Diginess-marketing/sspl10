import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/mui-theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { lazyWithTimeout } from '@/utils/lazyWithTimeout';
import { HelmetProvider } from 'react-helmet-async';
import DynamicThemeProvider from './components/DynamicThemeProvider';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingSpinner, CardSkeleton } from './components/ui/enhanced-loading';
import BackgroundWrapper from './components/BackgroundWrapper';
import CricketPageLoader from './components/CricketPageLoader';
import NotificationSystem from './components/NotificationSystem';
import RegistrationAnnouncement from './components/RegistrationAnnouncement';
import GullyToGloryAnnouncement from './components/GullyToGloryAnnouncement';
import ExitIntentPopup from './components/ExitIntentPopup';
import GoogleAnalytics4 from './components/GoogleAnalytics4';
import GlobalSchema from './components/SEO/GlobalSchema';
import useGA4PageTracking from './hooks/useGA4PageTracking';
import useWebVitals from './hooks/useWebVitals';
import Home from './pages/Index';

import { Layout } from './components/layout/MainLayout';

// Lazy load pages for code splitting
const Register = lazy(() => import('./pages/Register'));
const SelectorRegistration = lazy(() => import('./pages/SelectorRegistration'));
const CampaignDashboard = lazy(() => import('./pages/CampaignDashboard'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const QRScan = lazy(() => import('./pages/QRScan'));
const ErrorHandlingTest = lazy(() => import('./components/ErrorHandlingTest'));
const RegistrationSuccess = lazy(() => import('./pages/RegistrationSuccess'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Enquiry = lazy(() => import('./pages/Enquiry'));
const TermsAndConditions = lazy(() => import('./pages/terms-and-conditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const CancellationRefundPolicy = lazy(() => import('./pages/CancellationRefundPolicy'));
const DugoutCodeOfConduct = lazy(() => import('./pages/DugoutCodeOfConduct'));
const Matches = lazy(() => import('./pages/Matches'));
const PointsTable = lazy(() => import('./pages/PointsTable'));
const MatchCenterPage = lazy(() => import('./pages/MatchCenter'));
const StatsPage = lazy(() => import('./pages/Stats'));
const NewsPage = lazy(() => import('./pages/News'));
const NewsArticlePage = lazy(() => import('./pages/NewsArticle'));
const VideosPage = lazy(() => import('./pages/Videos'));
const Teams = lazy(() => import('./pages/Teams'));
const TeamDetails = lazy(() => import("./pages/TeamDetails"));
const Players = lazy(() => import('./pages/Players'));
const ResultLookupPage = lazy(() => import('./pages/ResultLookup'));
const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const GA4Analytics = lazy(() => import('./pages/GA4Analytics'));
const GA4AnalyticsTest = lazy(() => import('./pages/GA4AnalyticsTest'));
const CommercialGuidelines = lazy(() => import('./pages/CommercialGuidelines')); // Added Commercial Guidelines Page
const ArticlesAndBlogs = lazy(() => import('./pages/ArticlesAndBlogs'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const TournamentOrganizerRegistrationPage = lazy(() => import('./pages/TournamentOrganizerRegistrationPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
// const ChatPage = lazy(() => import('./pages/ChatPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));

const AuctionPage = lazy(() => import('./pages/AuctionPage'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));

import TrialsWorkflow from './pages/TrialsWorkflow';
import SimpleGA4Page from './pages/SimpleGA4';
import BottomNavigation from './components/BottomNavigation';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import FloatingRegistrationButton from './components/FloatingRegistrationButton';
import SSPLChatbot from './components/SSPLChatbot';
import CricketPageLoaderTest from './components/CricketPageLoaderTest';

import ScrollToTop from './components/ScrollToTop';

// Admin Panel Components (Lazy Loaded)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/UserManagement'));
const AdminTrials = lazy(() => import('./pages/admin/AdminTrialsWorkflow'));
const AdminAnalytics = lazy(() => import('./pages/admin/AnalyticsViewer'));
const AdminSettings = lazy(() => import('./pages/admin/SettingsPage'));
const AdminSelectors = lazy(() => import('./pages/admin/SelectorManagement'));
const AdminOrganizers = lazy(() => import('./pages/admin/OrganizerManagement'));
const AdminCertificateLookup = lazy(() => import('./pages/admin/AdminCertificateLookup'));
const AdminSelectionStatus = lazy(() => import('./pages/admin/AdminSelectionStatus'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminWhatsApp = lazy(() => import('./pages/admin/WhatsAppMarketing'));
const AdminRazorpay = lazy(() => import('./pages/admin/RazorpayDashboard'));
const AdminRoute = lazy(() => import('./components/admin/AdminRoute'));

// Enhanced loading component for Suspense fallback
const PageLoader = () => (
  <CricketPageLoader
    message="Loading cricket action..."
    size="lg"
    showStadium={true}
  />
);

// Error fallback component for lazy loading errors
const LazyErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="max-w-md mx-auto text-center space-y-4">
      <div className="text-red-600 text-6xl">⚠️</div>
      <h1 className="text-2xl font-bold text-red-800">Loading Error</h1>
      <p className="text-gray-600">Failed to load the page. This might be due to a network issue.</p>
      <div className="space-y-2">
        <button
          onClick={retry}
          className="w-full bg-cricket-blue text-white px-6 py-2 rounded-lg hover:bg-cricket-dark-blue transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 2,
      networkMode: 'online',
    },
  },
});

// Route Preloader Component
const RoutePreloader = () => {
  const location = useLocation();

  useEffect(() => {
    // Preload critical routes on user interaction
    const preloadCriticalRoutes = () => {
      // Preload register page when user hovers over registration buttons
      const preloadRegister = () => import('./pages/Register');
      const preloadAuth = () => import('./pages/AuthPage');

      // Preload heavy pages on idle time - deferred more aggressively to improve FCP
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        // Preload teams pages during idle time
        import('./pages/Teams');
        import('./pages/Players');
      } else {
        setTimeout(() => {
          import('./pages/Teams');
          import('./pages/Players');
        }, 5000);
      }

      // Add event listeners for preloading on interaction
      const handleMouseEnter = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // Ensure target is an element with matches method
        if (target && typeof target.matches === 'function') {
          if (target.matches('[href="/register"], [data-preload="register"]')) {
            preloadRegister();
          }
          if (target.matches('[href="/auth"], [data-preload="auth"]')) {
            preloadAuth();
          }
        }
      };

      document.addEventListener('mouseenter', handleMouseEnter, true);

      return () => {
        document.removeEventListener('mouseenter', handleMouseEnter, true);
      };
    };

    preloadCriticalRoutes();
  }, [location.pathname]);

  return null;
};

// GA4 Page Tracking Component - Tracks pageviews on route changes
const GAPageTracker = () => {
  useGA4PageTracking(import.meta.env.VITE_GA4_ID, {
    debug: import.meta.env.VITE_GA_DEBUG === 'true',
    trackingDelay: 100, // Small delay to allow page title updates
  });
  return null;
};

// Web Vitals Tracker Component - Tracks Core Web Vitals (LCP, CLS, INP)
const WebVitalsTracker = () => {
  useWebVitals({
    debug: import.meta.env.VITE_GA_DEBUG === 'true',
    productionOnly: false, // Monitor in all environments
    onMetric: (metric) => {
      // Send to analytics but don't log to console to reduce noise
      // Metrics are tracked via GA4 automatically
    },
  });
  return null;
};


// Wrapper component to conditionally show Gully announcement (not on /register page)
const GullyAnnouncementWrapper = ({
  showGullyAnnouncement,
  onClose
}: {
  showGullyAnnouncement: boolean;
  onClose: () => void
}) => {
  const location = useLocation();

  // Don't show on /register page
  if (location.pathname === '/register') {
    return null;
  }

  if (!showGullyAnnouncement) {
    return null;
  }

  return <GullyToGloryAnnouncement onClose={onClose} />;
};

// Bridge component to handle the Android App's "Profile" button
const AppProfileBridge = () => {
  const { user } = useAuth();
  return <Navigate to={user ? "/dashboard" : "/auth"} replace />;
};

const App = () => {
  console.log('🚀 App component rendering - GA4 routes should be available');
  const [showGullyAnnouncement, setShowGullyAnnouncement] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsChatbotOpen(true);
    };

    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => {
      window.removeEventListener('open-chatbot', handleOpenChatbot);
    };
  }, []);

  const handleCloseGullyAnnouncement = () => {
    setShowGullyAnnouncement(false);
    sessionStorage.setItem('gully-announcement-seen', 'true');
  };

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <DynamicThemeProvider>
              <AuthProvider>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <Toaster />
                  <Sonner />
                  {/* Google Analytics 4 - Injects via react-helmet-async */}
                  <GoogleAnalytics4 ga4Id={import.meta.env.VITE_GA4_ID} />
                  {/* Global SEO Schema */}
                  <GlobalSchema />
                  {/* Skip to main content link for accessibility */}
                  <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-sport-orange text-white px-4 py-2 rounded-md z-50 font-semibold text-[length:var(--brand-fs-body)] focus:outline-none focus:ring-2 focus:ring-sport-orange focus:ring-offset-2"
                  >
                    Skip to main content
                  </a>

                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true,
                    }}
                  >
                    <ScrollToTop />
                    <GAPageTracker />
                    <WebVitalsTracker />
                    <RoutePreloader />
                    <BackgroundWrapper>
                      <Suspense fallback={<PageLoader />}>
                        <ErrorBoundary fallback={<LazyErrorFallback error={new Error('Page Loading Error')} retry={() => window.location.reload()} />}>
                          <Routes>
                            <Route element={<Layout />}>
                              {/* Home Page Route */}
                              <Route path="/" element={<Home />} />

                              {/* Standard Public Pages */}
                              <Route path="/matches" element={<Matches />} />
                              <Route path="/points-table" element={<PointsTable />} />
                              <Route path="/match/:id" element={<MatchCenterPage />} />
                              <Route path="/stats" element={<StatsPage />} />
                              <Route path="/videos" element={<VideosPage />} />
                              <Route path="/trial-results" element={<ResultLookupPage />} />
                              <Route path="/about-us" element={<AboutUs />} />
                              <Route path="/how-it-works" element={<HowItWorks />} />
                              <Route path="/enquiry" element={<Enquiry />} />
                              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                              <Route path="/cancellation-refund-policy" element={<CancellationRefundPolicy />} />
                              <Route path="/dugout-code-of-conduct" element={<DugoutCodeOfConduct />} />
                              <Route path="/commercial-guidelines" element={<CommercialGuidelines />} />
                              <Route path="/teams" element={<Teams />} />
                              <Route path="/teams/:teamId" element={<TeamDetails />} />
                              {/* Players route disabled - uncomment when ready to enable */}
                              {/* <Route path="/players" element={<Players />} /> */}
                              <Route path="/articles-blogs" element={<ArticlesAndBlogs />} />
                              <Route path="/blog" element={<ArticlesAndBlogs />} /> {/* SEO friendly alias */}
                              <Route path="/articles-blogs/:slug" element={<BlogPost />} />
                              <Route path="/blog/:slug" element={<BlogPost />} />
                              <Route path="/faqs" element={<FAQPage />} />
{/* <Route path="/chat" element={<ChatPage />} /> */}


                              <Route path="/auction" element={<AuctionPage />} />
                              <Route path="/players/:playerId" element={<PlayerProfile />} />
                              <Route path="/dashboard" element={<UserDashboard />} />
                              <Route path="/app-profile" element={<AppProfileBridge />} />

                              {/* QR Code Scan Route - maybe needs layout? */}
                              <Route path="/qr/:code" element={<QRScan />} />

                              {/* Registration Routes - Now under Main Layout for Header/Footer consistency */}
                              <Route path="/auth" element={<AuthPage />} />
                              <Route path="/register" element={<Register />} />
                              <Route path="/register-selector" element={<SelectorRegistration />} />
                              <Route path="/registration/success" element={<RegistrationSuccess />} />

                              {/* Catch-all Route for dynamic pages and 404 Page */}
                              <Route path="*" element={<NotFound />} />
                            </Route>

                            {/* Standalone Landing Pages */}
                            {/* Standalone Landing Pages - Disabled and redirected to home */}
                            <Route path="/tournament-organizer-registration" element={<TournamentOrganizerRegistrationPage />} />


                            {/* Campaign Analytics Dashboard */}
                            <Route path="/campaign-analytics" element={<CampaignDashboard />} />

                            {/* Admin Panel Routes */}
                            <Route
                              path="/admin"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminDashboard />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/users"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminUsers />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/selectors"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminSelectors />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/organizers"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminOrganizers />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/trials"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminTrials />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/analytics"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminAnalytics />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/settings"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminSettings />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/selection-status"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminSelectionStatus />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/reports"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminReports />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/whatsapp"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminWhatsApp />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                            <Route
                              path="/admin/razorpay"
                              element={
                                <AdminRoute>
                                  <AdminLayout>
                                    <AdminRazorpay />
                                  </AdminLayout>
                                </AdminRoute>
                              }
                            />
                          </Routes>

                          {/* Bottom Navigation for Android PWA - Removed to avoid conflicts with native bottom nav and to remove About Us */}

                          {/* Floating WhatsApp Button */}
                          <FloatingWhatsAppButton />

                          {/* Floating Registration FAB */}
                          <FloatingRegistrationButton />

                          <SSPLChatbot
                            isOpen={isChatbotOpen}
                            onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
                          />



                          {/* Enhanced Popup Systems */}
                          <NotificationSystem
                            position="top-right"
                            maxNotifications={5}
                            enableClickOutside={true}
                            enableEscapeKey={true}
                          />

                          {/* Gully to Glory Announcement - HIDDEN
                          <GullyAnnouncementWrapper
                            showGullyAnnouncement={showGullyAnnouncement}
                            onClose={handleCloseGullyAnnouncement}
                          />
                          */}

                          {/* Exit Intent Popup - DISABLED */}
                          <ExitIntentPopup
                            isEnabled={false}
                            triggerDelay={45000} // Show after 45 seconds if no exit intent
                            showOnce={true}
                            title="Wait! Don't Miss Out on Cricket Trials!"
                            message="Get exclusive cricket training tips and be the first to know about trial announcements."
                            buttonText="Get Cricket Updates"
                            buttonAction={() => {
                              // Track the action
                              if (typeof window !== 'undefined' && (window as any).gtag) {
                                (window as any).gtag('event', 'exit_intent_registration', {
                                  event_category: 'engagement',
                                  event_label: 'popup_registration_click',
                                });
                              }
                              window.location.href = '/register';
                            }}
                          />
                        </ErrorBoundary>
                      </Suspense>
                    </BackgroundWrapper>
                  </BrowserRouter>
                </ThemeProvider>
              </AuthProvider>
            </DynamicThemeProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary >
  );
};

export default App;
