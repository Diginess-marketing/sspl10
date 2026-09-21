import React, { useEffect, useState, useRef } from 'react';
import { Star, X, Sparkles, PartyPopper, Download, RotateCw } from 'lucide-react';
import type { PlayerResult } from '@/types/playerData';
import './GoldenTicketAnimation.css';
import html2pdf from 'html2pdf.js';

interface TitanTicketAnimationProps {
    player: PlayerResult;
    onClose?: () => void;
    autoHideMs?: number;
    embedded?: boolean;
}

// Titan Ticket celebration overlay for selected players (Level 5)
const TitanTicketAnimation: React.FC<TitanTicketAnimationProps> = ({ player, onClose, autoHideMs = 60000, embedded = false }) => {
    const [visible, setVisible] = useState(true);
    const [showBurst, setShowBurst] = useState(!embedded);
    const [isRotating, setIsRotating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const ticketRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        setVisible(false);
        onClose?.();
    };

    useEffect(() => {
        if (!embedded) {
            if (autoHideMs && autoHideMs < 999999) {
                const t = setTimeout(handleClose, autoHideMs);
                return () => clearTimeout(t);
            }

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') handleClose();
            };
            window.addEventListener('keydown', handleKeyDown);

            window.history.pushState({ modalOpen: true }, '');
            const handlePopState = () => handleClose();
            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [autoHideMs, onClose, embedded]);

    useEffect(() => {
        if (!embedded) {
            const burstTimer = setTimeout(() => {
                setShowBurst(false);
            }, 2000);
            return () => clearTimeout(burstTimer);
        }
    }, [embedded]);

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        setIsDownloading(true);

        const element = ticketRef.current;
        const opt = {
            margin: 0,
            filename: `SSPL_PlayerTitan_Ticket_${player.name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        try {
            await html2pdf().set(opt as any).from(element).save();
        } catch (e) {
            console.error("Download failed", e);
        } finally {
            setIsDownloading(false);
        }
    };

    if (!visible && !embedded) return null;

    const ticketContent = (
        <div className={`relative z-10 w-full max-w-xl mx-auto transition-all duration-700 ${isRotating ? 'animate-[spin_4s_linear_infinite]' : (embedded ? '' : 'animate-in zoom-in-95 duration-300 ease-out')}`} style={{ transformStyle: 'preserve-3d' }}>
            {/* Controls Container - Relative to Ticket */}
            <div className={`absolute top-4 right-4 z-[60] flex gap-2 ${embedded ? '-top-12 right-0' : ''} no-print`}>
                <button
                    onClick={() => setIsRotating(!isRotating)}
                    className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm"
                    title="Spin Ticket"
                >
                    <RotateCw className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} />
                </button>
                <button
                    onClick={handleDownload}
                    className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm"
                    title="Download Ticket"
                    disabled={isDownloading}
                >
                    <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                </button>
                {!embedded && (
                    <button
                        onClick={handleClose}
                        className="p-2 bg-red-600/80 hover:bg-red-700 rounded-full text-white transition-all backdrop-blur-sm"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Ticket Body */}
            <div ref={ticketRef} className="relative bg-linear-to-br from-[#E5FF7F] via-[#D4FF33] to-[#CCFF00] rounded-2xl p-1.5 shadow-2xl border-2 border-yellow-300/80">
                <div className="bg-linear-to-b from-[#f5ffcc] via-[#ebff99] to-[#d4ff33] rounded-xl border-4 border-double border-[#CCFF00] p-5 relative overflow-hidden">
                    <div className="text-center space-y-3 relative z-10">
                        <div className="flex justify-center">
                            <img src="/blue-logo.png" alt="SSPL Logo" className="h-14 w-auto object-contain" />
                        </div>

                        <div className="relative py-1">
                            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tighter mb-2 leading-none" style={{ color: '#1E293B' }}>
                                PLAYER TITAN<br />TICKET
                            </h2>
                            <div className="h-1 w-36 bg-linear-to-r from-transparent via-[#CCFF00] to-transparent mx-auto rounded-full"></div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-white/60 border-2 border-slate-300/80 rounded-lg p-3 shadow-inner">
                                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#334155' }}>Player Name</p>
                                <h3 className="text-2xl font-black tracking-tight" style={{ color: '#0F172A' }}>
                                    {player.name}
                                </h3>
                            </div>
                            <div className="bg-white/40 rounded-lg p-3 border-2 border-slate-300/60">
                                <p className="text-xs font-bold uppercase mb-1 tracking-wider" style={{ color: '#334155' }}>Mobile Number</p>
                                <p className="font-black text-xl" style={{ color: '#0F172A' }}>{player.mobile}</p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="inline-block bg-linear-to-r from-[#b3e600] via-[#CCFF00] to-[#e6ff33] text-black px-5 py-2 rounded-full shadow-lg border-2 border-[#b3e600]/50">
                                <span className="font-black tracking-wide flex items-center gap-2 text-sm">
                                    <Star className="w-4 h-4 fill-black" />
                                    QUALIFIED FOR AUCTION
                                    <Star className="w-4 h-4 fill-black" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (embedded) return ticketContent;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={handleClose}
            />

            {/* Close button for Mobile/Tablet */}
            <button
                onClick={handleClose}
                className="fixed top-6 right-6 z-[100001] p-3 bg-red-600 text-white rounded-full shadow-2xl hover:bg-red-700 transition-all active:scale-95"
                aria-label="Close"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="relative z-[100002] w-full max-w-xl">
                {ticketContent}
            </div>
        </div>
    );
};

export default TitanTicketAnimation;
