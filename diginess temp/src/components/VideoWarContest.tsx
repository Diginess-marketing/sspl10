import React from "react";
import { motion } from "framer-motion";
import { Video, ExternalLink, ArrowRight } from "lucide-react";

const VideoWarContest = () => {
    return (
        <div id="video-contest" className="w-full py-24 md:py-32 relative bg-[#0A1628]">
            {/* Optional overlay to ensure text readability if the background is dark, though we'll keep it transparent to show the background clearly */}
            <div className="absolute inset-0 bg-black/40 md:bg-white/10"></div>
            <div className="container relative z-10 mx-auto px-4 max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <div className="flex flex-col items-center justify-center gap-4 mb-4">
                        <div className="p-4 bg-[#00B4D8]/10 rounded-full border border-[#00B4D8]/20 shadow-[0_0_20px_rgba(0,180,216,0.2)]">
                            <Video className="w-10 h-10 md:w-12 md:h-12 text-[#00B4D8]" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter font-heading uppercase">
                            SSPL <span className="text-[#00B4D8]">Video War</span> Contest
                        </h2>
                    </div>
                    <p className="!text-white max-w-2xl mx-auto text-lg md:text-xl">
                        Showcase your skills, join the contest, and get a chance to win amazing prizes. Fill out the form below to participate!
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-4xl mx-auto relative rounded-[2rem] overflow-hidden shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10 group p-2"
                >
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#00B4D8] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-[#0072ff] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Icon Side */}
                        <div className="shrink-0 relative">
                            {/* Decorative element Resembling tech folder */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-11/12 h-6 bg-[#00B4D8] rounded-t-xl shadow-sm z-0"></div>

                            <div className="w-32 h-40 bg-white/10 rounded-xl flex flex-col items-center justify-center shadow-lg border border-white/10 relative z-10 pt-4 backdrop-blur-md">
                                <div className="space-y-2 w-full px-4 mb-4 opacity-10">
                                    <div className="h-2 w-3/4 bg-white rounded"></div>
                                    <div className="h-2 w-1/2 bg-white rounded"></div>
                                </div>
                                <div className="text-[#00B4D8]">
                                    <ExternalLink className="w-12 h-12 mb-2 drop-shadow-[0_0_10px_rgba(0,180,216,0.5)]" />
                                </div>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 flex-1">
                            <h3 className="text-2xl md:text-4xl font-bold text-white leading-tight font-heading uppercase">
                                Register Your Entry
                            </h3>

                            <p className="text-white/60 text-base md:text-lg leading-relaxed font-medium">
                                Show the world your talent. Click below to fill out the participation form.
                            </p>

                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLScfpw9a_CoH1yjZf9ScasfTO88Hor_JIakvQrTvW2dv2xzyuw/viewform"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[#00B4D8] to-[#0072ff] hover:shadow-[#00B4D8]/30 text-white rounded-full font-bold text-xl transition-all hover:-translate-y-1 group overflow-hidden relative font-heading uppercase tracking-widest"
                            >
                                <span className="relative z-10">Submit Video Here</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out z-0"></div>
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VideoWarContest;
