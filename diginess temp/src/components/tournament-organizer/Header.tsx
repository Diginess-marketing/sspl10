import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'About', href: '#about' },
        { name: 'Prize', href: '#prize' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'FAQ', href: '#faq' },
    ];

    const scrollToRegister = () => {
        document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,box-shadow] duration-500 font-body ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
                }`}
            style={{ willChange: 'padding, background-color, box-shadow' }}
        >
            <div className="max-w-[1440px] mx-auto px-5 lg:px-8 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="SSPL Logo" className="h-[48px] w-auto" onError={(e) => {
                        // Fallback if logo not found
                        e.currentTarget.src = 'https://placehold.co/100x48/0B1F3B/FFF?text=SSPL';
                    }} />
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`text-[16px] font-medium hover:text-[#B4F000] transition-colors ${isScrolled ? 'text-[#111827]' : 'text-white drop-shadow-md'
                                }`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <button
                        onClick={scrollToRegister}
                        className="bg-[#B4F000] text-[#0B1F3B] px-6 py-3 rounded-xl font-semibold text-[16px] hover:scale-105 transition-transform duration-200"
                    >
                        Register
                    </button>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-[#0B1F3B]' : 'text-white'}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl py-4 flex flex-col px-5 md:hidden border-t border-[#E5E7EB]">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="py-3 text-[#111827] text-[16px] font-medium border-b border-[#E5E7EB] last:border-0"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                    <button
                        onClick={scrollToRegister}
                        className="mt-4 bg-[#B4F000] text-[#0B1F3B] px-6 py-3 rounded-xl font-semibold text-[16px] w-full"
                    >
                        Register
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
