import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface HeroStatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    gradient: string;
    delay?: number;
}

const HeroStatCard: React.FC<HeroStatCardProps> = ({ title, value, icon: Icon, gradient, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="relative group overflow-hidden rounded-[16px] p-5 md:p-6 cursor-default isolate h-full min-h-[140px] flex flex-col justify-between"
        >
            {/* Glassmorphism Surface */}
            <div
                className="absolute inset-0 bg-white/[0.04] backdrop-blur-[14px] -z-10 transition-all duration-500 group-hover:bg-white/[0.08]"
                style={{
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                }}
            />

            {/* Innovative: Animated Liquid Mesh Blobs */}
            <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 20, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className={`absolute -top-1/2 -left-1/2 w-full h-full opacity-30 blur-[40px] rounded-full bg-gradient-to-br ${gradient}`}
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [0, -90, 0],
                        x: [0, -20, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className={`absolute -bottom-1/2 -right-1/2 w-full h-full opacity-30 blur-[40px] rounded-full bg-gradient-to-tr ${gradient}`}
                />
            </div>

            {/* Stylish Icon Housing (3D Layered) */}
            <div className="relative z-10 flex items-start justify-between mb-2">
                <div className="relative group/icon">
                    <div className={`absolute inset-0 blur-[15px] opacity-40 group-hover:opacity-80 transition-all duration-500 bg-gradient-to-r ${gradient} rounded-full`} />
                    <div className="relative w-11 h-11 rounded-[14px] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl overflow-hidden">
                        {/* Inner Glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                        <Icon className="w-5 h-5 text-white relative z-10 transform group-hover/icon:scale-110 group-hover/icon:rotate-12 transition-all duration-500" />
                    </div>
                </div>

                {/* Micro-Detail: Stylish Accent */}
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
            </div>

            {/* Fashion/Sports Magazine Typography */}
            <div className="relative z-10 flex flex-col pt-1">
                <motion.span
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 0.6 }}
                    className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-[0.25em] mb-1 group-hover:opacity-100 transition-all"
                >
                    {title}
                </motion.span>
                <span className="text-[20px] md:text-[24px] font-black text-white leading-tight uppercase italic drop-shadow-md">
                    {value}
                </span>
            </div>

            {/* Animated Border Glimmer */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            ` }} />
        </motion.div>
    );
};

export default HeroStatCard;
