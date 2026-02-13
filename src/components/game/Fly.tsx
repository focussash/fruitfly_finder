// Fly.tsx - Fly sprite component with hit detection and escape animation

import { useState, useEffect, useRef, useCallback } from 'react';
import { POWER_SLAP_MAX_HOLD_MS } from '../../utils/scoring';

interface FlyProps {
  id: string;
  x: number;           // percentage position (0-100)
  y: number;           // percentage position (0-100)
  size?: number;       // scale factor (default 1)
  found: boolean;
  escaped?: boolean;
  escapeDelay?: number; // ms delay before escape animation starts
  onClick?: (id: string, intensity: number) => void;
  onEscapeComplete?: (id: string) => void;
  debug?: boolean;
}

// Base size in pixels (will be scaled by size prop)
const BASE_SIZE = 32;

export function Fly({
  id,
  x,
  y,
  size = 1,
  found,
  escaped = false,
  escapeDelay = 0,
  onClick,
  onEscapeComplete,
  debug = false
}: FlyProps) {
  const actualSize = BASE_SIZE * size;
  const [escapePhase, setEscapePhase] = useState<'idle' | 'buzzing' | 'flying' | 'gone'>('idle');
  const pointerDownTime = useRef<number | null>(null);

  // Reset escape phase when escaped prop changes to false (game reset)
  useEffect(() => {
    if (!escaped) {
      setEscapePhase('idle');
    }
  }, [escaped]);

  // Handle escape animation sequence
  useEffect(() => {
    if (escaped && !found && escapePhase === 'idle') {
      // Start buzzing after delay
      const buzzTimer = setTimeout(() => {
        setEscapePhase('buzzing');
      }, escapeDelay);

      return () => clearTimeout(buzzTimer);
    }
  }, [escaped, found, escapeDelay, escapePhase]);

  useEffect(() => {
    if (escapePhase === 'buzzing') {
      // After buzzing, fly away
      const flyTimer = setTimeout(() => {
        setEscapePhase('flying');
      }, 500);

      return () => clearTimeout(flyTimer);
    }
  }, [escapePhase]);

  useEffect(() => {
    if (escapePhase === 'flying') {
      // After flying animation, mark as gone
      const goneTimer = setTimeout(() => {
        setEscapePhase('gone');
        onEscapeComplete?.(id);
      }, 600);

      return () => clearTimeout(goneTimer);
    }
  }, [escapePhase, id, onEscapeComplete]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (found || escapePhase !== 'idle') return;
    e.stopPropagation();
    e.preventDefault();
    pointerDownTime.current = Date.now();
    // Capture so pointerup fires even if finger drifts slightly
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [found, escapePhase]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!pointerDownTime.current || found || escapePhase !== 'idle' || !onClick) {
      pointerDownTime.current = null;
      return;
    }
    const holdDuration = Date.now() - pointerDownTime.current;
    pointerDownTime.current = null;
    const intensity = Math.min(holdDuration / POWER_SLAP_MAX_HOLD_MS, 1);
    onClick(id, intensity);
  }, [found, escapePhase, onClick, id]);

  const handlePointerCancel = useCallback(() => {
    pointerDownTime.current = null;
  }, []);

  // Don't render if gone
  if (escapePhase === 'gone') {
    return null;
  }

  // Calculate escape direction (fly towards nearest edge)
  const escapeDirection = {
    x: x < 50 ? -150 : 150,
    y: y < 50 ? -100 : -50, // Generally fly upward
  };

  const getAnimationClass = () => {
    if (found) return 'opacity-30 scale-75 pointer-events-none';
    if (escapePhase === 'buzzing') return 'animate-buzz pointer-events-none';
    if (escapePhase === 'flying') return 'pointer-events-none';
    return 'hover:scale-110';
  };

  const getTransform = () => {
    if (escapePhase === 'flying') {
      return `translate(calc(-50% + ${escapeDirection.x}px), calc(-50% + ${escapeDirection.y}px)) rotate(${escapeDirection.x > 0 ? 45 : -45}deg) scale(0.5)`;
    }
    return 'translate(-50%, -50%)';
  };

  return (
    <div
      className={`absolute cursor-pointer select-none transition-all ${
        escapePhase === 'flying' ? 'duration-500 ease-in' : 'duration-300'
      } ${getAnimationClass()}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${actualSize}px`,
        height: `${actualSize}px`,
        transform: getTransform(),
        opacity: escapePhase === 'flying' ? 0 : undefined,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Fly sprite - using SVG for crisp rendering */}
      <svg
        viewBox="0 0 32 32"
        className={`w-full h-full ${found ? 'grayscale' : ''}`}
        style={{ filter: found ? 'grayscale(100%)' : undefined }}
      >
        {/* Body */}
        <ellipse cx="16" cy="18" rx="6" ry="8" fill="#2d1810" />
        {/* Head */}
        <circle cx="16" cy="9" r="5" fill="#1a0f0a" />
        {/* Eyes */}
        <circle cx="13" cy="8" r="2.5" fill="#8b0000" />
        <circle cx="19" cy="8" r="2.5" fill="#8b0000" />
        {/* Eye highlights */}
        <circle cx="12.5" cy="7" r="0.8" fill="#fff" opacity="0.6" />
        <circle cx="18.5" cy="7" r="0.8" fill="#fff" opacity="0.6" />
        {/* Wings - animate faster when buzzing */}
        <ellipse
          cx="8" cy="15" rx="6" ry="4"
          fill="#a0c4e8"
          opacity="0.7"
          transform="rotate(-30 8 15)"
          className={escapePhase === 'buzzing' ? 'animate-wing-left' : ''}
        />
        <ellipse
          cx="24" cy="15" rx="6" ry="4"
          fill="#a0c4e8"
          opacity="0.7"
          transform="rotate(30 24 15)"
          className={escapePhase === 'buzzing' ? 'animate-wing-right' : ''}
        />
        {/* Legs */}
        <line x1="12" y1="20" x2="8" y2="26" stroke="#1a0f0a" strokeWidth="1" />
        <line x1="16" y1="22" x2="16" y2="28" stroke="#1a0f0a" strokeWidth="1" />
        <line x1="20" y1="20" x2="24" y2="26" stroke="#1a0f0a" strokeWidth="1" />
      </svg>

      {/* Debug info */}
      {debug && escapePhase === 'idle' && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-black/70 text-white px-1 rounded whitespace-nowrap">
          ({x.toFixed(0)}, {y.toFixed(0)})
        </div>
      )}

      {/* Found indicator */}
      {found && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-green-400 text-2xl font-bold">✓</span>
        </div>
      )}

      {/* Escape indicator */}
      {escapePhase === 'buzzing' && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-400 font-bold whitespace-nowrap animate-pulse">
          Escaping!
        </div>
      )}
    </div>
  );
}
