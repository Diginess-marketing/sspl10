import React from 'react';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

// Flat cobalt background on every page — the layered texture/blur/glow glassmorphism
// effect that used to run on non-home routes has been removed sitewide.
const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => (
  <div className="relative min-h-screen bg-[#0047AB]">{children}</div>
);

export default BackgroundWrapper;
