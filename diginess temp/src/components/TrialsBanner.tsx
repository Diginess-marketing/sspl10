import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';

const TrialsBanner = () => {
  return (
    <section
      className="relative w-full py-4 md:py-6 bg-linear-to-r from-sport-orange via-[#d4ff00] to-sport-orange overflow-hidden"
      role="banner"
      aria-label="Cricket Trials Announcement"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 left-10 w-20 h-20 bg-white rounded-full animate-pulse animation-duration-[4000ms]"></div>
        <div className="absolute bottom-2 right-10 w-16 h-16 bg-white rounded-full animate-pulse animation-delay-[1000ms] animation-duration-[4000ms]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full animate-pulse animation-delay-[2000ms] animation-duration-[4000ms]"></div>
      </div>

      {/* Cricket Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
          <pattern id="cricketPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="2" fill="white" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#cricketPattern)" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left Side - Trial Info */}
          <div className="flex-1">
            {/* Badge */}
            <Badge className="bg-blue-600 text-white border-2 border-blue-600/50 font-bold text-xs px-2 py-0.5 shadow-lg backdrop-blur-sm hover:scale-105 transition-all duration-300 mb-2 font-display">
              🎯 TRIALS ANNOUNCEMENT
            </Badge>

            {/* Title */}
            <h2 className="font-black leading-tight font-display mb-2">
              <span className="block text-lg md:text-xl lg:text-2xl text-white drop-shadow-lg">
                UPCOMING TRIALS
              </span>
              <span className="block text-sm md:text-base text-blue-100 drop-shadow-lg font-bold uppercase tracking-wider">
                Coming Soon to Your City
              </span>
            </h2>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {/* Status */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Calendar className="w-3.5 h-3.5 text-sport-orange" aria-hidden="true" />
                  <span className="text-xs font-semibold text-sport-orange uppercase tracking-wider">Status</span>
                </div>
                <p className="text-xs font-semibold text-gray-800">Dates to be announced</p>
              </div>

              {/* Registration */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg hover:shadow-xl border border-white/50 transition-all duration-300 hover:scale-105">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Registration</span>
                </div>
                <p className="text-xs font-semibold text-gray-800">Open Now</p>
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
            <Button
              onClick={() => {
                const event = new CustomEvent('openRegistration', {
                  detail: { scrollBehavior: 'smooth' },
                });
                window.dispatchEvent(event);

                const element = document.querySelector('#register, [data-registration]');
                if (element) {
                  requestAnimationFrame(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                  });
                }
              }}
              className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-1.5 text-sm"
              aria-label="Register for trials"
            >
              <Users className="w-4 h-4" />
              Register Now
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 bg-black/20 backdrop-blur-sm rounded-lg p-2 border border-white/20">
          <p className="text-white text-xs font-medium leading-relaxed">
            Stay tuned for upcoming trial dates and venues in your city!
          </p>
        </div>
      </div>

      {/* Bottom Wave Border */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-4 text-white">
          <path d="M0,120 C300,60 900,60 1200,120 L1200,0 L0,0 Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  );
};

export default TrialsBanner;