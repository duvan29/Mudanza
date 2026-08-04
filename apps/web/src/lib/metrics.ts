import { connectDB } from '@/lib/db';
import { Fund, Movement, User } from '@/lib/models';
import { TOTAL_TARGET, TIMELINE, type IMetrics } from '@mudanza/types';

const MS_PER_DAY = 86_400_000;
const AVG_DAYS_PER_MONTH = 30.44;

/** Real (possibly fractional, possibly negative once past the deadline) months between `from` and `endDate`. */
export function monthsRemaining(endDate: Date, from: Date = new Date()): number {
  const days = (endDate.getTime() - from.getTime()) / MS_PER_DAY;
  return days / AVG_DAYS_PER_MONTH;
}

const monthNames: Record<string, string> = {
  '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
  '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
  '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
};

/** Single source of truth for the dashboard/timeline math — replaces the old hardcoded "5 months left". */
export async function computeMetrics(): Promise<IMetrics> {
  await connectDB();

  const funds = await Fund.find().sort({ order: 1 }).lean() as any[];
  const totalSaved = funds.reduce((sum: number, f: any) => sum + f.saved, 0);
  const totalTarget = TOTAL_TARGET;
  const percentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const remaining = totalTarget - totalSaved;

  const monthlyHistory = await Movement.aggregate([
    { $match: { deleted: false } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
        totalDeposited: { $sum: '$amount' },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 12 },
  ]);

  const recentMonths = monthlyHistory.slice(0, 3);
  const currentVelocity =
    recentMonths.length > 0
      ? Math.round(recentMonths.reduce((s, m) => s + m.totalDeposited, 0) / recentMonths.length)
      : 0;

  // At least ~1 day of runway so a deadline that's today/past doesn't divide by zero or go negative.
  const monthsLeft = Math.max(monthsRemaining(new Date(TIMELINE.end)), 1 / 30);
  const monthlyRequired = remaining > 0 ? Math.round(remaining / monthsLeft) : 0;
  const projectedMonths = currentVelocity > 0 ? Math.ceil(remaining / currentVelocity) : null;
  const onTrack = currentVelocity >= monthlyRequired;

  const contributionsByUserRaw = await Movement.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: '$userId', totalContributed: { $sum: '$amount' } } },
  ]);

  const users = await User.find().select('displayName').lean() as any[];
  const userMap = Object.fromEntries(users.map((u: any) => [u._id.toString(), u.displayName]));

  const contributionsByUser = contributionsByUserRaw.map((c) => ({
    userId: c._id.toString(),
    displayName: userMap[c._id.toString()] ?? 'Unknown',
    totalContributed: c.totalContributed,
    percentageOfTotal: totalSaved > 0 ? Math.round((c.totalContributed / totalSaved) * 100) : 0,
  }));

  const fundsFormatted = funds.map((f: any) => ({
    fundId: f._id.toString(),
    name: f.name,
    target: f.target,
    saved: f.saved,
    percentage: f.target > 0 ? Math.round((f.saved / f.target) * 100) : 0,
    color: f.color,
  }));

  return {
    totalSaved,
    totalTarget,
    percentage,
    remaining,
    monthlyRequired,
    currentVelocity,
    projectedMonths,
    onTrack,
    contributionsByUser,
    monthlyHistory: monthlyHistory.map((m) => ({
      month: `${monthNames[m._id.split('-')[1]] ?? m._id.split('-')[1]} ${m._id.split('-')[0]}`,
      totalDeposited: m.totalDeposited,
    })),
    funds: fundsFormatted,
  };
}
