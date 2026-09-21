import React, { useState } from 'react';
import CricketTrialsBanner from './CricketTrialsBanner';

/**
 * Example implementation of CricketTrialsBanner for homepage
 * This shows how to integrate the banner with state management
 */
const CricketTrialsBannerExample: React.FC = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const announcement = {
    title: 'Next Chennai Trials!',
    venue: 'Throttle Sports Academy, Manapakkam',
    date: 'Sunday, 28 September 2025',
    body: 'Calling all aspiring players waiting for their next big chance!',
    callout: "Players waiting — this one's for you",
    ctaText: 'Register Now',
  };

  const handleRegister = () => {
    // Navigate to registration page or open registration modal
    window.location.href = '/register';
  };

  const handleClose = () => {
    setIsBannerVisible(false);
  };

  // Don't render if banner is not visible
  if (!isBannerVisible) {
    return null;
  }

  return (
    <CricketTrialsBanner
      announcement={announcement}
      onRegister={handleRegister}
      onClose={handleClose}
      isVisible={isBannerVisible}
      showCloseButton={true}
      className="mb-8"
    />
  );
};

export default CricketTrialsBannerExample;