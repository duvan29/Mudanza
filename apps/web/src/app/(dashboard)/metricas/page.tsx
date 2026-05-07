import { connectDB } from '@/lib/db';
import { Fund, Movement, User } from '@/lib/models';
import { requireSession } from '@/lib/auth';
import { formatCOP } from '@/lib/utils';
import { TOTAL_TARGET } from '@mudanza/types';
import { TrendingUp, Target, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default async function MetricasPage() {
  await requireSession();
  await connectDB();

  const funds = await Fund.find().sort({ order: 1 }).lean() as any[];
  const totalSaved = funds.reduce((sum: number, f: any) => sum + f.saved, 0);
  const percentage = Math.round((totalSaved / TOTAL_TARGET) * 100);
  const remaining = TOTAL_TARGET - totalSaved;

  const monthlyHistory = await Movement.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' } } },
    { $sort: { _id: -1 } },
    { $limit: 12 },
  ]);

  const recentMonths = monthlyHistory.slice(0, 3);
  const velocity = recentMonths.length > 0
    ? Math.round(recentMonths.reduce((s, m) => s + m.total, 0) / recentMonths.length)
    : 0;
  const monthlyRequired = remaining > 0 ? Math.round(remaining / 5) : 0;
  const onTrack = velocity >= monthlyRequired;

  const contributions = await Movement.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: '$userId', total: { $sum: '$amount' } } },
  ]);
  const users = await User.find().select('displayName').lean() as any[];
  const userMap = Object.fromEntries(users.map((u: any) => [u._id.toString(), u.displayName]));

  const monthNames: Record<string, string> = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
  };

  const statCards = [
    { icon: Target, label: 'Completado', value: `${percentage}%`, color: 'from-primary-light to-primary' },
    { icon: Zap, label: 'Velocidad/mes', value: formatCOP(velocity), color: 'from-accent to-accent-dark' },
    { icon: TrendingUp, label: 'Necesario/mes', value: formatCOP(monthlyRequired), color: 'from-secondary-light to-secondary' },
    { icon: Clock, label: 'Proyección', value: onTrack ? 'A tiempo' : 'Ajustar', color: onTrack ? 'from-success to-success-dark' : 'from-warning to-warning-dark' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text tracking-tight">Métricas</h1>
        <p className="text-text-muted mt-1 text-sm">Análisis de tu progreso</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-surface rounded-[var(--radius-lg)] border border-border-light p-4 shadow-[var(--shadow-sm)]">
            <div className={`w-9 h-9 rounded-[var(--radius-sm)] bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon size={16} className="text-white" />
            </div>
            <p className="text-lg font-bold text-text tabular-nums">{value}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Per fund */}
      <section>
        <h2 className="font-display text-xl font-semibold text-text mb-4">Por fondo</h2>
        <div className="space-y-3">
          {funds.map((fund) => {
            const pct = fund.target > 0 ? Math.round((fund.saved / fund.target) * 100) : 0;
            return (
              <div key={fund._id.toString()} className="bg-surface rounded-[var(--radius-lg)] border border-border-light p-4 shadow-[var(--shadow-sm)]">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fund.color }} />
                    <span className="text-sm font-medium text-text">{fund.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: fund.color }}>{pct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-alt overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: fund.color }} />
                </div>
                <p className="text-xs text-text-muted mt-2">{formatCOP(fund.saved)} / {formatCOP(fund.target)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contributions */}
      <section>
        <h2 className="font-display text-xl font-semibold text-text mb-4">Aportes por persona</h2>
        <div className="bg-surface rounded-[var(--radius-xl)] border border-border-light shadow-[var(--shadow-sm)] p-5 space-y-5">
          {contributions.map((c) => {
            const pct = totalSaved > 0 ? Math.round((c.total / totalSaved) * 100) : 0;
            return (
              <div key={c._id.toString()} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-light/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-secondary-dark">
                    {(userMap[c._id.toString()] ?? '?')[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-text">{userMap[c._id.toString()]}</span>
                    <span className="text-sm font-semibold text-text tabular-nums">{formatCOP(c.total)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-secondary-light to-secondary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs font-medium text-text-muted w-10 text-right tabular-nums">{pct}%</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Monthly history */}
      <section>
        <h2 className="font-display text-xl font-semibold text-text mb-4">Historial mensual</h2>
        {monthlyHistory.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">Aún no hay movimientos registrados</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {monthlyHistory.map((m) => {
              const [year, month] = m._id.split('-');
              const maxAmount = Math.max(...monthlyHistory.map((x) => x.total));
              const barWidth = maxAmount > 0 ? (m.total / maxAmount) * 100 : 0;
              return (
                <div key={m._id} className="bg-surface rounded-[var(--radius-md)] border border-border-light p-3.5 flex items-center gap-3">
                  <span className="text-xs font-medium text-text-secondary w-16">{monthNames[month]} {year}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-alt overflow-hidden">
                    <div className="h-full rounded-full bg-primary-light transition-all" style={{ width: `${barWidth}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-text tabular-nums">{formatCOP(m.total)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
