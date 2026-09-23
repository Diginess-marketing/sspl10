import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Moon,
  Sun,
  Monitor,
  Search,
  Bell,
  Heart,
  Trophy,
  Zap,
  CheckCircle,
  Info,
} from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';
import {
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} from './NotificationSystem';

const AdvancedFeaturesDemo = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);

  const demoNotifications = () => {
    showSuccessNotification(
      'Welcome to SSPL!',
      "You've successfully joined the cricket revolution!",
      4000,
    );

    setTimeout(() => {
      showInfoNotification(
        'Match Update',
        'Chennai Super Kings vs Bangalore Blasters starts in 30 minutes!',
        5000,
      );
    }, 1000);

    setTimeout(() => {
      showWarningNotification(
        'Weather Alert',
        'Heavy rain expected. Match might be delayed.',
        6000,
      );
    }, 2000);

    setTimeout(() => {
      showErrorNotification(
        'Connection Issue',
        'Unable to load live scores. Please check your internet connection.',
        7000,
      );
    }, 3000);
  };

  const toggleSkeleton = () => {
    setShowSkeleton(!showSkeleton);
    if (!showSkeleton) {
      showInfoNotification(
        'Loading Demo',
        'Showing skeleton screens for 3 seconds',
        3000,
      );
    }
  };

  return (
    <section className="py-12 lg:py-16 bg-linear-to-br from-cricket-light-blue/20 via-white to-cricket-mint/20 dark:from-cricket-charcoal dark:via-cricket-dark-blue dark:to-cricket-blue">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-12">
          <Badge className="bg-gradient-accent text-white mb-4 px-4 py-2 text-sm font-semibold">
            Advanced Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cricket-blue dark:text-white mb-4 drop-shadow-lg">
            Experience the Future
          </h2>
          <p className="text-lg text-cricket-charcoal dark:text-cricket-light-blue max-w-3xl mx-auto leading-relaxed">
            Discover cutting-edge features that enhance your cricket experience with dark mode,
            intelligent search, real-time notifications, and smooth loading states.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          {/* Dark Mode Feature */}
          <Card className="bg-white/80 dark:bg-cricket-charcoal/80 backdrop-blur-sm border-cricket-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-linear-to-r from-cricket-purple to-cricket-electric-blue rounded-full flex items-center justify-center mx-auto mb-3">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-cricket-blue dark:text-white text-lg">Dark Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-cricket-charcoal dark:text-cricket-light-blue text-sm">
                Switch between light, dark, and system themes for optimal viewing comfort.
              </p>
              <div className="flex justify-center gap-2">
                <div className="flex items-center gap-1 text-xs text-cricket-blue dark:text-cricket-light-blue">
                  <Sun className="w-3 h-3" />
                  <span>Light</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-cricket-purple">
                  <Moon className="w-3 h-3" />
                  <span>Dark</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-cricket-electric-blue">
                  <Monitor className="w-3 h-3" />
                  <span>Auto</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Search Feature */}
          <Card className="bg-white/80 dark:bg-cricket-charcoal/80 backdrop-blur-sm border-cricket-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-linear-to-r from-cricket-green to-cricket-teal rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-cricket-blue dark:text-white text-lg">Smart Search</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-cricket-charcoal dark:text-cricket-light-blue text-sm">
                Intelligent search with filters, autocomplete, and recent searches.
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                <Badge className="bg-cricket-blue/20 text-cricket-blue text-xs">Teams</Badge>
                <Badge className="bg-cricket-green/20 text-cricket-green text-xs">Players</Badge>
                <Badge className="bg-cricket-orange/20 text-cricket-orange text-xs">Matches</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notification System Feature */}
          <Card className="bg-white/80 dark:bg-cricket-charcoal/80 backdrop-blur-sm border-cricket-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-linear-to-r from-cricket-orange to-cricket-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-cricket-blue dark:text-white text-lg">Live Notifications</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-cricket-charcoal dark:text-cricket-light-blue text-sm">
                Real-time updates, match alerts, and interactive notifications.
              </p>
              <div className="flex justify-center gap-2">
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>Success</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Info className="w-3 h-3" />
                  <span>Info</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading States Feature */}
          <Card className="bg-white/80 dark:bg-cricket-charcoal/80 backdrop-blur-sm border-cricket-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-linear-to-r from-cricket-teal to-cricket-electric-blue rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-cricket-blue dark:text-white text-lg">Smart Loading</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-cricket-charcoal dark:text-cricket-light-blue text-sm">
                Beautiful skeleton screens and smooth loading transitions.
              </p>
              <div className="flex justify-center gap-2">
                <Badge className="bg-cricket-light-blue/20 text-cricket-blue text-xs">Skeleton</Badge>
                <Badge className="bg-cricket-purple/20 text-cricket-purple text-xs">Smooth</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Performance Feature */}
          <Card className="bg-white/80 dark:bg-cricket-charcoal/80 backdrop-blur-sm border-cricket-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-linear-to-r from-cricket-gold to-cricket-orange rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-cricket-blue dark:text-white text-lg">High Performance</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-cricket-charcoal dark:text-cricket-light-blue text-sm">
                Optimized for speed with lazy loading and efficient rendering.
              </p>
              <div className="flex justify-center gap-2">
                <Badge className="bg-green-500/20 text-green-600 text-xs">Fast</Badge>
                <Badge className="bg-blue-500/20 text-blue-600 text-xs">Optimized</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Feature */}
          <Card className="bg-white/80 dark:bg-cricket-charcoal/80 backdrop-blur-sm border-cricket-blue/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-linear-to-r from-cricket-red to-cricket-orange rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-cricket-blue dark:text-white text-lg">Inclusive Design</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-cricket-charcoal dark:text-cricket-light-blue text-sm">
                WCAG compliant with keyboard navigation and screen reader support.
              </p>
              <div className="flex justify-center gap-2">
                <Badge className="bg-cricket-green/20 text-cricket-green text-xs">WCAG</Badge>
                <Badge className="bg-cricket-blue/20 text-cricket-blue text-xs">A11y</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-linear-to-r from-cricket-blue via-cricket-electric-blue to-cricket-purple rounded-2xl p-6 lg:p-8 text-center text-white shadow-2xl">
          <h3 className="text-2xl lg:text-3xl font-bold mb-4 drop-shadow-lg">
            Try the Advanced Features
          </h3>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button
              onClick={demoNotifications}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 hover:scale-105 transition-all duration-300"
            >
              <Bell className="w-4 h-4 mr-2" />
              Demo Notifications
            </Button>

            <Button
              onClick={toggleSkeleton}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 hover:scale-105 transition-all duration-300"
            >
              <Zap className="w-4 h-4 mr-2" />
              {showSkeleton ? 'Hide' : 'Show'} Skeletons
            </Button>

            <Button
              onClick={() => showInfoNotification('Search Feature', 'Use the search bar in the header to find teams, players, and matches!', 4000)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 hover:scale-105 transition-all duration-300"
            >
              <Search className="w-4 h-4 mr-2" />
              Try Search
            </Button>
          </div>

          {/* Skeleton Demo */}
          {showSkeleton && (
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">Loading States Demo</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LoadingSkeleton type="card" />
                <LoadingSkeleton type="image" />
                <LoadingSkeleton type="text" count={3} />
              </div>
            </div>
          )}

          <p className="text-lg opacity-90 max-w-3xl mx-auto leading-relaxed">
            Experience the power of modern web technologies with smooth animations,
            intelligent interactions, and responsive design that works perfectly on all devices.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AdvancedFeaturesDemo;