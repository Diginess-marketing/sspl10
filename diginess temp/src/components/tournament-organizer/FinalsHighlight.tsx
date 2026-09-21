import React from 'react';

const FinalsHighlight = () => {
    const scrollToRegister = () => {
        document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="bg-[#0B1F3B] py-[64px] lg:py-[96px] relative overflow-hidden font-body">
            {/* Abstract background graphics */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#B4F000] rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#F5C542] rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-[1200px] mx-auto px-5 lg:px-6 relative z-10 text-center">
                <div className="inline-block bg-[#F5C542]/20 text-[#F5C542] px-4 py-2 rounded-full font-semibold text-[14px] uppercase tracking-wide border border-[#F5C542]/30 w-fit mb-6">
                    The Ultimate Destination
                </div>

                <h2 className="text-[36px] lg:text-[48px] font-bold text-white mb-4">
                    Finals at <span className="text-[#B4F000]">Sharjah</span>
                </h2>

                <p className="text-[16px] lg:text-[20px] text-[#E5E7EB] max-w-2xl mx-auto mb-10 leading-[28px]">
                    Take your local heroes to the international stage. The best teams will battle it out where legends are made.
                </p>

                <button
                    onClick={scrollToRegister}
                    className="bg-[#B4F000] text-[#0B1F3B] px-8 py-4 rounded-xl font-semibold text-[16px] hover:scale-[1.03] transition-transform duration-200 shadow-lg"
                >
                    Register Your Tournament
                </button>
            </div>
        </section>
    );
};

export default FinalsHighlight;
