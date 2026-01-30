// useTimer.ts - Countdown timer hook with start/pause/reset

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerOptions {
  initialTime?: number;      // Starting time in seconds (default 30)
  onTimeUp?: () => void;     // Callback when timer reaches 0
}

interface UseTimerReturn {
  time: number;              // Current time remaining in seconds
  isRunning: boolean;        // Whether timer is currently counting down
  start: () => void;         // Start or resume the timer
  pause: () => void;         // Pause the timer
  reset: (newTime?: number) => void;  // Reset to initial or specified time
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { initialTime = 30, onTimeUp } = options;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  // Use refs to avoid stale closures in interval
  const timeRef = useRef(time);
  const intervalRef = useRef<number | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep refs in sync
  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (timeRef.current <= 0) return; // Don't start if already at 0

    setIsRunning(true);
    clearTimerInterval();

    intervalRef.current = window.setInterval(() => {
      setTime(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearTimerInterval();
          setIsRunning(false);
          // Call onTimeUp callback
          onTimeUpRef.current?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [clearTimerInterval]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimerInterval();
  }, [clearTimerInterval]);

  const reset = useCallback((newTime?: number) => {
    clearTimerInterval();
    setIsRunning(false);
    setTime(newTime ?? initialTime);
  }, [clearTimerInterval, initialTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  return {
    time,
    isRunning,
    start,
    pause,
    reset,
  };
}
