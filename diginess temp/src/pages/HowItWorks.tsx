import type { CSSProperties } from 'react';
import { useWebsiteContent } from '@/hooks/useWebsiteContent';
import { CheckCircle2, Trophy, Users, Star, Shield, Zap, Target, Award } from 'lucide-react';
import MatchFixtures from '@/components/MatchFixtures';

const HowItWorks = () => {
    const { getContent, loading } = useWebsiteContent();
    const dbContent = getContent('how_it_works');

    // Default content structure based on user input
    const content = {
        title: dbContent.title || 'SSPL Dynamic Format',
        tagline: dbContent.tagline || "SSPL breaks barriers by offering unprecedented access to undiscovered talent from all corners of India's.",
        formatHeading: 'Format Details',
        description: '',
        formatSteps: [
            { title: 'Teams', description: 'SSPL-T10 Season 1 will feature 12 teams, each consisting of 25 players.', icon: Users },
            { title: 'Age Requirement', description: 'Boys 12+ can register for trial.', icon: CheckCircle2 },
            { title: 'Matches', description: '21 matches to be played. Top 4 teams would qualify for playoffs.', icon: Trophy },
            { title: 'Player Opportunity', description: 'Each player to play a minimum of 1 match in a league.', icon: Star },
        ],
        highlightsHeading: 'League Highlights',
        highlights: [
            { title: 'FINALS AT SHARJAH', description: "First ever tennis ball cricket League in India's to be played in the Stadium." },
            { title: 'CELEBRITY PATRON', description: 'Ravi Mohan serves as the celebrity face and patron of the league.' },
            { title: '12 Franchisees', description: 'Representing different states, they will compete in the inaugural season. Who will take the crown?' },
            { title: '500 PLAYERS', description: 'The tournament boasts an impressive lineup of cricketing talent, promising thrilling matches and intense competition.' },
            { title: '4 WEEKS', description: 'Of nonstop tennis ball cricket action delivering high quality entertainment. 21 matches across the season.' },
        ],
    };

    return (
        <div className="min-h-screen bg-[#001b69] relative z-10">
            <main className="pt-0">

                {/* Hero — sunlit pitch photo, dark on the right for the title */}
                <div
                    className="brand-hero brand-hero--scrim-right py-20 md:py-28"
                    style={{ '--brand-hero-img': "url('/assets/page-heroes/how-it-works-hero.png')" } as CSSProperties}
                >
                    <span className="brand-diagonal-accent" style={{ bottom: 0 }} />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
                        <h1 className="brand-h2 brand-h2--on-dark mb-4 ml-auto">
                            {content.title}
                        </h1>
                        <p className="brand-lead brand-lead--on-dark ml-auto max-w-xl">
                            {content.tagline}
                        </p>
                    </div>
                </div>

                {/* Format Section with Side-by-Side Layout */}
                <section className="py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
                            
                            {/* Dynamic Format Image on Right (LG) */}
                            <div className="flex-1 w-full lg:w-auto">
                                <div className="bg-[#0A1929]/50 backdrop-blur-sm p-4 md:p-6 rounded-3xl shadow-2xl border border-white/5">
                                    <img
                                        src="/dynamic-format-highlight.png"
                                        alt="SSPL Dynamic Format Highlights"
                                        className="w-full h-auto rounded-2xl shadow-lg border border-white/5"
                                    />
                                </div>
                            </div>

                            {/* Format Details Cards on Left (LG) */}
                            <div className="flex-1 w-full lg:w-auto text-left">
                                <div className="mb-10">
                                    <h2 className="brand-h2 brand-h2--on-dark mb-4 border-l-4 border-sspl-orange pl-4">
                                        {content.formatHeading}
                                    </h2>
                                    <p className="brand-lead brand-lead--on-dark max-w-xl">
                                        Understanding our unique tournament structure designed to maximize player exposure and competition.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {content.formatSteps.map((step, index) => (
                                        <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-sspl-orange/30 hover:shadow-xl transition-all group text-left">
                                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 mb-4 group-hover:scale-110 transition-transform shadow-md">
                                                <step.icon className="w-6 h-6 text-[#CCFF00]" />
                                            </div>
                                            <h3 className="text-lg font-bold mb-2 !text-white uppercase tracking-wide group-hover:text-[#CCFF00] transition-colors">{step.title}</h3>
                                            <p className="!text-white/80 text-sm leading-relaxed">{step.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SSPL Player Journey Flowchart (High Fidelity) */}
                <section className="py-24 relative overflow-hidden bg-[#00134d] border-t border-white/5">
                    {/* Background Subtle Gradient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="brand-h2 brand-h2--on-dark mb-4 drop-shadow-2xl">
                                PLAYER <span className="brand-accent brand-accent--on-dark">JOURNEY</span>
                            </h2>
                            <div className="h-2 w-48 bg-linear-to-r from-[#CCFF00] to-green-500 mx-auto rounded-full mb-6"></div>
                        </div>

                        {/* Flowchart Container */}
                        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-4 lg:min-h-[900px]">
                            
                            {/* Left Column: PREPARATION (L0) */}
                            <div className="lg:col-span-3 flex flex-col gap-16 z-20">
                                {/* Registration Box */}
                                <div className="p-8 bg-white backdrop-blur-md rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center text-center group hover:scale-105 transition-all duration-500 border-b-8 border-blue-600 relative overflow-hidden">
                                    <div className="w-24 h-24 mb-6 relative z-10">
                                        <img src="/registration-node.png" alt="Registration" className="w-full h-full object-contain group-hover:rotate-12 transition-transform duration-700" />
                                    </div>
                                    <h3 className="text-3xl font-black !text-blue-950 uppercase leading-none mb-2">Registration<br/>of Players</h3>
                                    <p className="!text-blue-950 text-xs font-bold tracking-widest uppercase">Start Your Career</p>
                                </div>
                                
                                {/* Dotted Arrow 1 */}
                                <div className="flex justify-center h-16">
                                    <div className="w-1 border-r-4 border-dotted border-white/20 relative">
                                        <div className="absolute -bottom-2 -left-[9px] w-5 h-5 text-white/40">
                                            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-white/40"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Selection Process Box */}
                                <div className="p-8 bg-white backdrop-blur-md rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center text-center group hover:scale-105 transition-all duration-500 border-b-8 border-blue-800 relative overflow-hidden">
                                    <div className="w-24 h-24 mb-6 relative z-10">
                                        <img src="/selection-node.png" alt="Selection" className="w-full h-full object-contain group-hover:-rotate-12 transition-transform duration-700" />
                                    </div>
                                    <h3 className="text-3xl font-black !text-[#00134d] uppercase leading-none mb-2">Selection<br/>Process</h3>
                                    <p className="!text-[#00134d] text-xs font-bold tracking-widest uppercase">Expert Scouting</p>
                                </div>
                            </div>

                            {/* Middle Column: TRIALS STACK (L1-L5) */}
                            <div className="lg:col-span-6 flex flex-col items-center relative z-10 px-4">
                                <div className="w-full max-w-sm flex flex-col gap-6 relative z-10">
                                    {[
                                        { level: 'LEVEL 1', title: 'DOUBLE EAGLE', color: 'from-sky-100 to-sky-200', icon: <Target className="w-6 h-6"/> },
                                        { level: 'LEVEL 2', title: 'KOHINOOR', color: 'from-blue-100 to-blue-200', icon: <Award className="w-6 h-6"/> },
                                        { level: 'LEVEL 3', title: 'PLATINUM', color: 'from-cyan-100 to-cyan-200', icon: <Shield className="w-6 h-6"/> },
                                        { level: 'LEVEL 4', title: 'PALLADIAN', color: 'from-purple-100 to-purple-200', icon: <Zap className="w-6 h-6"/> },
                                        { level: 'LEVEL 5', title: 'PRINCE TITAN', color: 'from-slate-100 to-slate-200', icon: <Trophy className="w-6 h-6"/> },
                                    ].map((trial, idx) => (
                                        <div key={idx} className="relative group">
                                            <div className={`bg-gradient-to-r ${trial.color} p-6 text-center rounded-2xl shadow-xl border border-white/20 flex flex-col items-center relative overflow-hidden`}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-950/10 flex items-center justify-center !text-blue-950 font-bold">{trial.icon}</div>
                                                    <span className="text-xs font-black !text-blue-950 tracking-[0.3em] uppercase">{trial.level}</span>
                                                </div>
                                                <h4 className="text-2xl font-black !text-blue-950 tracking-widest leading-none mb-3 italic uppercase">{trial.title}</h4>
                                                
                                                <div className="h-px w-full bg-[#00134d]/20 mb-3"></div>
                                                
                                                {idx < 4 && (
                                                    <p className="text-[10px] font-black !text-blue-950 uppercase tracking-[0.15em] flex items-center gap-2">
                                                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> If Promoted to Next Level
                                                    </p>
                                                )}
                                                {idx === 4 && (
                                                    <p className="text-[10px] font-black !text-blue-800 uppercase tracking-[0.15em] flex items-center gap-2 animate-pulse">
                                                        <Star className="w-3 h-3 fill-current" /> Qualified for Final Stage
                                                    </p>
                                                )}
                                            </div>
                                            {/* Connector Dot */}
                                            {idx < 5 && (
                                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
                                                    <div className="w-6 h-6 bg-[#00134d] rounded-full border-2 border-white/20 flex items-center justify-center text-white shadow-lg">
                                                        <div className="w-0.5 h-2 bg-current rounded-full"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Auction Pool Banner */}
                                    <div className="mt-8 bg-linear-to-r from-[#CCFF00] to-green-400 p-8 text-center rounded-[32px] shadow-[0_0_50px_rgba(0,128,0,0.4)] border-2 border-white/50 group hover:scale-105 transition-all duration-500 relative overflow-hidden">
                                        <h3 className="text-4xl font-black !text-blue-950 italic tracking-tighter uppercase relative z-10">AUCTION POOL</h3>
                                        <p className="!text-blue-950 text-[10px] uppercase tracking-[0.4em] font-black relative z-10 mt-1">Final 12 Franchise Draft</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: LIVE LEAGUE MATCHES */}
                            <div className="lg:col-span-3 flex flex-col gap-16 items-center relative z-20">
                                {/* League Matches Rect */}
                                <div className="w-full bg-gradient-to-br from-[#CCFF00] to-green-400 p-8 rounded-[32px] flex flex-col items-center gap-4 shadow-[0_25px_50px_rgba(204,255,0,0.15)] border-t-2 border-white/50 group hover:scale-110 transition-all duration-500">
                                    <div className="w-16 h-16 bg-[#00134d] rounded-2xl flex items-center justify-center text-[#CCFF00]">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black !text-blue-950 uppercase italic leading-none text-center">League<br/>Matches</h3>
                                </div>

                                <div className="flex justify-center h-12">
                                    <div className="w-1 border-r-4 border-dotted border-[#CCFF00]/40 relative">
                                        <div className="absolute -bottom-2 -left-[9px] w-5 h-5 text-[#CCFF00]">
                                            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-current"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Playoffs Rect */}
                                <div className="w-full bg-gradient-to-br from-[#CCFF00] to-green-400 p-8 rounded-[32px] flex flex-col items-center gap-4 shadow-[0_25px_50px_rgba(204,255,0,0.15)] border-t-2 border-white/50 group hover:scale-110 transition-all duration-500">
                                    <div className="w-16 h-16 bg-[#00134d] rounded-2xl flex items-center justify-center text-[#CCFF00]">
                                        <Zap className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-3xl font-black !text-blue-950 uppercase italic leading-none text-center">Playoffs</h3>
                                </div>

                                {/* Final Connector to Trophy */}
                                <div className="h-16 w-1 border-r-4 border-dotted border-[#CCFF00]/40"></div>

                                {/* Championship Trophy (Diamond) */}
                                <div className="relative group cursor-pointer hover:scale-125 transition-all duration-700">
                                    <div className="absolute -inset-10 bg-[#CCFF00]/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 animate-pulse"></div>
                                    <div className="w-32 h-32 bg-[#CCFF00] rotate-45 flex items-center justify-center shadow-[0_0_100px_rgba(204,255,0,0.5)] border-8 border-white/30 rounded-[32px] relative overflow-hidden group-hover:shadow-[0_0_120px_rgba(204,255,0,0.8)]">
                                        <div className="-rotate-45 !text-blue-950">
                                            <Trophy className="w-16 h-16" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom CTA Glow */}
                    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#000d40] to-transparent z-0 opacity-50"></div>
                </section>

                {/* Match Fixtures Section */}
                <section className="py-16 bg-[#001b69]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <MatchFixtures />
                    </div>
                </section>

                {/* Highlights Section */}
                <section className="py-16 bg-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="brand-h2 brand-h2--on-dark">{content.highlightsHeading}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {content.highlights.map((item, index) => (
                                <div key={index} className="bg-white/10 p-6 rounded-xl border-l-4 border-[#CCFF00] shadow-sm hover:shadow-md transition-all">
                                    <h3 className="text-lg font-bold !text-white mb-2 uppercase tracking-wide">{item.title}</h3>
                                    <p className="!text-white/80 text-sm">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-brand-primary text-white text-center">
                    <div className="max-w-4xl mx-auto px-4">
                        <h2 className="brand-h2 brand-h2--on-dark mb-6">Ready to Play?</h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Join thousands of players who are already part of the SSPL revolution.
                        </p>
                        <a href="/register" className="inline-block bg-white !text-black font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-colors shadow-xl text-lg">
                            Register Now
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HowItWorks;
