import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'ml', label: 'Malayalam' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ur', label: 'Urdu' },
];

const LanguageGlobe = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };

        const googTrans = getCookie('googtrans');
        if (googTrans) {
            const parts = googTrans.split('/');
            if (parts.length > 2) {
                setCurrentLang(parts[2]);
            }
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (code: string) => {
        setCurrentLang(code);
        setIsOpen(false);

        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
            select.value = code;
            select.dispatchEvent(new Event('change'));
        } else {
            document.cookie = `googtrans=/en/${code}; path=/`;
            document.cookie = `googtrans=/en/${code}; domain=.${window.location.hostname}; path=/`;
            window.location.reload();
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white flex items-center gap-1"
                aria-label="Select Language"
            >
                <Globe className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{currentLang}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0A1628] border border-white/10 rounded-xl shadow-2xl py-2 z-[100] animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 mb-1">
                        Select Language
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={cn(
                                'w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors',
                                currentLang === lang.code
                                    ? 'text-sspl-orange bg-white/5'
                                    : 'text-white/70 hover:text-white hover:bg-white/5',
                            )}
                        >
                            {lang.label}
                            {currentLang === lang.code && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageGlobe;
