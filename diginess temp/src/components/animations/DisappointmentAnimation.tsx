import React from 'react';
import { Star, TrendingUp, Heart } from 'lucide-react';

interface DisappointmentAnimationProps {
  onClose?: () => void;
}

const DisappointmentAnimation: React.FC<DisappointmentAnimationProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-linear-to-br from-purple-900/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-sm flex items-center justify-center z-[100000] animate-fade-in" onClick={onClose}>
      {/* Floating stars animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          const left = `${Math.random() * 100}%`;
          const top = `${Math.random() * 100}%`;
          const delayMs = Math.round(Math.random() * 3000);
          const durationMs = Math.round((3 + Math.random() * 2) * 1000);
          return (
            <div
              key={i}
              className={`absolute animate-float animation-delay-[${delayMs}ms] animation-duration-[${durationMs}ms]`}
              style={{ left, top }}
            >
              <Star className="w-4 h-4 text-yellow-300 opacity-30" fill="currentColor" />
            </div>
          );
        })}
      </div>

      {/* Main card */}
      <div className="relative bg-linear-to-br from-white via-blue-50 to-purple-50 rounded-2xl p-8 sm:p-12 shadow-2xl text-center max-w-md mx-4 animate-bounce-in border-4 border-purple-200" onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}

        {/* Animated icon container */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-linear-to-r from-purple-400 to-blue-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative bg-linear-to-br from-purple-500 to-blue-500 w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-lg animate-spin-slow">
            <TrendingUp className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Message */}

        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" />
          <h3 className="text-xl font-bold text-black mb-2" style={{ color: '#000000' }}>
            Better Luck Next Time!
          </h3>
          <Heart className="w-5 h-5 text-red-500 animate-pulse" fill="currentColor" />
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">
          Every champion was once a contender that refused to give up.
          <br />
          <span className="font-semibold text-purple-600">Your journey continues!</span>
        </p>

        {/* Decorative elements */}
        <div className="mt-6 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full bg-linear-to-r from-purple-400 to-blue-400 animate-bounce animation-delay-[${Math.round(i * 100)}ms]`}
            />
          ))}
        </div>

        {/* Close Button (Bottom) */}
        {onClose && (
          <div className="mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-colors text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3) translateY(-100px); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out 0.3s both;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DisappointmentAnimation;
