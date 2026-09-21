import React from 'react';
import { Music, Play } from 'lucide-react';
import LiteYouTube from '@/components/LiteYouTube';

const SSPLAnthemSection = () => {
  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-[#0047AB]">
      {/* Custom Background Texture */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/assets/anthem-bg-texture.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-8 h-8 text-[#CCFF00] mr-3" />
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-white font-heading">
              SSPL T10 <span className="text-[#CCFF00]">ANTHEM</span>
            </h2>
            <Music className="w-8 h-8 text-[#CCFF00] ml-3" />
          </div>
          <p className="text-lg !text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
            Feel the heartbeat of the league. The rhythm of glory.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative group perspective-1000">

            <div className="w-16 h-1 bg-[#CCFF00] rounded-full mx-auto" />
            <div className="relative bg-white/5 p-2 rounded-3xl shadow-2xl border-4 border-white/10 ring-4 ring-white/5 transform transition-all duration-500 hover:scale-[1.01] hover:rotate-1 z-10 backdrop-blur-md">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-inner bg-black relative">
                <LiteYouTube id="QrBQAv3D1cU" title="SSPL T10 Official Anthem" className="rounded-2xl" />

                {/* Audio Visualizer Overlay Bars (decorative) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-sspl-orange to-transparent opacity-50"></div>
              </div>
            </div>

            {/* Glowing Backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#00B4D8] to-[#0072ff] rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 -z-10 animate-pulse-slow"></div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full shadow-md border border-white/10 backdrop-blur-sm">
              <span className="flex gap-1 h-4 items-end">
                <span className="w-1 bg-[#00B4D8] h-full animate-music-bar-1"></span>
                <span className="w-1 bg-[#00B4D8] h-2/3 animate-music-bar-2"></span>
                <span className="w-1 bg-[#00B4D8] h-full animate-music-bar-3"></span>
                <span className="w-1 bg-[#00B4D8] h-1/2 animate-music-bar-4"></span>
              </span>
              <span className="text-sm md:text-base font-semibold text-white/90 tracking-wide uppercase font-heading">Official Sound of Victory</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SSPLAnthemSection;
