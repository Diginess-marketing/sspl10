import React from 'react';
import { CheckCircle, Trophy } from 'lucide-react';
import { Confetti } from '@/components/Confetti';

const CelebrationAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none">
      {/* Confetti Animation */}
      <div className="confetti-container">
        {Array.from({ length: 50 }).map((_, index) => (
          <Confetti key={index} delay={index * 0.1} />
        ))}
      </div>
      
      {/* Celebration Card */}
      <div className="bg-white rounded-lg p-8 shadow-lg text-center animate-fade-in-down pointer-events-auto">
        <div className="relative">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto animate-pulse" />
          <Trophy className="w-12 h-12 text-yellow-500 absolute top-0 right-1/4 animate-bounce" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mt-4">🎉 Congratulations! 🎉</h2>
        <p className="text-gray-600 mt-2 text-lg">You have been selected!</p>
        <p className="text-green-600 mt-2 font-semibold">Welcome to the team!</p>
      </div>
    </div>
  );
};

export default CelebrationAnimation;
