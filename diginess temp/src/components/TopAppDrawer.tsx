import React from 'react';
import { X, Instagram, Youtube, Facebook, Linkedin } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';

const TopAppDrawer: React.FC = () => {
    return (
        <div className="w-full bg-[#0A1628] text-white border-b border-white/10">
            <div className="container mx-auto px-2 sm:px-6 lg:px-8 h-auto min-h-[36px] sm:min-h-[40px] flex flex-wrap items-center justify-between gap-y-2 gap-x-4 py-1 sm:py-0">
                {/* Left: Language selector */}
                <div className="flex items-center gap-2">
                    <span className="hidden md:inline text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60">
                        Languages
                    </span>
                    <LanguageSelector />
                </div>

                {/* Right: Social icons */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <a
                        href="https://www.facebook.com/share/p/1Fk3RpvGMW/?mibextid=wwXIfr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#1877F2]/20 text-white/70 hover:text-[#1877F2] transition-all duration-300 border border-white/10"
                        aria-label="Facebook"
                    >
                        <Facebook size={14} />
                    </a>
                    <a
                        href="https://x.com/ssplt10/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-sspl-orange/20 text-white/70 hover:text-sspl-orange transition-all duration-300 border border-white/10"
                        aria-label="X (Twitter)"
                    >
                        <X size={14} />
                    </a>
                    <a
                        href="https://instagram.com/ssplt10"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#E4405F]/20 text-white/70 hover:text-[#E4405F] transition-all duration-300 border border-white/10"
                        aria-label="Instagram"
                    >
                        <Instagram size={14} />
                    </a>
                    <a
                        href="https://www.youtube.com/@Southernstreetpremierleague"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#FF0000]/20 text-white/70 hover:text-[#FF0000] transition-all duration-300 border border-white/10"
                        aria-label="YouTube"
                    >
                        <Youtube size={14} />
                    </a>
                    <a
                        href="https://www.linkedin.com/company/ssplt10/posts/?feedView=all"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#0A66C2]/20 text-white/70 hover:text-[#0A66C2] transition-all duration-300 border border-white/10"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={14} />
                    </a>
                    <a
                        href="https://sharechat.com/profile/ssplt10?d=n"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-sspl-orange/20 text-white/70 hover:text-sspl-orange transition-all duration-300 border border-white/10"
                        aria-label="ShareChat"
                    >
                        <img src="/assets/img/social-media-share chat.png" alt="ShareChat" className="w-4 h-4 object-contain" />
                    </a>
                    <a
                        href="https://mojapp.in/@ssplsouthern?referrer=V7hedHR-1fORME9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-sspl-orange/20 text-white/70 hover:text-sspl-orange transition-all duration-300 border border-white/10"
                        aria-label="Moj"
                    >
                        <img src="/assets/img/social-media-moj.png" alt="Moj" className="w-4 h-4 object-contain" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default TopAppDrawer;
