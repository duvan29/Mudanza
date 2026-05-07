import { connectDB } from '@/lib/db';
import { Fund, Movement, User } from '@/lib/models';
import { requireSession } from '@/lib/auth';
import { formatCOP } from '@/lib/utils';
import { TOTAL_TARGET } from '@mudanza/types';
import { ProgressRing } from '@/components/ProgressRing';
import { FundCard } from '@/components/FundCard';
import { MovementRow } from '@/components/MovementRow';
import { AddContribution } from '@/components/AddContribution';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default async function InicioPage() {
  const session = await requireSession();
  await connectDB();

  const currentUser = await User.findById(session.userId).select('displayName').lean() as any;

  const funds = await Fund.find().sort({ order: 1 }).lean() as any[];
  const totalSaved = funds.reduce((sum, f) => sum + f.saved, 0);
  const percentage = Math.round((totalSaved / TOTAL_TARGET) * 100);
  const remaining = TOTAL_TARGET - totalSaved;

  const recentMovements = await Movement.find({ deleted: false })
    .sort({ date: -1 })
    .limit(5)
    .populate('userId', 'displayName')
    .lean() as any[];

  // Velocity
  const monthlyHistory = await Movement.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' } } },
    { $sort: { _id: -1 } },
    { $limit: 3 },
  ]);
  const velocity = monthlyHistory.length > 0
    ? Math.round(monthlyHistory.reduce((s, m) => s + m.total, 0) / monthlyHistory.length)
    : 0;
  const monthlyRequired = remaining > 0 ? Math.round(remaining / 5) : 0;
  const onTrack = velocity >= monthlyRequired;
  const projectedMonths = velocity > 0 ? Math.ceil(remaining / velocity) : null;

  // Contributions
  const contributions = await Movement.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: '$userId', total: { $sum: '$amount' } } },
  ]);
  const users = await User.find().select('displayName').lean() as any[];
  const userMap = Object.fromEntries(users.map((u: any) => [u._id.toString(), u.displayName]));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold text-text tracking-tight">
          Hola, {currentUser?.displayName ?? 'Usuario'}
        </h1>
        <p className="text-text-muted mt-1 text-sm">Tu mudanza está en camino</p>
      </div>

      {/* Hero Progress Card */}
      <div className="relative bg-surface rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-lg)] border border-border-light overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-light/15 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-secondary-light/10 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium text-text-secondary">Progreso total</span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${onTrack ? 'bg-success/15 border-success/30 text-success-dark' : 'bg-warning/15 border-warning/30 text-warning-dark'}`}>
              {onTrack ? <><CheckCircle size={12} className="inline mr-1" />A tiempo</> : <><AlertTriangle size={12} className="inline mr-1" />Ajustar ritmo</>}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ProgressRing percentage={percentage} size={140} />
            <div className="flex-1 text-center sm:text-left">
              <p className="font-display text-3xl font-bold text-text">{formatCOP(totalSaved)}</p>
              <p className="text-sm text-text-muted mt-1">de {formatCOP(TOTAL_TARGET)}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border-light">
            <div className="text-center">
              <p className="text-base font-semibold text-text tabular-nums">{formatCOP(remaining)}</p>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mt-0.5">Faltante</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-text tabular-nums">{formatCOP(velocity)}</p>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mt-0.5">Velocidad/mes</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-text tabular-nums">
                {projectedMonths ? `${projectedMonths} meses` : '—'}
              </p>
              <p className="text-[11px] text-text-muted uppercase tracking-wider mt-0.5">Proyección</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add contribution */}
      <AddContribution
        funds={funds.map((f) => ({ name: f.name, target: f.target, color: f.color }))}
        totalTarget={TOTAL_TARGET}
      />

      {/* Funds */}
      <section>
        <h2 className="font-display text-xl font-semibold text-text mb-4">Fondos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {funds.map((fund) => (
            <FundCard key={fund._id.toString()} fund={JSON.parse(JSON.stringify(fund))} />
          ))}
        </div>
      </section>

      {/* Recent movements */}
      {recentMovements.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-text mb-4">Últimos movimientos</h2>
          <div className="bg-surface rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] divide-y divide-border-light overflow-hidden">
            {recentMovements.map((mov) => (
              <MovementRow
                key={mov._id.toString()}
                amount={mov.amount}
                type={mov.type}
                note={mov.note}
                date={mov.date?.toISOString() ?? mov.createdAt?.toISOString()}
                userName={(mov.userId as any)?.displayName}
              />
            ))}
          </div>
        </section>
      )}

      {/* Contributions */}
      {contributions.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-text mb-4">Aportes</h2>
          <div className="bg-surface rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] p-5 space-y-4">
            {contributions.map((c) => {
              const pct = totalSaved > 0 ? Math.round((c.total / totalSaved) * 100) : 0;
              return (
                <div key={c._id.toString()} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary-light/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-secondary-dark">
                      {(userMap[c._id.toString()] ?? '?')[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-text">{userMap[c._id.toString()]}</span>
                      <span className="text-sm font-semibold text-text tabular-nums">{formatCOP(c.total)}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-alt overflow-hidden">
                      <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-text-muted w-10 text-right tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
