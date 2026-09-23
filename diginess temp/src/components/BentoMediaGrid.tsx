import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Trophy, ShieldCheck, ArrowRight, Gift, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import TournamentOrganizerRegistration from './TournamentOrganizerRegistration';
import SelectorRegistrationForm from './SelectorRegistrationForm';
import StandardSectionHeader from './ui/design/StandardSectionHeader';

const BentoMediaGrid: React.FC = () => {
    const [isOrganizerOpen, setIsOrganizerOpen] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    return (
        <section className="py-20 bg-[#080F23] relative overflow-hidden" id="featured">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[120px]"></div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <StandardSectionHeader 
                    title="Featured" 
                    accentTitle="Opportunities"
                    subtitle="Join the SSPL ecosystem. Showcase your video skills, host tournaments, or join as a certified selector."
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
                    
                    {/* 1. Video War Contest - Large Box (8 cols) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="md:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-8 relative group overflow-hidden flex flex-col justify-between shadow-glass"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                        
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-accent/20 rounded-md border border-accent/30 text-accent">
                                    <Video className="w-8 h-8" />
                                </div>
                                <h3 className="text-h2-refined font-bold text-primary uppercase font-heading">SSPL Video War Contest</h3>
                            </div>
                            <p className="text-secondary text-lg mb-8 max-w-xl">
                                Showcase your skills, join the contest, and get a chance to win amazing prizes. The ultimate stage for tennis-ball cricket videography.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 items-end justify-between">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-[#080F23] bg-white/10 overflow-hidden">
                                        <img src={`/assets/images/user-${i}.png`} alt="User" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
                                    </div>
                                ))}
                                <div className="w-12 h-12 rounded-full border-2 border-[#080F23] bg-accent flex items-center justify-center text-black font-bold text-xs">
                                    +500
                                </div>
                            </div>
                            
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLScfpw9a_CoH1yjZf9ScasfTO88Hor_JIakvQrTvW2dv2xzyuw/viewform"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-black rounded-sm font-bold transition-all hover:shadow-glow hover:-translate-y-1 uppercase tracking-wider text-sm"
                            >
                                Submit Video <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </motion.div>

                    {/* 2. Selectors Invited - High Box (4 cols) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-8 relative group overflow-hidden flex flex-col shadow-glass"
                    >
                         <div className="absolute top-0 right-0 w-full h-1 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"></div>
                         
                         <div className="p-3 bg-white/5 w-fit rounded-md border border-white/10 text-accent mb-6">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-h2-refined font-bold text-primary uppercase font-heading mb-4">Selectors Invited</h3>
                        
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <span className="text-secondary text-sm font-medium">BCCI level 1 & above certified coach</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                <span className="text-secondary text-sm font-medium">Any state level Qualified coach</span>
                            </li>
                        </ul>

                        <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full py-6 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-sm font-bold uppercase tracking-widest text-xs transition-all">
                                    JOIN AS SELECTOR
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-full max-w-2xl bg-[#080F23] border border-white/10 text-white rounded-lg p-6 max-h-[90vh] overflow-y-auto">
                                <SelectorRegistrationForm />
                            </DialogContent>
                        </Dialog>
                    </motion.div>

                    {/* 3. Tournament Organizers - Rect Box (12 cols or 6/6) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-12 lg:col-span-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-10 relative group overflow-hidden flex flex-col md:flex-row shadow-glass gap-8"
                    >
                         <div className="absolute bottom-0 right-0 w-1/4 h-1 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"></div>
                         
                         <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-accent/20 rounded-md border border-accent/30 text-accent">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <h3 className="text-h2-refined font-bold text-primary uppercase font-heading">Tournament Organizers</h3>
                            </div>
                            <p className="text-secondary text-lg mb-8">
                                Join the SSPL network and host official Cricket Tournaments in your City. Get free tennis balls and exclusive branding support!
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                                <div className="flex items-center gap-3">
                                    <Gift className="w-5 h-5 text-accent" />
                                    <span className="text-primary font-medium">Free Tennis Balls for Matches</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                    <span className="text-primary font-medium">Official SSPL Branding</span>
                                </div>
                            </div>
                         </div>

                         <div className="shrink-0 flex items-center justify-center md:border-l md:border-white/10 md:pl-8">
                            <Dialog open={isOrganizerOpen} onOpenChange={setIsOrganizerOpen}>
                                <DialogTrigger asChild>
                                    <Button className="px-10 py-8 bg-accent text-black hover:bg-white rounded-sm font-bold uppercase tracking-widest text-sm shadow-glow transition-all">
                                        REGISTER AS ORGANIZER
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-full max-w-2xl bg-[#080F23] border border-white/10 text-white rounded-lg p-6 max-h-[90vh] overflow-y-auto">
                                    <TournamentOrganizerRegistration />
                                </DialogContent>
                            </Dialog>
                         </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default BentoMediaGrid;
