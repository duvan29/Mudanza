'use client';

import { useEffect, useState } from 'react';
import { Clock, PartyPopper } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
}

interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function getTimeRemaining(target: Date): RemainingTime {
  const diff = target.getTime() - Date.now();
  const isPast = diff <= 0;
  const clamped = Math.max(diff, 0);
  return {
    days: Math.floor(clamped / MS_PER_DAY),
    hours: Math.floor((clamped % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((clamped % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((clamped % MS_PER_MINUTE) / MS_PER_SECOND),
    isPast,
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  // null = not mounted yet — keeps server render and first client render identical
  // (both skip Date.now()), so there's no hydration mismatch. The real value only
  // shows up once useEffect runs on the client, after mount.
  const [remaining, setRemaining] = useState<RemainingTime | null>(null);

  useEffect(() => {
    const target = new Date(targetDate);

    setRemaining(getTimeRemaining(target));

    const intervalId = setInterval(() => {
      const next = getTimeRemaining(target);
      setRemaining(next);
      if (next.isPast) clearInterval(intervalId);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  const dateLabel = new Date(targetDate).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-surface rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          <span className="text-sm font-medium text-text-secondary">Cuenta regresiva</span>
        </div>
        <span className="text-xs text-text-muted">{dateLabel}</span>
      </div>

      {remaining?.isPast ? (
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <PartyPopper size={28} className="text-accent-dark mb-2" />
          <p className="font-display text-2xl font-bold text-text">¡Llegó el día!</p>
          <p className="text-sm text-text-muted mt-1">La mudanza es hoy</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {[
            { value: remaining ? String(remaining.days) : '—', label: 'Días' },
            { value: remaining ? pad2(remaining.hours) : '—', label: 'Horas' },
            { value: remaining ? pad2(remaining.minutes) : '—', label: 'Min' },
            { value: remaining ? pad2(remaining.seconds) : '—', label: 'Seg' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-2xl sm:text-3xl font-bold text-text tabular-nums leading-none">
                {value}
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
