import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
    const [elevated, setElevated] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Need to elevate the button to avoid overlapping with StickyCTA on mobile
            const scrollPosition = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight;
            const fortyPercent = documentHeight * 0.40;

            const isMobile = window.innerWidth < 1024;

            if (isMobile && scrollPosition > fortyPercent && scrollPosition < documentHeight - window.innerHeight - 200) {
                setElevated(true);
            } else {
                setElevated(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <a
            href="https://wa.me/919876543210?text=Hi! I am interested in registering my cricket tournament for free tennis balls."
            target="_blank"
            rel="noopener noreferrer"
            className={`fixed right-5 lg:right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1EBE5A] hover:scale-110 transition-all duration-300 flex items-center justify-center ${elevated ? 'bottom-28' : 'bottom-6 md:bottom-24 lg:bottom-6'
                }`}
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={28} />
        </a>
    );
};

export default WhatsAppButton;
