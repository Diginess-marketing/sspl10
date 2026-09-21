import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { PlayerResult } from '@/types/playerData';

// Import the existing animations
import DoubleEagleTicketAnimation from './GoldenTicketAnimation';
import KohinoorTicketAnimation from './KohinoorTicketAnimation';
import PlatinumTicketAnimation from './PlatinumTicketAnimation';
import BetterLuckNexttimeAnimation from './BetterLuckNexttimeAnimation';

interface TripleTicketAnimationProps {
    player: PlayerResult;
    onClose?: () => void;
    autoHideMs?: number;
    level3Status?: 'selected' | 'not_selected';
}

const TripleTicketAnimation: React.FC<TripleTicketAnimationProps> = ({ player, onClose, autoHideMs = 60000, level3Status = 'selected' }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, autoHideMs);

        return () => clearTimeout(t);
    }, [autoHideMs, onClose]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center pointer-events-auto">
            {/* Dark semi-transparent backdrop - Static blur is safer than animated backdrop-blur */}
            <div className="absolute inset-0 bg-slate-900/98 backdrop-blur-md animate-in fade-in duration-500" />

            {/* Background Ambience - Simplified to avoid heavy repaints */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-yellow-500/20 rounded-full blur-[80px]"></div>
                {/* Reduced number of animated elements */}
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-[90rem] mx-auto px-2 sm:px-4 py-4 flex flex-col h-full max-h-screen overflow-y-auto">

                {/* Header - No absolute close button here anymore */}
                <div className="text-center mb-4 shrink-0">
                    <h2 className={`text-3xl sm:text-5xl font-heading font-black text-transparent bg-clip-text bg-linear-to-r drop-shadow-sm animate-in slide-in-from-top-4 duration-500 ${level3Status === 'selected' ? 'from-yellow-300 via-white to-cyan-300' : 'from-yellow-400 via-white to-yellow-200'}`}>
                        {level3Status === 'selected' ? 'TRIPLE QUALIFICATION!' : 'LEVEL 2 CLEARED!'}
                    </h2>
                    <p className="text-white/90 text-lg mt-2 font-bold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                        {level3Status === 'selected' ? 'Incredible! You have cleared all three levels!' : 'Congratulations on passing Level 2!'}
                    </p>
                </div>

                {/* Tickets Grid */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 pb-8 w-full">

                    {/* Level 1 Ticket */}
                    <div className="w-full max-w-[320px] transform transition-transform duration-500 hover:scale-105">
                        <div className="animate-in zoom-in-95 duration-500 fill-mode-forwards" style={{ animationDelay: '100ms' }}>
                            <div className="text-center mb-2">
                                <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-200 border border-yellow-400/50 font-black uppercase tracking-[0.2em] text-[10px]">
                                    Level 1
                                </span>
                            </div>
                            <DoubleEagleTicketAnimation
                                player={player}
                                embedded={true}
                            />
                        </div>
                    </div>

                    {/* Level 2 Ticket */}
                    <div className="w-full max-w-[320px] transform transition-transform duration-500 hover:scale-105">
                        <div className="animate-in zoom-in-95 duration-500 fill-mode-forwards" style={{ animationDelay: '200ms' }}>
                            <div className="text-center mb-2">
                                <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 font-black uppercase tracking-[0.2em] text-[10px]">
                                    Level 2
                                </span>
                            </div>
                            <KohinoorTicketAnimation
                                player={player}
                                embedded={true}
                            />
                        </div>
                    </div>

                    {/* Level 3 Ticket or Better Luck */}
                    <div className="w-full max-w-[320px] transform transition-transform duration-500 hover:scale-105">
                        <div className="animate-in zoom-in-95 duration-500 fill-mode-forwards" style={{ animationDelay: '300ms' }}>
                            <div className="text-center mb-2">
                                <span className={`inline-block px-3 py-1 rounded-full border font-black uppercase tracking-[0.2em] text-[10px] ${level3Status === 'selected' ? 'bg-slate-500/20 text-slate-200 border-slate-400/50' : 'bg-slate-500/20 text-slate-200 border-slate-400/50'}`}>
                                    Level 3 Result
                                </span>
                            </div>
                            {level3Status === 'selected' ? (
                                <PlatinumTicketAnimation
                                    player={player}
                                    embedded={true}
                                />
                            ) : (
                                <BetterLuckNexttimeAnimation embedded={true} levelText="Level 3 Result" />
                            )}
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Fixed Close Button for Mobile Accessibility - High Visibility */}
            <div className="fixed top-4 right-4 z-[100001]">
                <button
                    onClick={() => { setVisible(false); onClose?.(); }}
                    className="p-3 bg-black/60 hover:bg-black/80 rounded-full text-white border border-white/30 shadow-[0_0_20px_rgba(0,0,0,0.5)] active:scale-95 transition-all group"
                    aria-label="Close"
                >
                    <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default TripleTicketAnimation;
