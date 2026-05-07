'use client';

export function ProgressRing({ percentage, size = 120 }: { percentage: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div
        className="absolute inset-2 rounded-full bg-primary-light/20 blur-md"
        style={{ opacity: percentage > 0 ? 0.6 : 0 }}
      />

      <svg width={size} height={size} className="-rotate-90 relative z-10">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border-light)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-light)" />
            <stop offset="50%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-primary-dark)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="font-display text-2xl font-bold text-text">{percentage}%</span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">completado</span>
      </div>
    </div>
  );
}
