import React from 'react';
import { Trophy, Zap, Shield, Award, Flame, Star, ChevronRight, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MatchFixtures = () => {
    const groups = [
        { 
            id: 'A',
            name: 'Group A', 
            teams: ['A1', 'A2', 'A3'], 
            color: 'from-emerald-500/20 to-emerald-900/40',
            border: 'border-emerald-500/30',
            accent: 'emerald',
            neon: '#10b981'
        },
        { 
            id: 'B',
            name: 'Group B', 
            teams: ['B1', 'B2', 'B3'], 
            color: 'from-blue-500/20 to-blue-900/40',
            border: 'border-blue-500/30',
            accent: 'blue',
            neon: '#3b82f6'
        },
        { 
            id: 'C',
            name: 'Group C', 
            teams: ['C1', 'C2', 'C3'], 
            color: 'from-orange-500/20 to-orange-900/40',
            border: 'border-orange-500/30',
            accent: 'orange',
            neon: '#f97316'
        },
        { 
            id: 'D',
            name: 'Group D', 
            teams: ['D1', 'D2', 'D3'], 
            color: 'from-purple-500/20 to-purple-900/40',
            border: 'border-purple-500/30',
            accent: 'purple',
            neon: '#a855f7'
        },
    ];

    const quarterFinals = [
        { id: 'M1', t1: 'A1', t2: 'B2', label: 'Match 1' },
        { id: 'M2', t1: 'A2', t2: 'B1', label: 'Match 2' },
        { id: 'M3', t1: 'C1', t2: 'D2', label: 'Match 3' },
        { id: 'M4', t1: 'C2', t2: 'D1', label: 'Match 4' },
    ];

    const semiFinals = [
        { id: 'E1', t1: 'Winner M1', t2: 'Winner M2', label: 'Eliminator 1' },
        { id: 'E2', t1: 'Winner M3', t2: 'Winner M4', label: 'Eliminator 2' },
    ];

    return (
        <div className="w-full relative py-20 px-4 md:px-8 font-sans bg-[#020617] rounded-[3rem] md:rounded-[5rem] shadow-2xl border border-white/5 overflow-hidden my-12">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mb-20 text-center"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-blue-500/50"></span>
                        <span className="text-blue-400 font-bold tracking-[0.3em] uppercase text-[10px] md:text-xs">Road to Glory</span>
                        <span className="h-px w-8 bg-blue-500/50"></span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Tournament <span className="text-transparent bg-clip-text bg-linear-to-b from-white to-white/20">Brackets</span>
                    </h2>
                    <p className="mt-6 text-slate-400 max-w-2xl font-medium text-sm md:text-base tracking-wide uppercase">
                        Experience the journey from Group Battles to the Ultimate Grand Finale
                    </p>
                </motion.div>

                {/* --- STAGE 1: LEAGUE PHASE --- */}
                <div className="mb-24">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Users className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Stage 1: League Phase</h3>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Top 2 Teams Qualify • Bottom Eliminated</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {groups.map((group, idx) => (
                            <motion.div 
                                key={group.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative group`}
                            >
                                <div className={`absolute inset-0 bg-linear-to-br ${group.color} rounded-2xl blur-0 group-hover:blur-md transition-all duration-500 opacity-20`}></div>
                                <div className={`relative bg-slate-900/50 backdrop-blur-xl border ${group.border} rounded-2xl p-6 overflow-hidden h-full flex flex-col`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <h4 className="text-xl font-black text-white italic uppercase">{group.name}</h4>
                                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">{group.id}</div>
                                    </div>
                                    
                                    <div className="space-y-3 flex-1">
                                        {group.teams.map((team, tIdx) => (
                                            <div key={team} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${tIdx === 2 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/10'}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-2 h-6 rounded-full ${tIdx === 2 ? 'bg-rose-500' : (tIdx === 0 ? 'bg-emerald-500' : 'bg-blue-400')}`}></span>
                                                    <span className="font-bold text-white tracking-widest">{team}</span>
                                                </div>
                                                {tIdx === 2 ? (
                                                    <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">Eliminated</span>
                                                ) : (
                                                    <TrendingUp className="w-3 h-3 text-emerald-400 opacity-50" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                        <span>3 Matches</span>
                                        <span>Round Robin</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- STAGE 2: QUARTER FINALS --- */}
                <div className="mb-24 relative">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Shield className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Stage 2: Quarter Finals</h3>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">The Elite Knockout Begins</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quarterFinals.map((match, idx) => (
                            <motion.div 
                                key={match.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="relative"
                            >
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-12 w-px bg-linear-to-b from-emerald-500/0 to-blue-500/50 hidden lg:block"></div>
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-blue-500/40 transition-all group">
                                    <div className="text-[10px] font-black text-blue-400 mb-4 uppercase tracking-[0.3em] flex items-center justify-between">
                                        <span>{match.label}</span>
                                        <Zap className="w-3 h-3 animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        {[match.t1, match.t2].map((team, teamIdx) => (
                                            <div key={teamIdx} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5 group-hover:border-blue-500/20 transition-all">
                                                <span className="font-bold text-white tracking-widest">{team}</span>
                                                <div className="w-5 h-5 rounded bg-blue-500/10 border border-blue-500/20"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* --- STAGE 3 & 4: SEMIS & FINALE --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative">
                    {/* Semi Finals Container */}
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <Flame className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Semi Finals</h3>
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Gateway to History</p>
                            </div>
                        </div>

                        <div className="space-y-8 relative">
                            {semiFinals.map((match, idx) => (
                                <motion.div 
                                    key={match.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="bg-linear-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                        <Trophy className="w-16 h-16 text-white" />
                                    </div>
                                    <div className="text-xs font-black text-purple-400 mb-6 uppercase tracking-[0.4em]">{match.label}</div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 text-center bg-white/5 rounded-2xl p-4 border border-white/10 group-hover:border-purple-500/30 transition-all">
                                            <span className="text-lg font-black text-white italic tracking-tighter">{match.t1}</span>
                                        </div>
                                        <div className="text-xl font-black text-white italic opacity-20">VS</div>
                                        <div className="flex-1 text-center bg-white/5 rounded-2xl p-4 border border-white/10 group-hover:border-blue-500/30 transition-all">
                                            <span className="text-lg font-black text-white italic tracking-tighter">{match.t2}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-center">
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                                            <Award className="w-3 h-3 text-yellow-400" />
                                            <span className="text-[9px] font-black text-white/50 tracking-widest">ONE STEP FROM FINALS</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Grand Finale Container */}
                    <div className="relative">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                                <Trophy className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Grand Finale</h3>
                                <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">Eternal Glory Card</p>
                            </div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative group"
                        >
                            {/* Animated Background Glow */}
                            <div className="absolute -inset-1 bg-linear-to-r from-yellow-500 via-orange-500 to-yellow-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            
                            <div className="relative bg-slate-900 border border-yellow-500/30 p-10 md:p-14 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center">
                                {/* Celebratory SVGs (Sparkles/Stars) */}
                                <div className="absolute inset-0 pointer-events-none opacity-30">
                                    {[...Array(20)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ 
                                                scale: [1, 1.5, 1],
                                                opacity: [0.3, 0.7, 0.3],
                                            }}
                                            transition={{ 
                                                duration: 2 + Math.random() * 2,
                                                repeat: Infinity,
                                                delay: Math.random() * 2
                                            }}
                                            style={{ 
                                                top: `${Math.random() * 100}%`,
                                                left: `${Math.random() * 100}%`
                                            }}
                                            className="absolute"
                                        >
                                            <Star className="w-2 h-2 text-yellow-400 fill-yellow-400" />
                                        </motion.div>
                                    ))}
                                </div>

                                <Trophy className="w-20 h-20 text-yellow-400 mb-8 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] bg-yellow-400/10 p-4 rounded-3xl border border-yellow-400/20" />
                                
                                <h4 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-2 text-center">
                                    The <span className="text-yellow-400">Grand</span> Finale
                                </h4>
                                <div className="h-1 w-24 bg-linear-to-r from-transparent via-yellow-400 to-transparent mb-10"></div>

                                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full justify-center mb-10">
                                    <div className="flex-1 text-center bg-white/5 border border-white/10 p-6 rounded-2xl w-full">
                                        <span className="text-[10px] font-black text-white/30 block mb-2 tracking-[0.3em]">FINALIST 1</span>
                                        <span className="text-2xl font-black text-white italic">E1 WINNER</span>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-yellow-500/50 flex items-center justify-center relative z-10 shrink-0">
                                        <span className="text-lg font-black text-yellow-400">VS</span>
                                    </div>
                                    <div className="flex-1 text-center bg-white/5 border border-white/10 p-6 rounded-2xl w-full">
                                        <span className="text-[10px] font-black text-white/30 block mb-2 tracking-[0.3em]">FINALIST 2</span>
                                        <span className="text-2xl font-black text-white italic">E2 WINNER</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 group-hover:border-yellow-500/20 transition-all">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                                    <span className="text-xs font-black text-white tracking-[0.4em] text-center">CHAMPIONS LEAGUE SERIES</span>
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Custom Animations Styling */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shine {
                    from { transform: translateX(-100%) skewX(45deg); }
                    to { transform: translateX(200%) skewX(45deg); }
                }
                .shine-effect {
                    position: relative;
                    overflow: hidden;
                }
                .shine-effect::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 50px;
                    height: 100%;
                    background: rgba(255,255,255,0.2);
                    filter: blur(20px);
                    animation: shine 4s infinite;
                }
            `}} />
        </div>
    );
};

export default MatchFixtures;
