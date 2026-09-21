import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle2, Trophy, Gift, Calendar } from 'lucide-react';
import TournamentOrganizerRegistration from './TournamentOrganizerRegistration';

const TournamentOrganizersSection = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="relative py-12 md:py-16 overflow-hidden h-full flex flex-col bg-slate-50">
            <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col">
                <div className="w-full lg:max-w-xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200 relative overflow-hidden flex-1 flex flex-col">
                    <div className="flex flex-col items-center text-center space-y-6">

                        {/* Header */}
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 uppercase font-heading">
                                Tournament Organizers
                            </h2>
                            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
                            <p className="text-lg text-gray-700 font-medium max-w-2xl mx-auto">
                                Join the SSPL network and host official Cricket Tournaments in your City. Get free tennis balls and exclusive branding support!
                            </p>
                        </div>

                        {/* Benefits */}
                        <div
                            className="w-full max-w-2xl bg-blue-50/50 backdrop-blur-sm rounded-xl p-6 border border-blue-100 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200 fill-mode-both"
                        >
                            <h3 className="text-xl font-bold text-[#00B4D8] mb-6 uppercase tracking-wide flex items-center justify-center gap-2 font-heading">
                                <Trophy className="w-6 h-6" /> Why Join Us?
                            </h3>
                            <ul className="grid md:grid-cols-2 gap-4 text-left">
                                <li className="flex items-start gap-3">
                                    <Gift className="w-6 h-6 text-[#00B4D8] shrink-0 mt-0.5" />
                                    <span className="text-lg text-gray-700 font-medium">
                                        Free Tennis Balls for Matches
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-[#00B4D8] shrink-0 mt-0.5" />
                                    <span className="text-lg text-gray-700 font-medium">
                                        Official SSPL Branding
                                    </span>
                                </li>

                                <li className="flex items-start gap-3 md:col-span-2 md:justify-center">
                                    <Trophy className="w-6 h-6 text-[#00B4D8] shrink-0 mt-0.5" />
                                    <span className="text-lg text-gray-700 font-medium">
                                        National Recognition
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute inset-0 pointer-events-none">
                            <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="40" fill="url(#grad_emerald_1)" opacity="0.1" />
                                <circle cx="180" cy="180" r="60" fill="url(#grad_emerald_2)" opacity="0.1" />
                                <defs>
                                    <radialGradient id="grad_emerald_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(40)">
                                        <stop stopColor="#34d399" />
                                        <stop offset="1" stopColor="#059669" />
                                    </radialGradient>
                                    <radialGradient id="grad_emerald_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 180) rotate(90) scale(60)">
                                        <stop stopColor="#10b981" />
                                        <stop offset="1" stopColor="#047857" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>

                        <div
                            className="space-y-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both"
                        >
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="font-bold text-lg px-8 py-6 rounded-[50px] shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)] transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        REGISTER AS ORGANIZER
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-lg p-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <Trophy className="w-10 h-10 text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <TournamentOrganizerRegistration />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default TournamentOrganizersSection;
