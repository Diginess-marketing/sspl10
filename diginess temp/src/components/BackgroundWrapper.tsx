import React from 'react';
import { useLocation } from 'react-router-dom';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  const { pathname } = useLocation();

  // Homepage: flat cobalt only. The fixed texture/blur/gradient layers below repaint on every scroll and cost page speed.
  if (pathname === '/') {
    return <div className="relative min-h-screen bg-[#0047AB]">{children}</div>;
  }

  return (
    <div className="relative min-h-screen bg-[#0047AB]">
      {/* Base layer */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-[#0047AB]" 
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      />
      
      {/* Centralized Texture (Requested by user for Hero/Header sync) */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: 'url("/assets/hero-bg-texture-v2.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      />

      {/* Stadium-like depth + lighting */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0b58bf]/35 via-transparent to-[#022f78]/30" 
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      />
      {/* Subtle cricket pitch stripe pattern */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.10]"
        style={{
          backgroundImage: 'repeating-linear-gradient(100deg, transparent 0 26px, rgba(255,255,255,0.55) 26px 27px)',
        }}
      />
      {/* Radial atmosphere glows */}
      <div className="fixed -top-28 -right-24 z-0 h-96 w-96 rounded-full bg-[#00B4D8]/18 blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-32 -left-24 z-0 h-[26rem] w-[26rem] rounded-full bg-[#CCFF00]/14 blur-[140px] pointer-events-none" />
      {/* Cricket ball accent watermark */}
      <div
        className="fixed top-[22%] right-[8%] z-0 h-24 w-24 md:h-32 md:w-32 rounded-full border border-white/20 opacity-[0.12] pointer-events-none"
        style={{
          background: 'conic-gradient(from 90deg, rgba(255,255,255,0.65), rgba(255,255,255,0.08), rgba(255,255,255,0.65))',
        }}
      />
      <div className="fixed top-[22%] right-[8%] z-0 h-24 w-24 md:h-32 md:w-32 rounded-full border border-white/15 pointer-events-none" />

      {/* Content wrapper with relative positioning to appear above background */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;
