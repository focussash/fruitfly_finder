// ScoreDisplay.tsx - Score display component with floating popups

import { useState, useEffect } from 'react';
import type { ScoreBreakdown } from '../../utils/scoring';

interface ScorePopup {
  id: string;
  breakdown: ScoreBreakdown;
  x: number;  // percentage position
  y: number;  // percentage position
  timestamp: number;
}

interface ScoreDisplayProps {
  score: number;
  streak: number;
  popups?: ScorePopup[];
  onPopupComplete?: (id: string) => void;
}

export function ScoreDisplay({ score, streak }: Omit<ScoreDisplayProps, 'popups' | 'onPopupComplete'>) {
  return (
    <div className="flex items-center gap-4">
      {/* Main score display */}
      <div className="text-right">
        <div className="text-3xl font-bold tabular-nums">{score.toLocaleString()}</div>
        <div className="text-sm text-green-200">Score</div>
      </div>

      {/* Streak indicator */}
      {streak >= 2 && (
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg px-3 py-1">
          <div className="text-yellow-400 font-bold text-lg">{streak}x</div>
          <div className="text-xs text-yellow-300">Streak!</div>
        </div>
      )}
    </div>
  );
}

// Score popup overlay - render inside GameCanvas for correct positioning
interface ScorePopupOverlayProps {
  popups: ScorePopup[];
  onPopupComplete: (id: string) => void;
}

export function ScorePopupOverlay({ popups, onPopupComplete }: ScorePopupOverlayProps) {
  return (
    <>
      {popups.map((popup) => (
        <ScorePopupItem
          key={popup.id}
          popup={popup}
          onComplete={() => onPopupComplete(popup.id)}
        />
      ))}
    </>
  );
}

interface ScorePopupItemProps {
  popup: ScorePopup;
  onComplete: () => void;
}

function ScorePopupItem({ popup, onComplete }: ScorePopupItemProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fade out after animation
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const { breakdown } = popup;
  const hasStreak = breakdown.streakMultiplier > 1;

  return (
    <div
      className="absolute pointer-events-none animate-float-up z-50"
      style={{
        left: `${popup.x}%`,
        top: `calc(${popup.y}% - 50px)`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="bg-black/80 rounded-lg px-3 py-2 text-center shadow-lg">
        {/* Total points */}
        <div className={`text-2xl font-bold ${hasStreak ? 'text-yellow-400' : 'text-green-400'}`}>
          +{breakdown.total}
        </div>

        {/* Breakdown */}
        <div className="text-xs text-white/70 space-y-0.5">
          <div>Base: +{breakdown.base}</div>
          {breakdown.timeBonus > 0 && (
            <div>Time: +{breakdown.timeBonus}</div>
          )}
          {hasStreak && (
            <div className="text-yellow-400">x{breakdown.streakMultiplier} streak!</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Floating score popup for penalties (escapes, etc.)
interface PenaltyPopupProps {
  amount: number;
  x: number;
  y: number;
  onComplete: () => void;
}

export function PenaltyPopup({ amount, x, y, onComplete }: PenaltyPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none animate-float-down z-50"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, 0)',
      }}
    >
      <div className="text-2xl font-bold text-red-500 drop-shadow-lg">
        {amount}
      </div>
    </div>
  );
}

// Export type for use in App
export type { ScorePopup };
