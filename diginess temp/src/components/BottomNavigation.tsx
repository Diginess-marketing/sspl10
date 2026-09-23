/**
 * Bottom Navigation Component for Android PWA
 * 
 * This component provides mobile navigation for the Android WebView environment
 * with three main navigation options: Gallery, AboutUs, and ContactUs
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Info, Phone } from 'lucide-react';
import { googleAnalytics } from '@/utils/googleAnalytics';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  ariaLabel: string;
}

const navigationItems: NavigationItem[] = [
  // {
  //   id: 'trialresults',
  //   label: 'Results',
  //   icon: BarChart3,
  //   path: '/trial-results',
  //   ariaLabel: 'Navigate to Trial Results',
  // },
  {
    id: 'aboutus',
    label: 'AboutUs',
    icon: Info,
    path: '/about-us',
    ariaLabel: 'Navigate to About Us',
  },
  {
    id: 'contactus',
    label: 'ContactUs',
    icon: Phone,
    path: '/enquiry',
    ariaLabel: 'Navigate to Contact Us',
  },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect if running in Android WebView
  const isAndroidWebView = /wv/.test(navigator.userAgent) && /Android/.test(navigator.userAgent);

  useEffect(() => {
    // Component mounted - no debug logging needed
  }, []);

  const handleNavigation = (item: NavigationItem) => {
    // Track navigation analytics
    googleAnalytics.trackButtonClick(
      `bottom_nav_${item.id}`,
      'android_pwa_bottom_navigation',
    );

    navigate(item.path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Only render if in Android WebView
  if (!isAndroidWebView) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="Bottom navigation for Android PWA"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
    >
      <div className="flex items-center justify-around py-2 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[70px] touch-target relative',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isActive
                  ? 'text-sspl-tennis-ball-green bg-sspl-navy/80'
                  : 'text-gray-600 hover:text-sspl-tennis-ball-green hover:bg-gray-50',
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 mb-1 transition-all duration-200',
                  isActive ? 'text-sspl-tennis-ball-green scale-110' : 'text-gray-600',
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-sm font-body font-medium leading-none transition-all duration-200',
                  isActive ? 'text-sspl-tennis-ball-green font-semibold' : 'text-gray-600',
                )}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-sspl-tennis-ball-green rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
};

export default BottomNavigation;