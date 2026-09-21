import React, { useMemo } from 'react';

interface ConfettiProps {
  delay: number;
}

const colors = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#fbbf24', // yellow
  '#22c55e', // green
  '#a855f7', // purple
  '#ec4899', // pink
  '#ccff00', // Tennis Ball Green
  '#6366f1', // indigo
];

const shapes = ['circle', 'square'];

export function Confetti({ delay }: ConfettiProps) {
  const confettiStyle = useMemo(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    const randomX = Math.random() * 100;
    const randomRotation = Math.random() * 360;
    const randomDuration = 2.5 + Math.random() * 2;
    const randomSize = 10 + Math.random() * 10;
    const randomDelay = delay + Math.random() * 0.5;
    const randomXOffset = (Math.random() - 0.5) * 30;

    const safeSize = isNaN(randomSize) ? 15 : randomSize;
    const safeDuration = isNaN(randomDuration) ? 3 : randomDuration;
    const safeDelay = isNaN(randomDelay) ? 0 : randomDelay;

    return {
      backgroundColor: randomColor,
      width: `${safeSize}px`,
      height: `${safeSize}px`,
      borderRadius: randomShape === 'circle' ? '50%' : '0',
      position: 'absolute' as const,
      top: '-20px',
      left: `${isNaN(randomX) ? 50 : randomX}%`,
      pointerEvents: 'none' as const,
      animation: `confetti-fall ${safeDuration}s linear ${safeDelay}s infinite`,
      boxShadow: `0 0 10px ${randomColor}`,
      '--confetti-start-x': `${isNaN(randomX) ? 50 : randomX}%`,
      '--confetti-end-x': `${isNaN(randomX + randomXOffset) ? 50 : (randomX + randomXOffset)}%`,
      '--confetti-start-rotate': `${isNaN(randomRotation) ? 0 : randomRotation}deg`,
      '--confetti-end-rotate': `${isNaN(randomRotation + 1080) ? 1080 : (randomRotation + 1080)}deg`,
    } as React.CSSProperties;
  }, [delay]);

  return <div className="confetti-piece" style={confettiStyle} />;
}
