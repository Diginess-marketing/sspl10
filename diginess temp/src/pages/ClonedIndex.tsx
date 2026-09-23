import LeagueHighlightsSection from '@/components/LeagueHighlightsSection';
import SSPLAnthemSection from '@/components/SSPLAnthemSection';
import SSPLHighlightsSection from '@/components/SSPLHighlightsSection';
import HeroSection from '@/components/HeroSection';
import RegistrationSection from '@/components/RegistrationSection';
import SocialMediaButtons from '@/components/SocialMediaButtons';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { SSPLOnboarding } from '@/components/ui/enhanced-onboarding';

const ClonedIndex = () => {
  const { user, userRole, loading, roleLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new visitors (first-time users)
  useEffect(() => {
    const hasSeenOnboarding = sessionStorage.getItem('sspl-onboarding-seen');
    const isFirstVisit = !hasSeenOnboarding;

    if (isFirstVisit && !loading) {
      // Delay onboarding to let the page load first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('sspl-onboarding-seen', 'true');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    sessionStorage.setItem('sspl-onboarding-seen', 'true');
  };

  return (
    <div className="min-h-screen bg-background">



      <HeroSection />

      {/* <SelectorsRequiredSection /> */}

      {/* <ImageCarouselSection /> */}

      <LeagueHighlightsSection />

      <SSPLAnthemSection />

      <SSPLHighlightsSection />

      {/* <SSPLGallerySection /> */}

      <RegistrationSection />


      {/* Social Media Floating Buttons */}
      <SocialMediaButtons />

      {/* Onboarding for New Visitors */}
      {showOnboarding && (
        <SSPLOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

    </div>
  );
};

export default ClonedIndex;