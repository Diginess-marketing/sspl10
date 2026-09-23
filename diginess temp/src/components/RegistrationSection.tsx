import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import SportButton from '@/components/ui/design/SportButton';

const RegistrationSection = () => {
  return (
    <section className="relative py-24 lg:py-32 bg-[#0A1628] overflow-hidden" aria-label="Registration Call to Action">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #00B4D8 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="container-responsive relative z-10">
        {/* Grand Finale Banner */}
        <div className="w-full max-w-[1400px] mx-auto mb-4">
          <Link to="/register" className="block w-full hover:opacity-95 transition-opacity">
            <picture>
              <source
                srcSet={`
                  /assets/banners/sharjah-grand-final-480w.avif 480w,
                  /assets/banners/sharjah-grand-final-768w.avif 768w,
                  /assets/banners/sharjah-grand-final.avif 1080w
                `}
                type="image/avif"
              />
              <source
                srcSet={`
                  /assets/banners/sharjah-grand-final-480w.webp 480w,
                  /assets/banners/sharjah-grand-final-768w.webp 768w,
                  /assets/banners/sharjah-grand-final.webp 1080w
                `}
                type="image/webp"
              />
              <img
                src="/assets/banners/sharjah-grand-final.webp"
                alt="Grand Final in Sharjah - Prize Money upto 3 Crores"
                className="w-full h-auto object-cover rounded-xl shadow-2xl"
                loading="lazy"
                width="1280"
                height="213"
                style={{ minHeight: '50px', backgroundColor: '#001b69' }}
              />
            </picture>
          </Link>
        </div>

        <div className="flex flex-col items-center max-w-6xl mx-auto space-y-4">
          {/* Content Column */}
          <div className="space-y-6 text-center w-full max-w-5xl mx-auto">
            <div className="space-y-5">
              <div
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-black tracking-tighter uppercase mx-auto shadow-lg bg-gradient-to-r from-[#00B4D8] to-[#0072ff] text-white"
              >
                <Star className="w-5 h-5 fill-current animate-spin-slow" />
                <span className="font-heading tracking-widest">Registration Open</span>
              </div>

              <h2
                className="text-display leading-[0.85] tracking-tighter transform perspective-1000 font-black font-heading"
                style={{
                  fontSize: 'clamp(5rem, 15vw, 14rem)',
                  color: 'white',
                  textShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
                }}
              >
                <span className="block">READY TO</span>
                <span
                  className="block"
                  style={{
                    background: 'linear-gradient(to right, #00B4D8, #0072ff, #00B4D8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  DOMINATE?
                </span>
              </h2>

              <p
                className="max-w-3xl mx-auto font-medium leading-relaxed tracking-wide !text-white"
                style={{
                  fontSize: '1.5rem',
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
              >
                Join the most prestigious tennis ball cricket league in India.
                <span className="!text-white font-bold" style={{ color: '#ffffff' }}> Showcase your talent</span>, get drafted by top teams, and win massive prizes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
              <Link to="/register" className="w-full sm:w-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#00B4D8] to-[#0072ff] rounded-lg blur-md opacity-40 group-hover:opacity-100 transition duration-500"></div>
                <SportButton
                  fullWidth
                  glow
                  sx={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #00B4D8 0%, #0072ff 100%) !important',
                    color: 'white !important',
                    fontSize: '1.35rem',
                    padding: '2rem 3.5rem',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '0.12em',
                    borderRadius: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 0 30px rgba(0, 180, 216, 0.5) !important',
                    border: '1px solid rgba(255, 255, 255, 0.3) !important',
                    '&:hover': { 
                      transform: 'translateY(-4px) scale(1.03)',
                      boxShadow: '0 0 45px rgba(0, 180, 216, 0.8) !important',
                    },
                  }}
                >
                  Individual Registration <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </SportButton>
              </Link>
              <Link to="/register?type=students" className="w-full sm:w-auto relative group">
                <div className="absolute -top-3 -right-3 z-20">
                  <div className="bg-[#CCFF00] text-[#0A1628] text-[10px] font-black px-2 py-1 rounded-md shadow-lg transform rotate-12 animate-pulse uppercase tracking-tighter">
                    10% Discount
                  </div>
                </div>
                <SportButton
                  fullWidth
                  sx={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1) !important',
                    color: 'white !important',
                    border: '2px solid rgba(255, 255, 255, 0.3) !important',
                    fontSize: '1.2rem',
                    padding: '2rem 2.75rem',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '0.1em',
                    borderRadius: '0.6rem',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.3s ease !important',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.18) !important',
                      borderColor: 'rgba(255, 255, 255, 0.6) !important',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Student Registration
                </SportButton>
              </Link>
              <Link to="/register?type=team" className="w-full sm:w-auto relative group">
                <div className="absolute -top-3 -right-3 z-20">
                  <div className="bg-[#CCFF00] text-[#0A1628] text-[10px] font-black px-2 py-1 rounded-md shadow-lg transform rotate-12 animate-pulse uppercase tracking-tighter">
                    10% Discount
                  </div>
                </div>
                <SportButton
                  fullWidth
                  sx={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1) !important',
                    color: 'white !important',
                    border: '2px solid rgba(255, 255, 255, 0.3) !important',
                    fontSize: '1.2rem',
                    padding: '2rem 2.75rem',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '0.1em',
                    borderRadius: '0.6rem',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.3s ease !important',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.18) !important',
                      borderColor: 'rgba(255, 255, 255, 0.6) !important',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Team Registration
                </SportButton>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
              {[
                { label: 'Prize Pool', value: '3 Cr+', start: 'var(--color-stat-1-start)', end: 'var(--color-stat-1-end)' },
                { label: 'Teams', value: '12', start: 'var(--color-stat-2-start)', end: 'var(--color-stat-2-end)' },
                { label: 'Broadcast', value: 'Live', start: 'var(--color-stat-3-start)', end: 'var(--color-stat-3-end)' },
                { label: 'Finals At', value: 'Sharjah', start: 'var(--color-stat-4-start)', end: 'var(--color-stat-4-end)' },
              ].map((stat, i) => (
                <div key={i} className="group relative">
                  <div className={'absolute -inset-0.5 opacity-70 blur group-hover:opacity-100 transition duration-500 rounded-xl'} style={{ background: `linear-gradient(to right, ${stat.start}, ${stat.end})` }}></div>
                  <div className={'relative h-full rounded-xl p-6 flex flex-col items-center justify-center border border-white/20 overflow-hidden shadow-lg'} style={{ background: `linear-gradient(to br, ${stat.start}, ${stat.end})` }}>
                    {/* Scanline */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-[200%] w-full animate-scanline pointer-events-none opacity-0 group-hover:opacity-100"></div>

                    <div className="relative font-display text-4xl sm:text-5xl lg:text-6xl mb-2 drop-shadow-lg font-black tracking-tighter group-hover:scale-110 transition-transform duration-300 text-sspl-navy-forced">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] border-t border-sspl-navy/20 pt-3 w-full text-center group-hover:opacity-80 transition-opacity text-sspl-navy-forced">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;