'use client';

import { useState } from 'react';
import { Check, Circle, Play, MessageSquare } from 'lucide-react';

interface RoadmapMonth {
  _id: string;
  month: string;
  year: number;
  order: number;
  action: string;
  status: 'pending' | 'active' | 'done';
  note?: string;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    cardBg: 'bg-surface',
    cardBorder: 'border-border-light',
    dotBg: 'bg-surface-alt border-border',
    badgeBg: 'bg-surface-alt text-text-muted',
    icon: Circle,
    iconColor: '#9E9BAD',
  },
  active: {
    label: 'En curso',
    cardBg: 'bg-primary-light/10',
    cardBorder: 'border-primary/30',
    dotBg: 'bg-gradient-to-br from-primary to-primary-dark border-primary',
    badgeBg: 'bg-primary-light/30 text-primary-dark',
    icon: Play,
    iconColor: '#ffffff',
  },
  done: {
    label: 'Completado',
    cardBg: 'bg-success/8',
    cardBorder: 'border-success-dark/20',
    dotBg: 'bg-gradient-to-br from-success to-success-dark border-success-dark',
    badgeBg: 'bg-success/20 text-success-dark',
    icon: Check,
    iconColor: '#ffffff',
  },
};

export function RoadmapTimeline({ initialMonths }: { initialMonths: RoadmapMonth[] }) {
  const [months, setMonths] = useState(initialMonths);

  const cycleStatus = async (id: string, current: string) => {
    const next = current === 'pending' ? 'active' : current === 'active' ? 'done' : 'pending';
    setMonths((prev) => prev.map((m) => (m._id === id ? { ...m, status: next as any } : m)));

    await fetch('/api/roadmap', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    });
  };

  return (
    <div className="relative">
      {months.map((entry, index) => {
        const config = statusConfig[entry.status];
        const Icon = config.icon;
        const isLast = index === months.length - 1;

        return (
          <div key={entry._id} className="flex gap-5">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => cycleStatus(entry._id, entry.status)}
                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all hover:scale-110 active:scale-95 shadow-sm ${config.dotBg}`}
                title="Click para cambiar estado"
              >
                <Icon size={14} color={config.iconColor} />
              </button>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 rounded-full ${entry.status === 'done' ? 'bg-success-dark/60' : 'bg-border'}`} />
              )}
            </div>

            {/* Card */}
            <div className={`flex-1 mb-4 rounded-[var(--radius-lg)] border p-5 transition-all hover:shadow-[var(--shadow-sm)] ${config.cardBg} ${config.cardBorder}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text">{entry.month} {entry.year}</span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.badgeBg}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{entry.action}</p>
              {entry.note && (
                <p className="text-xs text-text-muted mt-2 italic flex items-center gap-1">
                  <MessageSquare size={10} /> {entry.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
