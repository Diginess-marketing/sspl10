import React from 'react';
import { motion } from 'framer-motion';
import { StatsCard } from './StatsCard';

const HorizontalStatCards: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const stats = [
    {
      title: 'Total Prize Pool',
      value: 'Upto 3 CRORES',
      icon: (
        <img src="/assets/3d-icons/prize-money-icon.png" alt="Prize" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
      ),
      color: '#00E5FF', // Electric Blue
    },
    {
      title: 'Grand Finale Venue',
      value: 'SHARJAH',
      icon: (
        <img src="/assets/3d-icons/sharjah-icon.png" alt="Location" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
      ),
      color: '#FF4D00', // Sunset Orange
    },
    {
      title: 'Top Player Reward',
      value: 'Upto 3 LAKHS',
      icon: (
        <img src="/assets/3d-icons/cricket-player.png" alt="Player" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
      ),
      color: '#7000FF', // Vivid Purple
    },
    {
      title: 'Franchise Teams',
      value: '12 TEAMS',
      icon: (
        <img src="/assets/3d-icons/teams-icon-v2.png" alt="Teams" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
      ),
      color: '#CCFF00', // Neon Lime
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 relative z-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              size="xxs"
              className="h-full"
            />
          </motion.div>
        ))}
      </div>

      {children && <div className="lg:hidden flex justify-center py-2 mt-4">{children}</div>}
    </div>
  );
};

export default HorizontalStatCards;
