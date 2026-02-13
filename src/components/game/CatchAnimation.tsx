// CatchAnimation.tsx - Animated effects when catching a fly

import { useEffect, useState } from 'react';

// Animation visual scale factor — how dramatically animations grow with intensity.
// Score multiplier caps at 2x, but animations scale up to 6x for visual punch.
const ANIM_SCALE = 6;

interface CatchAnimationProps {
  x: number;  // percentage position
  y: number;  // percentage position
  mode: 'cute' | 'wild';
  intensity: number; // 0-1, power slap intensity
  onComplete: () => void;
}

export function CatchAnimation({ x, y, mode, intensity, onComplete }: CatchAnimationProps) {
  const v = intensity * ANIM_SCALE; // visual intensity (0–6)
  useEffect(() => {
    const duration = 800 + v * 200;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [onComplete, v]);

  return mode === 'cute' ? (
    <CuteAnimation x={x} y={y} v={v} />
  ) : (
    <WildAnimation x={x} y={y} v={v} />
  );
}

// Cute mode: Sparkles and pop
function CuteAnimation({ x, y, v }: { x: number; y: number; v: number }) {
  const particleCount = Math.round(8 + v * 8);
  const [particles] = useState(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (i * (360 / particleCount)) * (Math.PI / 180),
      delay: i * 30,
      size: (8 + Math.random() * 8) * (1 + v * 0.5),
    }))
  );

  const burstSize = 48 + v * 32;
  const travel = 50 + v * 50;
  const heartSize = 2 + v * 1; // rem

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
      <div className="absolute inset-0 flex items-center justify-center animate-pop"
        style={{ animationDuration: `${0.5 + v * 0.15}s` }}
      >
        <div className="bg-pink-400/60 rounded-full"
          style={{ width: `${burstSize}px`, height: `${burstSize}px` }}
        />
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
            '--travel': `${travel}px`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${0.6 + v * 0.2}s`,
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
        style={{
          left: '50%', top: '50%', animationDelay: '100ms',
          animationDuration: `${0.8 + v * 0.2}s`,
        }}
      >
        <span style={{ fontSize: `${heartSize}rem`, transform: 'translate(-50%, -50%)' }}>💖</span>
      </div>
      <div
        className="absolute animate-float-heart"
        style={{
          left: '30%', top: '40%', animationDelay: '200ms',
          animationDuration: `${0.8 + v * 0.2}s`,
        }}
      >
        <span style={{ fontSize: `${heartSize * 0.75}rem`, transform: 'translate(-50%, -50%)' }}>💕</span>
      </div>
    </div>
  );
}

// Wild mode: Hand swoops in with splat
function WildAnimation({ x, y, v }: { x: number; y: number; v: number }) {
  const dropCount = Math.round(6 + v * 6);
  const [splatDrops] = useState(() =>
    Array.from({ length: dropCount }, (_, i) => ({
      id: i,
      angle: (i * (360 / dropCount) + Math.random() * 30) * (Math.PI / 180),
      distance: (20 + Math.random() * 30) * (1 + v * 0.5),
      size: 4 + Math.random() * 6,
    }))
  );

  const splatSize = 64 + v * 48;
  const handSize = 3 + v * 1.5; // rem
  const splatTextSize = 1.5 + v * 1; // rem

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
      <div className="absolute animate-hand-swoop"
        style={{
          left: '-60px', top: '-60px',
          animationDuration: `${0.5 + v * 0.15}s`,
        }}
      >
        <span style={{ fontSize: `${handSize}rem`, transform: 'rotate(-30deg)', display: 'inline-block' }}>
          👋
        </span>
      </div>

      {/* Splat effect */}
      <div className="absolute inset-0 flex items-center justify-center animate-splat"
        style={{ animationDuration: `${0.4 + v * 0.15}s` }}
      >
        <div className="bg-green-600/70 rounded-full blur-sm"
          style={{ width: `${splatSize}px`, height: `${splatSize}px` }}
        />
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
            animationDuration: `${0.4 + v * 0.15}s`,
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
      <div className="absolute animate-impact-text"
        style={{
          left: '50%', top: '50%',
          animationDuration: `${0.7 + v * 0.2}s`,
        }}
      >
        <span
          className="font-black text-orange-400 drop-shadow-lg"
          style={{
            fontSize: `${splatTextSize}rem`,
            transform: 'translate(-50%, -50%)',
            fontFamily: 'Impact, sans-serif',
          }}
        >
          SPLAT!
        </span>
      </div>
    </div>
  );
}
