// CatchAnimation.tsx - Animated effects when catching a fly

import { useEffect, useState } from 'react';

interface CatchAnimationProps {
  x: number;  // percentage position
  y: number;  // percentage position
  mode: 'cute' | 'wild';
  onComplete: () => void;
}

export function CatchAnimation({ x, y, mode, onComplete }: CatchAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return mode === 'cute' ? (
    <CuteAnimation x={x} y={y} />
  ) : (
    <WildAnimation x={x} y={y} />
  );
}

// Cute mode: Sparkles and pop
function CuteAnimation({ x, y }: { x: number; y: number }) {
  const [particles] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i * 45) * (Math.PI / 180),
      delay: i * 30,
      size: 8 + Math.random() * 8,
    }))
  );

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Central pop burst */}
      <div className="absolute inset-0 flex items-center justify-center animate-pop">
        <div className="w-12 h-12 bg-pink-400/60 rounded-full" />
      </div>

      {/* Sparkle particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-sparkle-out"
          style={{
            left: '50%',
            top: '50%',
            '--angle': `${particle.angle}rad`,
            '--delay': `${particle.delay}ms`,
            animationDelay: `${particle.delay}ms`,
          } as React.CSSProperties}
        >
          <svg
            width={particle.size}
            height={particle.size}
            viewBox="0 0 24 24"
            className="text-yellow-300 drop-shadow-lg"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <path
              fill="currentColor"
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
            />
          </svg>
        </div>
      ))}

      {/* Hearts */}
      <div
        className="absolute animate-float-heart"
        style={{ left: '50%', top: '50%', animationDelay: '100ms' }}
      >
        <span className="text-2xl" style={{ transform: 'translate(-50%, -50%)' }}>💖</span>
      </div>
      <div
        className="absolute animate-float-heart"
        style={{ left: '30%', top: '40%', animationDelay: '200ms' }}
      >
        <span className="text-lg" style={{ transform: 'translate(-50%, -50%)' }}>💕</span>
      </div>
    </div>
  );
}

// Wild mode: Hand swoops in with splat
function WildAnimation({ x, y }: { x: number; y: number }) {
  const [splatDrops] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: (i * 60 + Math.random() * 30) * (Math.PI / 180),
      distance: 20 + Math.random() * 30,
      size: 4 + Math.random() * 6,
    }))
  );

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Hand swooping in */}
      <div className="absolute animate-hand-swoop" style={{ left: '-60px', top: '-60px' }}>
        <span className="text-5xl" style={{ transform: 'rotate(-30deg)', display: 'inline-block' }}>
          👋
        </span>
      </div>

      {/* Splat effect */}
      <div className="absolute inset-0 flex items-center justify-center animate-splat">
        <div className="w-16 h-16 bg-green-600/70 rounded-full blur-sm" />
      </div>

      {/* Splat drops */}
      {splatDrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute animate-splat-drop"
          style={{
            left: '50%',
            top: '50%',
            '--angle': `${drop.angle}rad`,
            '--distance': `${drop.distance}px`,
            animationDelay: `${200 + drop.id * 30}ms`,
          } as React.CSSProperties}
        >
          <div
            className="bg-green-500 rounded-full"
            style={{
              width: `${drop.size}px`,
              height: `${drop.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>
      ))}

      {/* Impact text */}
      <div className="absolute animate-impact-text" style={{ left: '50%', top: '50%' }}>
        <span
          className="text-2xl font-black text-orange-400 drop-shadow-lg"
          style={{ transform: 'translate(-50%, -50%)', fontFamily: 'Impact, sans-serif' }}
        >
          SPLAT!
        </span>
      </div>
    </div>
  );
}
