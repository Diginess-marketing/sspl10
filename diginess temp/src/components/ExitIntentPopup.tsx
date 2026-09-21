import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExitIntentDetector } from '@/utils/exitIntentDetector';

interface ExitIntentPopupProps {
  isEnabled?: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  buttonAction?: () => void;
  closeAction?: () => void;
  triggerDelay?: number; // Delay before popup appears (in ms)
  showOnce?: boolean;
  backgroundImage?: string;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
  isEnabled = true,
  title = "Wait! Don't Miss Out!",
  message = 'Get exclusive cricket training tips and early access to our trial announcements.',
  buttonText = 'Get Updates',
  buttonAction = () => window.location.href = '/register',
  closeAction = () => {},
  triggerDelay = 30000, // 30 seconds
  showOnce = true,
  backgroundImage = '/exit-intent-bg.jpg',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Handle close popup
  const handleClose = () => {
    setIsVisible(false);
    setHasShown(true);
    closeAction();
  };

  // Handle button click
  const handleButtonClick = () => {
    buttonAction();
  };

  // Exit intent detection
  const { setEnabled } = useExitIntentDetector({
    threshold: 50,
    maxWaitTime: triggerDelay,
    once: showOnce,
    enabled: isEnabled && !hasShown,
    onExitIntent: () => {
      setIsVisible(true);
      setHasShown(true);
    },
  });

  // Control detection based on popup state
  useEffect(() => {
    setEnabled(isEnabled && !hasShown);
  }, [isEnabled, hasShown, setEnabled]);

  // Auto-hide after delay if not interacted with
  useEffect(() => {
    if (isVisible) {
      const autoHideTimer = setTimeout(() => {
        handleClose();
      }, 15000); // Auto-hide after 15 seconds

      return () => clearTimeout(autoHideTimer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform animate-in slide-in-from-bottom-4 duration-500">
        {/* Background Image with Overlay */}
        <div className="relative h-48 bg-linear-to-br from-orange-500 via-red-500 to-pink-500">
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt="Cricket action"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Close Button */}
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white border border-white/20 rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110"
            aria-label="Close popup (Press ESC)"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Content Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-white/90 mb-2">
              <Gift className="w-5 h-5" />
              <span className="text-sm font-medium">Exclusive Offer</span>
              <Clock className="w-4 h-4 ml-auto" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {title}
            </h3>
            <p className="text-white/90 text-sm">
              {message}
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Benefits List */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Early access to trial announcements</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Exclusive cricket training tips</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Priority registration for trials</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleButtonClick}
                className="flex-1 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                {buttonText}
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleClose}
                variant="outline"
                className="px-6 py-3 rounded-xl font-medium"
              >
                Later
              </Button>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;