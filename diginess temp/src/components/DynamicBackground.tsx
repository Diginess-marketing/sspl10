import React from 'react';

const DynamicBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#060e20]">
      {/* Cinematic Mesh Gradient */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="80" result="blur" />
          </filter>
        </defs>
        <g filter="url(#blur)">
          {/* Kinetic Energy Blobs */}
          <circle cx="10%" cy="10%" r="300" fill="#ff9153" className="animate-blob" />
          <circle cx="90%" cy="20%" r="400" fill="#7799ff" className="animate-blob animation-delay-2000" />
          <circle cx="50%" cy="80%" r="350" fill="#CCFF00" className="animate-blob animation-delay-4000" />
          <circle cx="10%" cy="90%" r="250" fill="#ff7a23" className="animate-blob animation-delay-6000" />
        </g>
      </svg>

      {/* Subtle Noise Texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      />

      {/* Stadium Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
    </div>
  );
};

export default DynamicBackground;
