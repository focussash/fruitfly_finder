// Timer.tsx - Countdown timer component with circular display

interface TimerProps {
  time: number;              // Time remaining in seconds
  maxTime: number;           // Maximum time (for progress calculation)
  isRunning: boolean;        // Whether timer is active
  urgencyThreshold?: number; // Time at which urgency styling kicks in (default 5)
}

export function Timer({ time, maxTime, isRunning, urgencyThreshold = 5 }: TimerProps) {
  const isUrgent = time <= urgencyThreshold && time > 0;
  const isExpired = time <= 0;

  // Calculate progress (0 to 1)
  const progress = maxTime > 0 ? time / maxTime : 0;

  // Circle dimensions
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Color based on state
  const getColor = () => {
    if (isExpired) return '#ef4444'; // red-500
    if (isUrgent) return '#f97316';  // orange-500
    return '#22c55e';                 // green-500
  };

  const color = getColor();

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0';
    if (seconds < 60) return seconds.toString();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${isUrgent && isRunning ? 'animate-pulse' : ''}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
      </svg>

      {/* Time text */}
      <div
        className={`absolute inset-0 flex items-center justify-center font-bold text-xl transition-colors duration-300 ${
          isUrgent && isRunning ? 'animate-pulse' : ''
        }`}
        style={{ color }}
      >
        {formatTime(time)}
      </div>

      {/* Status indicator */}
      {!isRunning && time > 0 && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-white/60">
          paused
        </div>
      )}
      {isExpired && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-red-400 font-semibold">
          TIME UP
        </div>
      )}
    </div>
  );
}
