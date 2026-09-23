import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Phone, CheckCircle2 } from 'lucide-react';
import SelectorRegistrationForm from './SelectorRegistrationForm';

const SelectorsRequiredSection = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <section className="relative py-12 md:py-16 overflow-hidden h-full flex flex-col bg-[#0A1628]">
            {/* Background Image with Transparency - Overlay */}


            {/* Gradient Overlay for Text Contrast - REMOVED */}

            {/* Content Container - Ensure z-index is above background */}
            <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col">
                <div className="w-full lg:max-w-xl mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 relative overflow-hidden flex-1 flex flex-col">
                    <div className="flex flex-col items-center text-center space-y-6">

                        {/* Header with subtle gradient underline */}
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white uppercase font-heading">
                                Selectors Invited
                            </h2>
                            <div className="w-24 h-1 bg-[#00B4D8] mx-auto rounded-full"></div>
                        </div>

                        {/* Qualifications */}
                        <div
                            className="w-full max-w-2xl bg-white/5 rounded-xl p-6 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200 fill-mode-both"
                        >
                            <h3 className="text-xl font-bold text-[#00B4D8] mb-6 uppercase tracking-wide font-heading">
                                Qualifications
                            </h3>
                            <ul className="space-y-4 text-left inline-block mx-auto">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-[#00B4D8] shrink-0 mt-0.5" />
                                    <span className="text-lg text-white/80 font-medium">
                                        BCCI level 1 and above certified coach
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-[#00B4D8] shrink-0 mt-0.5" />
                                    <span className="text-lg text-white/80 font-medium">
                                        Any state level Qualified coach or Equivalent certified coach
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Abstract decorative shapes */}
                        <div className="absolute inset-0 pointer-events-none">
                            <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="40" fill="url(#grad1)" opacity="0.2" />
                                <circle cx="150" cy="150" r="60" fill="url(#grad2)" opacity="0.15" />
                                <defs>
                                    <radialGradient id="grad1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(40)">
                                        <stop stopColor="#ff80b5" />
                                        <stop offset="1" stopColor="#9089fc" />
                                    </radialGradient>
                                    <radialGradient id="grad2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 150) rotate(90) scale(60)">
                                        <stop stopColor="#a3e635" />
                                        <stop offset="1" stopColor="#60a5fa" />
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
                                        JOIN AS SELECTOR
                                    </Button>
                                </DialogTrigger>

                                <DialogContent className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-white rounded-lg p-6">
                                    <img src="/lovable-uploads/ada9fed7-8a22-4ee5-a3db-7a5f855ab03f.avif" alt="SSPL Logo" className="mx-auto mb-4 w-24 h-auto" />
                                    <div className="mt-4">
                                        <SelectorRegistrationForm />
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t border-white/10">
                                <a
                                    href="mailto:operations@ssplt10.co.in"
                                    className="flex items-center gap-2 text-white/60 hover:text-[#00B4D8] transition-colors group"
                                >
                                    <div className="p-2 bg-white/5 text-[#00B4D8] rounded-full group-hover:scale-110 transition-transform">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">operations@ssplt10.co.in</span>
                                </a>
                                <a
                                    href="tel:+919751681041"
                                    className="flex items-center gap-2 text-white/60 hover:text-[#00B4D8] transition-colors group"
                                >
                                    <div className="p-2 bg-white/5 text-[#00B4D8] rounded-full group-hover:scale-110 transition-transform">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">Contact Now: +91 97516 81041</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    );
};

export default SelectorsRequiredSection;
