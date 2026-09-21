import React from 'react';

const CTASection = () => {
    const scrollToRegister = () => {
        document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="py-[64px] lg:py-[96px] bg-white font-['Poppins',sans-serif]">
            <div className="max-w-[800px] mx-auto px-5 lg:px-6 text-center">
                <h2 className="text-[36px] lg:text-[48px] font-bold text-[#111827] mb-4">
                    Ready to Register?
                </h2>
                <p className="text-[16px] lg:text-[20px] text-[#6B7280] mb-10 leading-[28px]">
                    Join hundreds of organisers across India and elevate your tournament with premium tennis balls.
                </p>

                <button
                    onClick={scrollToRegister}
                    className="bg-[#B4F000] text-[#0B1F3B] px-10 py-5 rounded-xl font-bold text-[18px] hover:scale-[1.03] transition-transform duration-200 shadow-[0_10px_25px_rgba(180,240,0,0.3)]"
                >
                    Secure Your Free Tennis Balls
                </button>
            </div>
        </section>
    );
};

export default CTASection;
