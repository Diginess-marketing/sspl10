import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Sparkles, Trophy, Star, Heart, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GullyToGloryAnnouncementProps {
  onClose?: () => void;
}

const GullyToGloryAnnouncement = ({ onClose }: GullyToGloryAnnouncementProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [animateElements, setAnimateElements] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Start celebration animations
    const timer = setTimeout(() => {
      setAnimateElements(true);
      setShowConfetti(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handlePhoneCall = () => {
    window.open('tel:+918807775960', '_self');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/918807775960?text=Hi%2C%20I%20am%20interested%20in%20Gully%20to%20Glory%20registration', '_blank');
  };

  const handleMapLink = () => {
    window.open('https://maps.app.goo.gl/7huc8B2WgPggbv3e8?g_st=iw', '_blank');
  };

  const handleClose = () => {

    if (typeof window !== 'undefined') {
      (window as any).__DEBUG_GULLY_HANDLE_CLOSE__ = true;
    }
    setIsOpen(false);
    if (onClose) {
      // Ensure callback is invoked
      if (typeof window !== 'undefined') {
        (window as any).__DEBUG_CALLBACK_INVOKED__ = true;
      }
      onClose();
    } else {
      if (typeof window !== 'undefined') {
        (window as any).__DEBUG_NO_CALLBACK__ = true;
      }
    }
  };

  const navigate = useNavigate();

  const handleRegister = () => {
    handleClose();
    navigate('/register');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md py-2 px-3">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-green-500/10 to-sport-orange/10 animate-pulse" />
      </div>

      <div className="w-full max-w-[480px] mx-auto relative my-auto">
        {/* Animated Confetti Background */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute top-2 left-2">
              <Sparkles className="w-3 h-3 text-yellow-400 opacity-70 drop-shadow-lg animate-bounce" />
            </div>
            <div className="absolute top-4 right-4">
              <Star className="w-3 h-3 text-blue-400 opacity-70 drop-shadow-lg animate-bounce" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Heart className="w-3 h-3 text-red-400 opacity-70 drop-shadow-lg animate-bounce" />
            </div>
            <div className="absolute bottom-2 right-2">
              <Trophy className="w-3 h-3 text-green-400 opacity-70 drop-shadow-lg animate-bounce" />
            </div>
          </div>
        )}

        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-500 via-green-500 to-sport-orange opacity-30 blur-2xl animate-pulse" />

        <div className={`relative bg-linear-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl border-2 border-transparent bg-clip-padding p-0.5 transition-all duration-1000 shadow-2xl ${animateElements ? 'animate-fade-in' : ''}`}>
          <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-500 via-green-500 to-sport-orange opacity-50 blur-sm" />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-2 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
            {/* Close Button (inside card) */}
            <button
              onClick={handleClose}
              className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/20 text-slate-100 hover:bg-black/30 transition-colors z-20"
              aria-label="Close announcement"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Animated Header */}
            <div className={`flex items-center justify-center gap-1.5 mb-1 transition-all duration-1000 ${animateElements ? 'animate-bounce' : ''}`}>
              <Trophy className="w-3 h-3 text-yellow-500" />
              <span
                className="font-display font-black text-[14px] md:text-[16px] uppercase tracking-[0.15em] !text-[#006400]"
                style={{ color: '#006400', fontWeight: 900 }}
              >
                SSPL T10 TRIALS — UPDATE
              </span>
              <Trophy className="w-3 h-3 text-yellow-500" />
            </div>

            {/* Animated Message Section */}
            <div className={`mb-1 text-[9px] md:text-[10px] space-y-1.5 transition-all duration-1000 ${animateElements ? 'animate-fade-in' : ''}`}>
              {/* Main Announcement */}
              <div className="relative overflow-hidden rounded-lg mb-1">
                <div className="absolute inset-0 bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 animate-gradient" />
                <div className="absolute inset-0 bg-linear-to-r from-purple-600/0 via-white/20 to-purple-600/0 animate-shimmer" />
                <div className="relative bg-linear-to-r from-purple-600/95 via-pink-600/95 to-orange-600/95 backdrop-blur-sm p-1.5 md:p-2 border-2 border-white/40 shadow-xl">
                  <div className="absolute top-0.5 right-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse" />
                  </div>
                  <div className="absolute bottom-0.5 left-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse animation-delay-[500ms]" />
                  </div>
                  <div className="text-center">
                    <p className="text-black font-black text-[12px] md:text-[14px] drop-shadow-sm uppercase tracking-wide !text-black" style={{ color: '#000000', fontWeight: 900 }}>
                      ✨ Spot registration available ✨
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Grand Final Banner Image */}
            <div className="relative rounded-lg overflow-hidden border border-purple-100 shadow-md mb-1.5 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src="/assets/banners/sharjah-grand-final.webp"
                alt="Sharjah Grand Final"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-2 left-2 right-2 z-20 text-center">
                <p className="text-white text-[14px] md:text-[16px] font-display font-black uppercase tracking-widest drop-shadow-xl !text-white" style={{ color: '#FFFFFF', fontWeight: 900 }}>
                  Grand Final In Sharjah
                </p>
              </div>
            </div>            {/* Trials Schedule - NEW */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded border border-blue-100">
                <MapPin className="w-2.5 h-2.5 text-blue-600" />
                <span className="text-[9px] font-black text-slate-700 uppercase">Bengaluru: Venue to be declared — Apr 19</span>
              </div>
              <div className="flex items-center justify-center p-1 bg-slate-50 rounded border border-slate-100">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                  Coimbatore: May 03 • Vijayawada: May 10 • Jaipur: May 17
                </p>
              </div>
            </div>

            <div className="bg-linear-to-r from-sport-orange/10 to-purple-100/10 rounded p-1.5 mb-1.5 border border-orange-200/30">
              <p className="text-center text-slate-800 font-black text-[10px] uppercase">
                ✨ Spot Registration Available At Venue ✨
              </p>
            </div>

            <div className="bg-linear-to-r from-green-50 to-emerald-50 rounded p-1.5 md:p-2 border border-green-200">
              <p className="text-green-800 text-center font-black text-[12px] md:text-[13px] uppercase tracking-wide !text-[#166534]" style={{ color: '#166534', fontWeight: 900 }}>
                Register, Show up and Showcase your Talent.
              </p>
            </div>

            <div onClick={handleRegister} className="block cursor-pointer">
              <div className="relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-linear-to-r from-sport-orange via-[#d4ff00] to-green-500 animate-gradient" />
                <button className="relative w-full bg-linear-to-r from-sport-orange via-[#d4ff00] to-green-500 hover:from-green-500 hover:via-[#d4ff00] hover:to-sport-orange text-black font-black py-2 md:py-2.5 px-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl text-[9px] md:text-[10px] group border-2 border-white/30">
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 animate-bounce" />
                    🏏 REGISTER NOW 🏏
                    <Trophy className="w-3.5 h-3.5 animate-bounce animation-delay-[200ms]" />
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Hashtags Section */}
          <div className={`mb-1.5 transition-all duration-1000 ${animateElements ? 'animate-fade-in' : ''}`}>
            <div className="bg-linear-to-r from-slate-50 to-gray-50 rounded p-1.5 md:p-2 border border-slate-200">
              <p className="text-center text-black text-[8px] md:text-[9px] font-semibold">
                #sspl #cricketleague #tennisballcricket
              </p>
            </div>
          </div>

          {/* Interactive Contact Section */}
          <div className={`transition-all duration-1000 ${animateElements ? 'animate-fade-in' : ''}`}>
            {/* Animated Contact Buttons */}
            <div className="flex gap-1.5">
              <Button
                onClick={handlePhoneCall}
                size="sm"
                className={'flex-1 bg-green-500 hover:bg-green-600 text-white text-[9px] md:text-[10px] py-1.5 px-2 rounded-md transition-all duration-300 hover:scale-105 shadow-md'}
              >
                <Phone className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
                Call
              </Button>
              <Button
                onClick={handleWhatsApp}
                size="sm"
                className={'flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] md:text-[10px] py-1.5 px-2 rounded-md transition-all duration-300 hover:scale-105 shadow-md'}
              >
                <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
                WhatsApp
              </Button>
              <Button
                onClick={handleMapLink}
                size="sm"
                className={'flex-1 bg-blue-500 hover:bg-blue-600 text-white text-[9px] md:text-[10px] py-1.5 px-2 rounded-md transition-all duration-300 hover:scale-105 shadow-md flex items-center justify-center'}
              >
                <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
                Map
              </Button>
            </div>
          </div>

          {/* Floating Celebration Elements */}
          {animateElements && (
            <>
              <div className="absolute -top-1.5 -right-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </div>
            {/* Trials Schedule - NEW */}
            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded border border-blue-100">
                <MapPin className="w-2.5 h-2.5 text-blue-600" />
                <span className="text-[9px] font-black text-slate-700 uppercase">Bengaluru: Chinnaswamy Nets — Apr 19</span>
              </div>
              <div className="flex items-center justify-center p-1 bg-slate-50 rounded border border-slate-100">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                  Coimbatore: May 03 • Vijayawada: May 10 • Jaipur: May 17
                </p>
              </div>
            </div>

            <div className="bg-linear-to-r from-sport-orange/10 to-purple-100/10 rounded p-1.5 mb-1.5 border border-orange-200/30">
              <p className="text-center text-slate-800 font-black text-[10px] uppercase">
                ✨ Spot Registration Available At Venue ✨
              </p>
            </div>
              <div className="absolute -top-1.5 -left-1.5">
                <Star className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute -top-2 -left-2 w-4 h-4 border-t-3 border-l-3 border-yellow-400 rounded-tl-lg opacity-70" />
      <div className="absolute -top-2 -right-2 w-4 h-4 border-t-3 border-r-3 border-pink-400 rounded-tr-lg opacity-70" />
      <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-3 border-l-3 border-blue-400 rounded-bl-lg opacity-70" />
      <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-3 border-r-3 border-purple-400 rounded-br-lg opacity-70" />
    </div>
  );
};

export default GullyToGloryAnnouncement;