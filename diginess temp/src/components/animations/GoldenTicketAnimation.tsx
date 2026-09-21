import React, { useEffect, useState, useRef } from 'react';
import { Star, X, Sparkles, Download, RotateCw } from 'lucide-react';
import type { PlayerResult } from '@/types/playerData';
import './GoldenTicketAnimation.css';
import html2pdf from 'html2pdf.js';

interface DoubleEagleTicketAnimationProps {
  player: PlayerResult;
  onClose?: () => void;
  autoHideMs?: number;
  embedded?: boolean;
}

const DoubleEagleTicketAnimation: React.FC<DoubleEagleTicketAnimationProps> = ({ player, onClose, autoHideMs = 60000, embedded = false }) => {
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
      // Auto hide logic
      if (autoHideMs && autoHideMs < 999999) {
        const t = setTimeout(handleClose, autoHideMs);
        return () => clearTimeout(t);
      }

      // ESC key support
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      // Back button support
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
      filename: `SSPL_DoubleEagle_Ticket_${player.name.replace(/\s+/g, '_')}.pdf`,
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
    <div
      className={`relative z-10 w-full max-w-xl mx-auto transition-transform duration-700 preserve-3d ${isRotating ? 'animate-[spin_4s_linear_infinite]' : (embedded ? '' : 'animate-in zoom-in-95 duration-300 ease-out')}`}
    >
      {/* Controls - Positioned relative to Ticket */}
      <div className={`absolute top-4 right-4 z-[60] flex gap-2 ${embedded ? '-top-12 right-0' : ''} no-print`}>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors backdrop-blur-md shadow-lg"
          title="Spin Ticket"
        >
          <RotateCw className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={handleDownload}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors backdrop-blur-md shadow-lg"
          title="Download Ticket"
          disabled={isDownloading}
        >
          <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
        </button>
        {!embedded && (
          <button
            onClick={handleClose}
            className="p-2 bg-red-600/80 hover:bg-red-700 rounded-full text-white transition-colors backdrop-blur-md shadow-lg"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Ticket Body */}
      <div ref={ticketRef} className="relative bg-linear-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-2xl p-1.5 shadow-2xl">
        <div className="bg-linear-to-b from-yellow-50 via-amber-50 to-yellow-100 rounded-xl border-[3px] border-double border-yellow-600 p-6 relative overflow-hidden text-center h-full">
          {/* Logo Area */}
          <div className="relative z-10 mb-4">
            <div className="h-16 flex items-center justify-center">
              <img src="/blue-logo.png" alt="SSPL Logo" className="h-full w-auto object-contain" />
            </div>
          </div>

          {/* Title */}
          <div className="relative z-10 mb-6">
            <h2 className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tighter leading-none" style={{ color: '#4a3222' }}>
              DOUBLE EAGLE<br />TICKET
            </h2>
            <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full mt-2" />
          </div>

          {/* Player Details */}
          <div className="space-y-4 relative z-10">
            <div className="bg-white/60 border border-yellow-200 rounded-lg p-3 shadow-inner">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#92400e' }}>Player</p>
              <h3 className="text-2xl font-black tracking-tight" style={{ color: '#000000' }}>
                {player.name}
              </h3>
            </div>
            <div className="bg-white/40 border border-yellow-200/50 rounded-lg p-2.5">
              <p className="text-[10px] font-bold uppercase mb-0.5" style={{ color: '#92400e' }}>Mobile</p>
              <p className="font-bold text-lg" style={{ color: '#000000' }}>{player.mobile}</p>
            </div>
          </div>

          {/* Qualification Badge */}
          <div className="mt-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-yellow-500 to-amber-600 text-white px-6 py-2 rounded-full shadow-lg">
              <Star className="w-4 h-4 fill-yellow-200" />
              <span className="font-bold tracking-wide text-sm">QUALIFIED LEVEL 2</span>
              <Star className="w-4 h-4 fill-yellow-200" />
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
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" 
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

      {/* Ticket with simplified animation */}
      <div className="relative z-[100002] w-full max-w-xl">
        {ticketContent}
      </div>
    </div>
  );
};

export default DoubleEagleTicketAnimation;
