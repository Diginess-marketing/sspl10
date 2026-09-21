import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Trophy, UserPlus } from 'lucide-react';
import PlayerRegistrationStepper from './PlayerRegistrationStepper';
import { useLocation } from 'react-router-dom';

const FloatingRegistrationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const location = useLocation();

  // Only show on the home page (not on any other page)
  if (location.pathname !== '/') return null;

  const handleTrigger = () => {
    setIsBouncing(true);
    // Open modal after the peak of the bounce
    setTimeout(() => {
      setIsOpen(true);
      setIsBouncing(false);
    }, 450);
  };

  return (
    <>
      {/* Mobile Image Button - Centered Bottom */}
      <div
        className={`md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 transition-transform duration-300 ${isBouncing ? 'animate-bounce-once' : ''}`}
      >
        <button
          onClick={handleTrigger}
          className="relative group transition-all duration-300 active:scale-95"
          aria-label="Mobile registration button"
        >
          {/* Pulse inner rings */}
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-40 bg-sspl-orange"
            style={{ animationDuration: '2s' }}
          />
          <span
            className="absolute inset-0 rounded-full animate-pulse opacity-20 bg-sspl-orange"
            style={{ animationDuration: '3s' }}
          />

          {/* Main Image Button - Reduced size for small mobile */}
          <div className="relative z-10 w-20 h-20 min-[380px]:w-24 min-[380px]:h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-[0_10px_30px_rgba(140,200,0,0.5)] border-2 border-sspl-orange/30">
            <img
              src="/assets/images/player-fab.png"
              alt="Register Now"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>

          {/* Shine effect */}
          <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20">
            <span
              className="absolute top-0 left-[-100%] w-full h-full group-hover:left-[100%] transition-all duration-1000"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
            />
          </span>
        </button>

        {/* Compact Label */}
        <button
          onClick={handleTrigger}
          className="px-4 py-1.5 min-[380px]:px-6 min-[380px]:py-2 bg-sspl-orange rounded-full border-2 border-sspl-navy/10 shadow-xl scale-100 min-[380px]:scale-110 relative z-30 active:scale-95 transition-transform"
        >
          <span className="text-[10px] min-[380px]:text-[12px] font-black !text-[#000080] uppercase tracking-tighter whitespace-nowrap">
            Register Now
          </span>
        </button>
      </div>

      {/* Registration Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <VisuallyHidden>
            <DialogTitle>Player Registration</DialogTitle>
            <DialogDescription>
              Complete the registration form to join the SSPL cricket league
            </DialogDescription>
          </VisuallyHidden>
          <div className="p-6">
            <PlayerRegistrationStepper />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingRegistrationButton;