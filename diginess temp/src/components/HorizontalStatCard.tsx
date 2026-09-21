import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface HorizontalStatCardProps {
    value: string;
    subLabel?: string;
    icon?: LucideIcon;
    customIcon?: React.ReactNode;
    delay?: number;
    bgClass?: string;
}

const HorizontalStatCard: React.FC<HorizontalStatCardProps> = ({
    value,
    subLabel,
    icon: Icon,
    customIcon,
    delay = 0,
    bgClass = "bg-slate-900/90"
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={`${bgClass} backdrop-blur-md relative flex items-center justify-center gap-2 p-3 md:p-3.5 rounded-[16px] overflow-hidden cursor-default group border border-white/20 shadow-xl`}
        >
            {/* Glassy Overlay Shine */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none group-hover:bg-white/10 transition-colors" />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 pointer-events-none" />

            {/* Icon Section */}
            <div className="relative flex-shrink-0 flex items-center justify-center">
                {Icon ? (
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform drop-shadow-sm" />
                ) : (
                    <div className="group-hover:scale-110 transition-transform">{customIcon}</div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col relative z-10 justify-center text-center">
                <span className="text-white text-[12px] md:text-[14px] lg:text-[15px] font-bold uppercase tracking-tight leading-tight font-heading drop-shadow-md whitespace-nowrap">
                    {value}
                </span>
            </div>

            {/* Glassy Border Glimmer Effect */}
            <div className="absolute inset-0 border border-white/20 rounded-lg pointer-events-none group-hover:border-white/40 transition-colors" />
        </motion.div>
    );
};

export default HorizontalStatCard;
