'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function MigrateJan15Page() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/migrate-jan15', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error desconocido');
      setResult(json.data);
    } catch (e: any) {
      setError(e.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-text tracking-tight">
          Migración: plan enero 2027
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Página temporal — solo actualiza metas de fondos y texto del roadmap. No toca
          movimientos ni ahorros. Se puede correr varias veces sin problema.
        </p>
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="px-5 py-2.5 rounded-[var(--radius-md)] bg-primary text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Aplicando...' : 'Aplicar migración'}
      </button>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-[var(--radius-md)] p-4 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-surface border border-border-light rounded-[var(--radius-lg)] p-5 space-y-4 text-sm">
          <div>
            <p className="font-semibold text-text mb-1">Fondos actualizados</p>
            {result.fundsUpdated.length === 0 ? <p className="text-text-muted">(ninguno)</p> : (
              <ul className="list-disc list-inside text-text-secondary">
                {result.fundsUpdated.map((s: string) => <li key={s}>{s}</li>)}
              </ul>
            )}
            {result.fundsSkipped.length > 0 && (
              <p className="text-text-muted text-xs mt-1">Omitidos: {result.fundsSkipped.join(', ')}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-text mb-1">Texto del roadmap actualizado</p>
            {result.roadmapTextUpdated.length === 0 ? <p className="text-text-muted">(ninguno)</p> : (
              <ul className="list-disc list-inside text-text-secondary">
                {result.roadmapTextUpdated.map((s: string) => <li key={s}>{s}</li>)}
              </ul>
            )}
            {result.roadmapTextSkipped.length > 0 && (
              <p className="text-text-muted text-xs mt-1">Omitidos: {result.roadmapTextSkipped.join(', ')}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-text mb-1">
              Año agregado a {result.roadmapYearBackfilled} tarjeta(s) existente(s)
            </p>
          </div>

          <div>
            <p className="font-semibold text-text mb-1">Tarjetas nuevas creadas</p>
            {result.roadmapCreated.length === 0 ? <p className="text-text-muted">(ninguna)</p> : (
              <ul className="list-disc list-inside text-text-secondary">
                {result.roadmapCreated.map((s: string) => <li key={s}>{s}</li>)}
              </ul>
            )}
            {result.roadmapCreatedSkipped.length > 0 && (
              <p className="text-text-muted text-xs mt-1">Omitidos: {result.roadmapCreatedSkipped.join(', ')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
