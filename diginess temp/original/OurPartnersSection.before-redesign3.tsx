const OurPartnersSection = () => {
  const partnerImages = [
    { src: '/Our-Sponsors/Edge-media', alt: 'Edge Media - SSPL Partner' },
    { src: '/Our-Sponsors/Equitas-Bank', alt: 'Equitas Bank - SSPL Partner' },
    { src: '/Our-Sponsors/Football-Makka', alt: 'Football Makka - SSPL Partner' },
    { src: '/Our-Sponsors/Lions-International-', alt: 'Lions International - SSPL Partner' },
    { src: '/Our-Sponsors/Malai-Murasu', alt: 'Malai Murasu - SSPL Partner' },
    { src: '/Our-Sponsors/Odi-Vilayadu-Papa', alt: 'Odi Vilayadu Papa - SSPL Partner' },
    { src: '/Our-Sponsors/Astro-Messiah', alt: 'Astro Messiah - SSPL Partner', isSimple: true, ext: '.jpeg' },
    { src: '/Our-Sponsors/Radio-city', alt: 'Radio City - SSPL Partner' },
    { src: '/Our-Sponsors/Reflect-Media', alt: 'Reflect Media - SSPL Partner' },
    { src: '/Our-Sponsors/RPL-blue-logo', alt: 'Royal Peacocks - SSPL Partner', isSimple: true },
    { src: '/Our-Sponsors/Sixit', alt: 'Sixit - SSPL Partner' },
    { src: '/images/zportify-logo', alt: 'Zportify - SSPL Partner', isSimple: true },
  ];

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-[#0047AB]">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-3 text-white font-heading">
            Our <span className="text-[#7CF7FF]">Partners</span>
          </h2>
          <p className="text-white/90 text-lg max-w-3xl mx-auto leading-relaxed">
            The SSPL ecosystem is powered by media, technology, and community partners who build this platform with us.
          </p>
          <div className="h-1 w-16 bg-[#CCFF00] mx-auto rounded-full mt-4" />
        </div>

        <div className="relative rounded-3xl border border-white/15 bg-[#05205a]/45 backdrop-blur-xl p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>

          <div className="flex flex-col items-center justify-center mb-12 animate-fade-in-up relative z-10">
            <h3 className="text-sm md:text-base font-display font-bold text-white uppercase tracking-[0.25em] mb-4 drop-shadow-md">
              An Initiative By
            </h3>
            <div className="transition-all duration-300 transform hover:-translate-y-1 bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-white/50">
              <img
                src="/Our-Sponsors/RPL-blue-logo.png"
                alt="Royal Peacocks - Initiative By"
                className="h-20 md:h-28 w-auto object-contain"
              />
            </div>
          </div>

          {[
            {
              title: "MEDIA PARTNERS",
              partners: [
                { src: '/Our-Sponsors/Radio-city', alt: 'Radio City' },
                { src: '/Our-Sponsors/Edge-media', alt: 'Edge Media' },
                { src: '/Our-Sponsors/Malai-Murasu', alt: 'Maalai Murasu' },
              ]
            },
            {
              title: "MATCH BALL PARTNER",
              partners: [
                { src: '/Our-Sponsors/Sixit', alt: 'Sixit Sports' },
              ]
            },
            {
              title: "BANKING PARTNER",
              partners: [
                { src: '/Our-Sponsors/Equitas-Bank', alt: 'Equitas Bank' },
              ]
            },
            {
              title: "SPORTS PARTNERS",
              partners: [
                { src: '/images/zportify-logo', alt: 'Zportify', isSimple: true },
                { src: '/Our-Sponsors/Odi-Vilayadu-Papa', alt: 'OVP' },
                { src: '/Our-Sponsors/Football-Makka', alt: 'Football Makka' },
              ]
            },
            {
              title: "COMMUNITY PARTNERS",
              partners: [
                { src: '/Our-Sponsors/Lions-International-', alt: 'Lions Club International' },
              ]
            },
            {
              title: "ASSOCIATE PARTNERS",
              partners: partnerImages.filter(p => 
                !['Radio-city', 'Edge-media', 'Malai-Murasu', 'Sixit', 'Equitas-Bank', 'zportify-logo', 'Odi-Vilayadu-Papa', 'Football-Makka', 'Lions-International-', 'RPL-blue-logo'].some(name => p.src.includes(name))
              )
            }
          ].map((category, catIdx) => (
            <div key={catIdx} className="partner-category-section relative z-10">
              <div className="partner-category-title text-center mb-6 mt-10">
                <h4 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide mb-2">{category.title}</h4>
                <div className="h-1 w-24 bg-[#7CF7FF] mx-auto rounded-full" />
              </div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {category.partners.map((partner, index) => {
                  const ext = partner.ext || '.png';
                  return (
                    <div
                      key={index}
                      className="group relative w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-28 bg-white rounded-xl border border-white/10 flex items-center justify-center p-4 md:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#7CF7FF] via-[#00B4D8] to-[#CCFF00] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={partner.isSimple ? partner.src + ext : partner.src + '.avif'}
                        alt={partner.alt}
                        className="max-w-full max-h-full object-contain transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="text-center mt-12 relative z-10">
            <p className="text-base text-white/90">
              Interested in partnering with us?
              <a href="mailto:info@ssplt10.co.in" className="text-[#7CF7FF] hover:text-[#CCFF00] transition-colors font-bold uppercase tracking-widest text-sm ml-2">
                Get in touch
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurPartnersSection;
