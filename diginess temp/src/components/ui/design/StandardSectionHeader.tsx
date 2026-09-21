import React from 'react';
import { motion } from 'framer-motion';

interface StandardSectionHeaderProps {
    title: string;
    accentTitle: string;
    subtitle?: string;
    align?: 'left' | 'center';
    className?: string;
}

const StandardSectionHeader: React.FC<StandardSectionHeaderProps> = ({
    title,
    accentTitle,
    subtitle,
    align = 'center',
    className = ''
}) => {
    return (
        <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-h1-refined font-bold text-white uppercase tracking-normal font-heading flex flex-wrap gap-x-3 relative ${align === 'center' ? 'justify-center' : 'justify-start'}`}
            >
                <span className="inline-block whitespace-nowrap">{title}</span>
                <span className="text-accent relative inline-block whitespace-nowrap">
                    {accentTitle}
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent/30 rounded-full"></span>
                </span>
            </motion.h2>
            {subtitle && (
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-secondary text-lg max-w-2xl mx-auto mt-6 font-sans"
                    style={{ marginLeft: align === 'center' ? 'auto' : '0', marginRight: align === 'center' ? 'auto' : '0' }}
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
};

export default StandardSectionHeader;
