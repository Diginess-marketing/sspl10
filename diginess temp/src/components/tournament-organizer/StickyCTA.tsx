import { useState, useEffect } from 'react';

const StickyCTA = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show when scrolled past 40% of the page
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            const fortyPercent = documentHeight * 0.40;

            // Hidden near the top (hero section) or very bottom (footer)
            if (scrollPosition > fortyPercent && scrollPosition < documentHeight - windowHeight - 200) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToRegister = () => {
        document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 p-4 lg:p-6 lg:bottom-6 lg:left-auto lg:right-1/2 lg:translate-x-1/2 transition-transform duration-300 ease-in-out font-body ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'
                }`}
        >
            <div className="bg-white lg:bg-[#0B1F3B] shadow-[0_-10px_30px_rgba(0,0,0,0.1)] lg:shadow-2xl rounded-t-2xl lg:rounded-2xl p-4 lg:px-8 lg:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#E5E7EB] lg:border-white/10 mx-auto max-w-4xl w-full">
                <div>
                    <p className="font-semibold text-[16px] text-[#111827] lg:text-white text-center sm:text-left">
                        Limited Free Tennis Balls Available
                    </p>
                    <p className="text-[14px] text-[#6B7280] lg:text-[#E5E7EB] text-center sm:text-left hidden sm:block">
                        Register your tournament now to secure your allocation.
                    </p>
                </div>
                <button
                    onClick={scrollToRegister}
                    className="bg-[#B4F000] text-[#0B1F3B] px-8 py-3 rounded-xl font-bold text-[16px] w-full sm:w-auto hover:scale-[1.03] transition-transform duration-200 whitespace-nowrap"
                >
                    Register Now
                </button>
            </div>
        </div>
    );
};

export default StickyCTA;
