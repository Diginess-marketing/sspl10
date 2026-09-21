import React from 'react';

const CricketBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8fafc]">
      {/* 
        Stadium Aura Background 
        - Multi-layered mesh gradients for depth
        - Stadium floodlight beam effects
        - Enhanced noise & pitch grain texture
        - Dynamic abstract cricket elements
      */}

      {/* 1. Base Gradient Layer - Deeper & More Sophisticated */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-200 to-white opacity-80"></div>

      {/* 2. Interactive/Animated Mesh Gradients (Aura) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-sspl-orange/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
      <div className="absolute top-[10%] right-[-20%] w-[50%] h-[50%] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[60%] bg-blue-100 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-green-100/30 rounded-full mix-blend-screen filter blur-[80px] animate-blob animation-delay-6000"></div>

      {/* 3. Stadium Floodlight Effects (Top Corners) */}
      <div
        className="absolute top-0 left-0 w-[50%] h-[100%] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(91, 192, 190, 0.4) 0%, transparent 70%)',
          transform: 'skewX(-15deg)'
        }}
      ></div>
      <div
        className="absolute top-0 right-0 w-[50%] h-[100%] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
          transform: 'skewX(15deg)'
        }}
      ></div>

      {/* 4. Fine Pitch-Grain Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.4]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px'
      }}></div>

      {/* 5. Sublte Grid / Tactical Lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(#0F172A 1.5px, transparent 1.5px), linear-gradient(90deg, #0F172A 1.5px, transparent 1.5px)`,
          backgroundSize: '60px 60px'
        }}
        aria-hidden="true"
      ></div>

      {/* 6. Abstract Cricket Elements - Pitch Markings */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[2px] h-[60%] bg-slate-900/[0.03] shadow-[0_0_20px_rgba(0,0,0,0.02)]"></div>
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[300px] h-[1px] bg-slate-900/[0.03]"></div>

      {/* 7. Enhanced Watermark - Interlocking Look */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-[-1]">
        <h1 className="text-[15vw] leading-none font-black text-slate-800 opacity-[0.025] tracking-tighter select-none font-display transform -rotate-3 scale-110">
          SSPL T10
        </h1>
        <div className="text-[2vw] font-bold text-slate-900 opacity-[0.015] tracking-[1em] uppercase mt-4">
          Professional Cricket League
        </div>
      </div>
    </div>
  );
};

export default CricketBackground;
