import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
}

const Confetti: React.FC<ConfettiProps> = ({
  isActive,
  duration = 3000,
  particleCount = 150,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
    maxLife: number;
    gravity: number;
    friction: number;

    constructor(canvas: HTMLCanvasElement) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height * 0.3; // Start from top third
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = Math.random() * -10 - 5;
      this.color = this.getRandomColor();
      this.size = Math.random() * 6 + 2;
      this.life = 0;
      this.maxLife = Math.random() * 60 + 60; // 1-2 seconds at 60fps
      this.gravity = 0.3;
      this.friction = 0.99;
    }

    getRandomColor(): string {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update(): boolean {
      this.vx *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.life++;

      // Reset particle if it goes off screen
      if (this.y > window.innerHeight + 50) {
        this.y = -50;
        this.x = Math.random() * window.innerWidth;
        this.vy = Math.random() * -10 - 5;
        this.life = 0;
      }

      return this.life < this.maxLife;
    }

    draw(ctx: CanvasRenderingContext2D) {
      const alpha = 1 - (this.life / this.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Add some sparkle effect
      if (Math.random() > 0.8) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle(canvas));
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update();
        particle.draw(ctx);
        return true; // Keep all particles for continuous effect
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup after duration
    const timeout = setTimeout(() => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Fade out effect
      const fadeOut = () => {
        if (ctx.globalAlpha > 0) {
          ctx.globalAlpha -= 0.02;
          requestAnimationFrame(fadeOut);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
      fadeOut();
    }, duration);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration, particleCount]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
};

export default Confetti;