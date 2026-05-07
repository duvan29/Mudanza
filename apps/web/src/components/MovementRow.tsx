'use client';

import { formatCOP } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MovementRowProps {
  amount: number;
  type: string;
  note?: string;
  date?: string;
  userName?: string;
}

export function MovementRow({ amount, type, note, date, userName }: MovementRowProps) {
  const isDeposit = type === 'deposit';
  const formattedDate = date
    ? new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div className="flex items-center justify-between px-5 py-3.5 group hover:bg-surface-alt/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center ${isDeposit ? 'bg-success/20' : 'bg-warning/20'}`}>
          {isDeposit
            ? <ArrowUpRight size={16} className="text-success-dark" />
            : <ArrowDownRight size={16} className="text-warning-dark" />
          }
        </div>
        <div>
          <p className="text-sm font-medium text-text leading-tight">{note ?? (isDeposit ? 'Abono' : 'Ajuste')}</p>
          <p className="text-[11px] text-text-muted mt-0.5">{userName} • {formattedDate}</p>
        </div>
      </div>
      <span className={`text-sm font-semibold tabular-nums ${isDeposit ? 'text-success-dark' : 'text-warning-dark'}`}>
        {isDeposit ? '+' : ''}{formatCOP(amount)}
      </span>
    </div>
  );
}
