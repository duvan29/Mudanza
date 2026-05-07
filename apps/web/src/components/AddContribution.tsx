'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiggyBank, Loader2, Sparkles, Check } from 'lucide-react';

interface Distribution {
  fundName: string;
  amount: number;
  percentage: number;
}

interface Fund {
  name: string;
  target: number;
  color: string;
}

function formatCOP(amount: number) {
  return '$' + amount.toLocaleString('es-CO');
}

export function AddContribution({ funds, totalTarget }: { funds: Fund[]; totalTarget: number }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Distribution[] | null>(null);

  const amountNum = parseInt(amount, 10) || 0;

  // Preview distribution
  const preview = funds.map((f) => {
    const proportion = f.target / totalTarget;
    return {
      name: f.name,
      color: f.color,
      amount: Math.round(amountNum * proportion),
      percentage: Math.round(proportion * 100),
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountNum || amountNum <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum, note: note.trim() || undefined }),
      });
      const json = await res.json();

      if (res.ok) {
        setSuccess(json.data.distributions);
        setAmount('');
        setNote('');
        setTimeout(() => {
          setSuccess(null);
          setShowForm(false);
          router.refresh();
        }, 3000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Success animation
  if (success) {
    return (
      <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-[var(--radius-2xl)] border border-success/30 p-6 shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-success-dark flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
          <h3 className="font-display text-lg font-semibold text-success-dark">¡Aporte registrado!</h3>
        </div>
        <div className="space-y-2">
          {success.map((d) => (
            <div key={d.fundName} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{d.fundName} ({d.percentage}%)</span>
              <span className="font-semibold text-success-dark tabular-nums">{formatCOP(d.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-[var(--radius-2xl)] border border-border-light shadow-[var(--shadow-sm)] overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full p-5 flex items-center gap-3 hover:bg-surface-alt/30 transition-colors"
      >
        <div className="w-11 h-11 rounded-[var(--radius-md)] bg-gradient-to-br from-primary-light to-primary flex items-center justify-center shadow-sm">
          <PiggyBank size={20} className="text-white" />
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-text">Agregar aporte</p>
          <p className="text-xs text-text-muted">Se distribuye automáticamente entre los fondos</p>
        </div>
        <Sparkles size={16} className="text-primary" />
      </button>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border-t border-border-light p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
              Monto total (COP)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.000.000"
              className="w-full px-4 py-3.5 rounded-[var(--radius-md)] border border-border bg-surface-alt text-text text-lg font-semibold placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light/30 tabular-nums"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider">
              Nota (opcional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Quincena mayo, Bonificación..."
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-border bg-surface-alt text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light/30 text-sm"
            />
          </div>

          {/* Distribution preview */}
          {amountNum > 0 && (
            <div className="bg-surface-alt rounded-[var(--radius-lg)] p-4 border border-border-light">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">Distribución prevista</p>
              <div className="space-y-2.5">
                {preview.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-xs text-text-secondary flex-1">{p.name}</span>
                    <span className="text-xs text-text-muted">{p.percentage}%</span>
                    <span className="text-xs font-semibold text-text tabular-nums w-24 text-right">{formatCOP(p.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs font-semibold text-text">Total</span>
                <span className="text-sm font-bold text-primary-dark tabular-nums">{formatCOP(amountNum)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || amountNum <= 0}
            className="w-full py-3.5 rounded-[var(--radius-md)] bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Distribuyendo...
              </>
            ) : (
              <>
                <PiggyBank size={16} />
                Registrar aporte
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
