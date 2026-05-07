'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCOP } from '@/lib/utils';
import { MovementRow } from './MovementRow';
import { ChevronDown, ChevronUp, Plus, Send, Loader2, ArrowUpRight, Settings2 } from 'lucide-react';
import { CurrencyInput } from './CurrencyInput';

interface Fund {
  _id: string;
  name: string;
  target: number;
  saved: number;
  color: string;
}

interface Movement {
  _id: string;
  amount: number;
  type: string;
  note?: string;
  date?: string;
  userId?: { displayName?: string };
}

export function FundDetail({ fund }: { fund: Fund }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'deposit' | 'adjustment'>('deposit');
  const [submitting, setSubmitting] = useState(false);

  const percentage = fund.target > 0 ? Math.round((fund.saved / fund.target) * 100) : 0;

  const loadMovements = async () => {
    if (movements.length > 0) return;
    setLoadingMovements(true);
    try {
      const res = await fetch(`/api/movements?fundId=${fund._id}`);
      const json = await res.json();
      setMovements(json.data ?? []);
    } finally {
      setLoadingMovements(false);
    }
  };

  const handleExpand = () => {
    if (!expanded) loadMovements();
    setExpanded(!expanded);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(amount, 10);
    if (!amountNum || amountNum <= 0) return;

    setSubmitting(true);
    try {
      await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fundId: fund._id, amount: amountNum, type, note: note.trim() || undefined }),
      });
      setAmount('');
      setNote('');
      setShowForm(false);
      const res = await fetch(`/api/movements?fundId=${fund._id}`);
      const json = await res.json();
      setMovements(json.data ?? []);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow">
      {/* Header */}
      <button onClick={handleExpand} className="w-full p-5 flex items-center gap-4 hover:bg-surface-alt/30 transition-colors">
        <div
          className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ backgroundColor: `${fund.color}25` }}
        >
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: fund.color }} />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-text">{fund.name}</p>
          <p className="text-xs text-text-muted mt-0.5">{formatCOP(fund.saved)} / {formatCOP(fund.target)}</p>
        </div>
        <span
          className="text-sm font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${fund.color}15`, color: fund.color }}
        >
          {percentage}%
        </span>
        {expanded
          ? <ChevronUp size={18} className="text-text-muted" />
          : <ChevronDown size={18} className="text-text-muted" />
        }
      </button>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%`, backgroundColor: fund.color }}
          />
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border-light">
          {/* Add button */}
          <div className="px-5 py-3 flex justify-end">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary-dark hover:text-primary transition-colors"
            >
              <Plus size={16} /> Agregar movimiento
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <form onSubmit={handleAdd} className="px-5 pb-5 space-y-3">
              <div className="flex gap-2">
                {(['deposit', 'adjustment'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                      type === t
                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-sm'
                        : 'bg-surface-alt text-text-secondary border border-border hover:bg-surface-hover'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {t === 'deposit' ? <><ArrowUpRight size={14} /> Abono</> : <><Settings2 size={14} /> Ajuste</>}
                    </span>
                  </button>
                ))}
              </div>
              <CurrencyInput
                value={amount}
                onChange={setAmount}
                placeholder="1.000.000"
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-border bg-surface-alt text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light/30 text-sm"
                required
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota (opcional) — ej: Quincena mayo"
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-border bg-surface-alt text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light/30 text-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-[var(--radius-md)] bg-gradient-to-r from-primary to-primary-dark text-white font-medium text-sm shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                {submitting ? 'Guardando...' : 'Agregar'}
              </button>
            </form>
          )}

          {/* Movements */}
          {loadingMovements ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : movements.length > 0 ? (
            <div className="divide-y divide-border-light">
              {movements.map((mov) => (
                <MovementRow
                  key={mov._id}
                  amount={mov.amount}
                  type={mov.type}
                  note={mov.note}
                  date={mov.date}
                  userName={(mov.userId as any)?.displayName}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-text-muted py-6">Sin movimientos aún</p>
          )}
        </div>
      )}
    </div>
  );
}
