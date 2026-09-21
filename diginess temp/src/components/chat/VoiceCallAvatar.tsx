import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Loader2, Phone } from 'lucide-react';

interface VoiceCallAvatarProps {
    isSpeaking: boolean;
    isListening: boolean;
    isLoading: boolean;
    callStartTime: number; // Date.now() value when the call started
}

const VoiceCallAvatar = ({ isSpeaking, isListening, isLoading, callStartTime }: VoiceCallAvatarProps) => {
    const [elapsed, setElapsed] = useState('00:00');

    // Call duration timer
    useEffect(() => {
        const interval = setInterval(() => {
            const diff = Math.floor((Date.now() - callStartTime) / 1000);
            const mins = String(Math.floor(diff / 60)).padStart(2, '0');
            const secs = String(diff % 60).padStart(2, '0');
            setElapsed(`${mins}:${secs}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [callStartTime]);

    // Determine current visual state
    const state = isSpeaking ? 'speaking' : isListening ? 'listening' : isLoading ? 'loading' : 'idle';

    const stateConfig = {
        speaking: {
            label: 'Speaking…',
            color: '#4ADE80',       // green
            glowColor: 'rgba(74, 222, 128, 0.35)',
            ringColor: 'rgba(74, 222, 128, 0.25)',
            icon: <Volume2 size={18} className="text-green-400" />,
        },
        listening: {
            label: 'Listening…',
            color: '#F87171',       // red
            glowColor: 'rgba(248, 113, 113, 0.35)',
            ringColor: 'rgba(248, 113, 113, 0.25)',
            icon: <Mic size={18} className="text-red-400" />,
        },
        loading: {
            label: 'Thinking…',
            color: '#FACC15',       // yellow
            glowColor: 'rgba(250, 204, 21, 0.25)',
            ringColor: 'rgba(250, 204, 21, 0.15)',
            icon: <Loader2 size={18} className="text-yellow-400 animate-spin" />,
        },
        idle: {
            label: 'Connected',
            color: '#CCFF00',       // SSPL Tennis Ball Green
            glowColor: 'rgba(204, 255, 0, 0.2)',
            ringColor: 'rgba(204, 255, 0, 0.12)',
            icon: <Phone size={18} className="text-[#CCFF00]" />,
        },
    };

    const cfg = stateConfig[state];

    // Sound wave bars for listening / speaking
    const waveBars = Array.from({ length: 5 });

    return (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
            style={{
                background: 'radial-gradient(ellipse at center, #0f1b3d 0%, #001b69 70%, #070d1f 100%)',
            }}
        >
            {/* Pulsing Rings */}
            <div className="relative flex items-center justify-center">
                {/* Ring 3 — outermost */}
                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: 220, height: 220,
                        border: `2px solid ${cfg.ringColor}`,
                        boxShadow: `0 0 30px ${cfg.glowColor}`,
                    }}
                    animate={
                        state === 'speaking'
                            ? { scale: [1, 1.18, 1], opacity: [0.3, 0.6, 0.3] }
                            : state === 'listening'
                                ? { scale: [1, 1.12, 1], opacity: [0.25, 0.5, 0.25] }
                                : { scale: [1, 1.05, 1], opacity: [0.15, 0.3, 0.15] }
                    }
                    transition={{ duration: state === 'speaking' ? 0.8 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Ring 2 */}
                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: 180, height: 180,
                        border: `2px solid ${cfg.ringColor}`,
                        boxShadow: `0 0 20px ${cfg.glowColor}`,
                    }}
                    animate={
                        state === 'speaking'
                            ? { scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }
                            : state === 'listening'
                                ? { scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }
                                : { scale: [1, 1.03, 1], opacity: [0.2, 0.35, 0.2] }
                    }
                    transition={{ duration: state === 'speaking' ? 0.7 : 2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                />
                {/* Ring 1 — closest */}
                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: 145, height: 145,
                        border: `2.5px solid ${cfg.ringColor}`,
                        boxShadow: `0 0 15px ${cfg.glowColor}`,
                    }}
                    animate={
                        state === 'speaking'
                            ? { scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }
                            : state === 'listening'
                                ? { scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }
                                : { scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] }
                    }
                    transition={{ duration: state === 'speaking' ? 0.6 : 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />

                {/* Core Avatar Circle */}
                <motion.div
                    className="relative z-10 rounded-full overflow-hidden flex items-center justify-center"
                    style={{
                        width: 120,
                        height: 120,
                        background: 'linear-gradient(135deg, #1a2745 0%, #0f1b3d 100%)',
                        border: `3px solid ${cfg.color}`,
                        boxShadow: `0 0 25px ${cfg.glowColor}, inset 0 0 20px rgba(0,0,0,0.5)`,
                    }}
                    animate={
                        state === 'speaking'
                            ? { scale: [1, 1.04, 1] }
                            : state === 'listening'
                                ? { scale: [1, 1.02, 1] }
                                : { scale: [1, 1.01, 1] }
                    }
                    transition={{
                        duration: state === 'speaking' ? 0.5 : 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <img
                        src="/ssplt10-logo.webp"
                        alt="SSPL T10 Voice Assistant"
                        className="w-16 h-16 object-contain drop-shadow-lg"
                    />
                </motion.div>
            </div>

            {/* Sound Wave Visualizer */}
            <AnimatePresence>
                {(state === 'speaking' || state === 'listening') && (
                    <motion.div
                        className="flex items-end gap-1 mt-6 h-8"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {waveBars.map((_, i) => (
                            <motion.div
                                key={i}
                                className="rounded-full"
                                style={{
                                    width: 4,
                                    backgroundColor: cfg.color,
                                    opacity: 0.8,
                                }}
                                animate={{
                                    height: state === 'speaking'
                                        ? [8, 24 + Math.random() * 12, 10, 28 + Math.random() * 8, 8]
                                        : [6, 14 + Math.random() * 8, 8, 16 + Math.random() * 6, 6],
                                }}
                                transition={{
                                    duration: state === 'speaking' ? 0.4 + i * 0.08 : 0.6 + i * 0.1,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: i * 0.07,
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rotating loader for thinking state */}
            {state === 'loading' && (
                <motion.div
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2 size={28} className="text-yellow-400 animate-spin" />
                </motion.div>
            )}

            {/* Status Label */}
            <motion.div
                className="mt-5 flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${cfg.ringColor}`,
                }}
                key={state}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {cfg.icon}
                <span className="text-sm font-medium text-white/90">{cfg.label}</span>
            </motion.div>

            {/* Call Duration */}
            <p className="mt-3 text-xs text-white/40 font-mono tracking-widest">{elapsed}</p>

            {/* Brand label */}
            <p className="mt-4 text-[10px] text-white/25 uppercase tracking-[0.2em]">SSPL Voice Support</p>
        </div>
    );
};

export default VoiceCallAvatar;
