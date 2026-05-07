import { connectDB } from '@/lib/db';
import { Fund } from '@/lib/models';
import { requireSession } from '@/lib/auth';
import { formatCOP } from '@/lib/utils';
import { TOTAL_TARGET } from '@mudanza/types';
import { FundDetail } from '@/components/FundDetail';
import { AddContribution } from '@/components/AddContribution';

export default async function FondosPage() {
  await requireSession();
  await connectDB();

  const funds = await Fund.find().sort({ order: 1 }).lean();
  const totalSaved = funds.reduce((sum, f) => sum + f.saved, 0);
  const totalPct = Math.round((totalSaved / TOTAL_TARGET) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-text tracking-tight">Fondos de ahorro</h1>
        <p className="text-text-muted mt-1 text-sm">
          {formatCOP(totalSaved)} de {formatCOP(TOTAL_TARGET)} — <span className="font-medium text-primary-dark">{totalPct}%</span>
        </p>
      </div>

      {/* Total bar */}
      <div className="w-full h-3 rounded-full bg-surface-alt overflow-hidden border border-border-light">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-light via-primary to-primary-dark transition-all duration-700"
          style={{ width: `${totalPct}%` }}
        />
      </div>

      {/* Quick add */}
      <AddContribution
        funds={funds.map((f) => ({ name: f.name, target: f.target, color: f.color }))}
        totalTarget={TOTAL_TARGET}
      />

      <div className="space-y-4">
        {funds.map((fund) => (
          <FundDetail key={fund._id.toString()} fund={JSON.parse(JSON.stringify(fund))} />
        ))}
      </div>
    </div>
  );
}
