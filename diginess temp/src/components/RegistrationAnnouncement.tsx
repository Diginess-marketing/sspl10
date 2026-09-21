import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RegistrationAnnouncement = () => {
  // DISABLED - Registration announcement is turned off
  return null;
  
  const [isVisible, setIsVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDelayed, setShowDelayed] = useState(false);

  // Handle ESC key to close popup
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isVisible) {
      setIsVisible(false);
    }
  }, [isVisible]);

  // Handle click outside to close popup
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    // Show announcement with delayed appearance (7 seconds)
    const delayTimer = setTimeout(() => {
      setShowDelayed(true);
    }, 7000); // 7 seconds delay for better user experience

    // Show announcement after delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000); // Additional 1 second delay after delayed flag

    // Cleanup timers on unmount
    return () => {
      clearTimeout(delayTimer);
      clearTimeout(showTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  // Add keyboard event listener
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, handleKeyDown]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      <div className="relative max-w-4xl mx-auto cursor-auto">
        {/* Close Button - More visible */}
        <Button
          onClick={handleClose}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-30 bg-red-600 hover:bg-red-700 text-white border border-white/30 rounded-full w-10 h-10 p-0 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Close announcement (Press ESC or click outside)"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Announcement Image */}
        <div className="relative rounded-lg overflow-hidden shadow-2xl bg-white">
          {imageError ? (
            <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-500">
              <div className="text-center">
                <p className="text-lg font-semibold">Image not found</p>
                <p className="text-sm">Please check the image path</p>
              </div>
            </div>
          ) : (
            <img
              src="/Registration open 1.png"
              alt="Register now for cricket trials - click to learn more"
              className="w-full h-auto object-contain max-h-[60vh] md:max-h-[70vh] bg-white rounded-lg"
              onLoad={handleImageLoad}
              onError={handleImageError}
              onClick={() => window.location.href = '/register'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationAnnouncement;