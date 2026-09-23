import { motion } from 'framer-motion';
import HeroStatCard from './HeroStatCard';
import { Trophy, MapPin, User, Users } from 'lucide-react';

const HeroStatCards: React.FC = () => {
    const stats = [
        {
            title: 'UPTO ₹3 CRORES*',
            value: 'PRIZE MONEY',
            icon: Trophy,
            gradient: 'from-blue-600 via-purple-600 to-indigo-800',
        },
        {
            title: 'FINALS AT',
            value: 'SHARJAH UAE',
            icon: MapPin,
            gradient: 'from-emerald-500 via-cyan-400 to-teal-600',
        },
        {
            title: 'UPTO',
            value: '₹3 LAKHS',
            icon: User,
            gradient: 'from-pink-500 via-rose-500 to-amber-500',
        },
        {
            title: 'TEAMS',
            value: '12',
            icon: Users,
            gradient: 'from-orange-500 via-yellow-400 to-red-600',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="relative z-10 w-full px-4 sm:px-6 mt-2 md:mt-4 max-w-[1240px] mx-auto"
        >
            <motion.div
                animate={{
                    y: [0, -5, 0],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
            >
                {stats.map((stat, index) => (
                    <HeroStatCard
                        key={stat.title}
                        {...stat}
                        delay={0.8 + index * 0.1}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
};

export default HeroStatCards;
