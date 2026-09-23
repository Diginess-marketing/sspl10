import React, { useEffect, useState } from 'react';
import { X, Star } from 'lucide-react';
import type { PlayerResult } from '@/types/playerData';

// Import the existing animations
import DoubleEagleTicketAnimation from './GoldenTicketAnimation';
import KohinoorTicketAnimation from './KohinoorTicketAnimation';
import BetterLuckNexttimeAnimation from './BetterLuckNexttimeAnimation';

interface CombinedTicketAnimationProps {
    player: PlayerResult;
    onClose?: () => void;
    autoHideMs?: number;
    level2Status: 'selected' | 'not_selected';
}

const CombinedTicketAnimation: React.FC<CombinedTicketAnimationProps> = ({ player, onClose, autoHideMs = 60000, level2Status }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(false);
            onClose?.();
        }, autoHideMs);

        return () => clearTimeout(t);
    }, [autoHideMs, onClose]);

    if (!visible) return null;

    const isDoubleQualification = level2Status === 'selected';

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center pointer-events-auto">
            {/* Dark semi-transparent backdrop */}
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-500" />

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Blue/Gold Mixing Gradient */}
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-yellow-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

                {/* Floating Particles */}
                <div className="absolute inset-0">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full animate-[float_5s_ease-in-out_infinite]"
                            style={{
                                backgroundColor: i % 2 === 0 ? '#FFD700' : '#00FFFF',
                                width: `${Math.random() * 6 + 2  }px`,
                                height: `${Math.random() * 6 + 2  }px`,
                                left: `${Math.random() * 100  }%`,
                                top: `${Math.random() * 100  }%`,
                                animationDelay: `${Math.random() * 5  }s`,
                                opacity: 0.6,
                            }}
                        />
                    ))}
                </div>
                {/* Fireworks/Confetti bursts - Only for double qualification */}
                {isDoubleQualification && (
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75 duration-1000"></div>
                        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75 duration-1500 delay-500"></div>
                        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-75 duration-1200 delay-200"></div>
                    </div>
                )}
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col h-full max-h-screen overflow-y-auto">

                {/* Header - No absolute close button here anymore */}
                <div className="text-center mb-8 shrink-0">
                    <h2 className={`text-4xl sm:text-6xl font-heading font-black text-transparent bg-clip-text bg-linear-to-r drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-in slide-in-from-top-4 duration-700 ${isDoubleQualification ? 'from-yellow-300 via-white to-cyan-300' : 'from-yellow-400 via-white to-yellow-200'}`}>
                        {isDoubleQualification ? 'DOUBLE QUALIFICATION!' : 'LEVEL 1 CLEARED!'}
                    </h2>
                    <p className="text-white/90 text-xl mt-4 font-bold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                        {isDoubleQualification ? 'You have reached an elite milestone!' : 'Congratulations on passing Level 1!'}
                    </p>
                </div>

                {/* Tickets Grid */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 pb-12 w-full">

                    {/* Left: Level 1 Ticket */}
                    <div className="w-full max-w-sm perspective-1000">
                        <div className="animate-flip-in-y" style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}>
                            <div className="text-center mb-4 transform transition-all duration-500 hover:scale-110">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-linear-to-r from-yellow-500/20 to-amber-500/20 text-yellow-200 border border-yellow-400/50 font-black uppercase tracking-[0.2em] text-xs backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                    Level 1 Achievement
                                </span>
                            </div>
                            <DoubleEagleTicketAnimation
                                player={player}
                                embedded={true}
                            />
                        </div>
                    </div>

                    {/* Divider (Desktop) */}
                    <div className="hidden lg:flex flex-col items-center justify-center gap-4 text-white/50 relative animate-in fade-in duration-1000 delay-500">
                        <div className="h-24 w-0.5 bg-linear-to-b from-transparent via-white/50 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                        <Star className={`w-6 h-6 text-white animate-[spin_3s_linear_infinite] drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] ${isDoubleQualification ? 'text-cyan-200' : 'text-yellow-200'}`} />
                        <div className="h-24 w-0.5 bg-linear-to-t from-transparent via-white/50 to-transparent shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    </div>

                    {/* Right: Level 2 Ticket OR Better Luck */}
                    <div className="w-full max-w-sm perspective-1000">
                        <div className="animate-flip-in-y" style={{ animationDelay: '600ms', opacity: 0, animationFillMode: 'forwards' }}>
                            <div className="text-center mb-4 transform transition-all duration-500 hover:scale-110">
                                <span className={`inline-block px-4 py-1.5 rounded-full border font-black uppercase tracking-[0.2em] text-xs backdrop-blur-md ${isDoubleQualification ? 'bg-linear-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-linear-to-r from-slate-500/20 to-gray-500/20 text-slate-200 border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.3)]'}`}>
                                    Level 2 Result
                                </span>
                            </div>
                            {isDoubleQualification ? (
                                <KohinoorTicketAnimation
                                    player={player}
                                    embedded={true}
                                />
                            ) : (
                                <BetterLuckNexttimeAnimation embedded={true} />
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

export default CombinedTicketAnimation;
