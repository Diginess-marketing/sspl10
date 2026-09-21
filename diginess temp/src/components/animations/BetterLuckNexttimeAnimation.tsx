import React from 'react';
import { RefreshCcw, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BetterLuckNexttimeAnimationProps {
    embedded?: boolean;
    levelText?: string;
}

const BetterLuckNexttimeAnimation: React.FC<BetterLuckNexttimeAnimationProps> = ({ embedded = false, levelText = "Level 2 Result" }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className={`relative z-10 w-full max-w-xl mx-auto transition-all duration-1000 ${embedded ? '' : 'animate-in zoom-in-95 duration-700'}`} style={{ transformStyle: 'preserve-3d' }}>
                {/* Main Card Container - Silver/Grey Theme */}
                <div className="relative bg-linear-to-br from-slate-100 via-gray-200 to-slate-200 rounded-2xl p-2 shadow-2xl shadow-gray-400/50 transform transition-all duration-500 border-2 border-slate-300">

                    {/* Inner Content */}
                    <div className="bg-linear-to-b from-white via-slate-50 to-gray-100 rounded-xl border-4 border-double border-slate-400 p-8 relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center">

                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
                        </div>

                        {/* Icon */}
                        <div className="mb-6 p-4 bg-slate-100 rounded-full shadow-inner animate-[pulse_3s_ease-in-out_infinite]">
                            <HeartHandshake className="w-16 h-16 text-slate-500" />
                        </div>

                        {/* Text Content */}
                        <h2 className="text-3xl sm:text-4xl font-heading font-black mb-4 tracking-tight drop-shadow-sm" style={{ color: '#334155' }}>
                            BETTER LUCK<br />NEXT TIME
                        </h2>

                        <div className="h-1 w-24 bg-slate-300 mx-auto rounded-full mb-6"></div>

                        <p className="font-medium text-lg max-w-sm mx-auto leading-relaxed" style={{ color: '#475569' }}>
                            You've shown great potential! Keep practicing and come back stronger!
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/register');
                            }}
                            className="mt-8 flex items-center justify-center gap-2 px-6 py-2 bg-slate-200 hover:bg-slate-300 transition-colors text-sm font-bold uppercase tracking-widest rounded-full shadow-sm hover:shadow-md cursor-pointer relative z-50"
                            style={{ color: '#475569' }}
                        >
                            <RefreshCcw className="w-4 h-4 hover:animate-spin-once" />
                            Re-Register
                        </button>

                        {/* Level Indicator */}
                        {levelText && (
                            <>
                                <div className="absolute top-1/2 -right-8 transform rotate-90 text-[10px] font-bold text-slate-300 tracking-[0.5em] uppercase pointer-events-none">
                                    {levelText}
                                </div>
                                <div className="absolute top-1/2 -left-8 transform -rotate-90 text-[10px] font-bold text-slate-300 tracking-[0.5em] uppercase pointer-events-none">
                                    {levelText}
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
};

export default BetterLuckNexttimeAnimation;
