import React from 'react';

const HeroSection = () => {
    const scrollToRegister = () => {
        document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToPrize = () => {
        document.getElementById('prize')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-[85vh] flex items-center pt-24 pb-16 lg:pt-32 font-['Poppins',sans-serif] bg-[#0B1F3B] overflow-hidden" id="about">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3B] via-[#0B1F3B] to-transparent z-10 hidden lg:block"></div>
                <img
                    src="/assets/images/hero-banner-main.jpg"
                    alt="Cricket background"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>

            <div className="max-w-[1440px] mx-auto px-5 lg:px-8 w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Content Column */}
                    <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
                        <div className="inline-block mx-auto lg:mx-0 bg-[#F5C542]/20 text-[#F5C542] px-4 py-2 rounded-full font-semibold text-[14px] uppercase tracking-wide border border-[#F5C542]/30 w-fit">
                            SSPL T10 2026
                        </div>

                        <h1 className="text-white text-[36px] lg:text-[48px] leading-[44px] lg:leading-[56px] font-semibold">
                            Free Tennis Balls for Tournament Organisers
                        </h1>

                        <p className="text-[#E5E7EB] text-[16px] leading-[24px] font-normal mx-auto lg:mx-0 max-w-lg">
                            Pan India | Limited Allocation | First-Come First-Serve
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center lg:justify-start">
                            <button
                                onClick={scrollToRegister}
                                className="bg-[#B4F000] text-[#0B1F3B] px-8 py-4 rounded-xl font-semibold text-[16px] hover:scale-[1.03] transition-transform duration-200 shadow-lg"
                            >
                                Register Now
                            </button>

                            <button
                                onClick={scrollToPrize}
                                className="bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold text-[16px] hover:bg-white/10 transition-colors duration-200"
                            >
                                View Prize Details
                            </button>
                        </div>

                        <p className="text-[#F5C542] text-[14px] font-medium mt-2">
                            Up to ₹3 Crores Prize Pool
                        </p>
                    </div>

                    {/* Image Column */}
                    <div className="lg:col-span-6 relative flex justify-center mt-8 lg:mt-0">
                        <div className="relative w-full max-w-md aspect-square lg:aspect-auto lg:h-[500px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 z-10">
                            <img
                                src="/assets/images/Next_Trials_Poster.jpg"
                                alt="Tennis balls for organizers"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/600x800/111827/F5C542?text=Free+Tennis+Balls';
                                }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0B1F3B] to-transparent p-6 pt-20 text-center">
                                <p className="text-white font-semibold text-lg">Premium Quality Assured</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;
