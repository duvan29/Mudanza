import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Fund, Movement, User } from '@/lib/models';
import { getSession } from '@/lib/auth';
import { TOTAL_TARGET } from '@mudanza/types';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();

  const funds = await Fund.find().sort({ order: 1 }).lean();
  const totalSaved = funds.reduce((sum, f) => sum + f.saved, 0);
  const totalTarget = TOTAL_TARGET;
  const percentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const remaining = totalTarget - totalSaved;

  // Monthly history
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

  // Velocity (average of last 3 months)
  const recentMonths = monthlyHistory.slice(0, 3);
  const currentVelocity =
    recentMonths.length > 0
      ? Math.round(recentMonths.reduce((s, m) => s + m.totalDeposited, 0) / recentMonths.length)
      : 0;

  const monthlyRequired = remaining > 0 ? Math.round(remaining / 5) : 0; // 5 months left approx
  const projectedMonths = currentVelocity > 0 ? Math.ceil(remaining / currentVelocity) : null;
  const onTrack = currentVelocity >= monthlyRequired;

  // Contributions by user
  const contributionsByUser = await Movement.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: '$userId', totalContributed: { $sum: '$amount' } } },
  ]);

  const users = await User.find().select('displayName').lean();
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u.displayName]));

  const contributionsFormatted = contributionsByUser.map((c) => ({
    userId: c._id.toString(),
    displayName: userMap[c._id.toString()] ?? 'Unknown',
    totalContributed: c.totalContributed,
    percentageOfTotal: totalSaved > 0 ? Math.round((c.totalContributed / totalSaved) * 100) : 0,
  }));

  // Funds breakdown
  const fundsFormatted = funds.map((f) => ({
    fundId: f._id.toString(),
    name: f.name,
    target: f.target,
    saved: f.saved,
    percentage: f.target > 0 ? Math.round((f.saved / f.target) * 100) : 0,
    color: f.color,
  }));

  const monthNames: Record<string, string> = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
  };

  return NextResponse.json({
    data: {
      totalSaved,
      totalTarget,
      percentage,
      remaining,
      monthlyRequired,
      currentVelocity,
      projectedMonths,
      onTrack,
      contributionsByUser: contributionsFormatted,
      monthlyHistory: monthlyHistory.map((m) => ({
        month: `${monthNames[m._id.split('-')[1]] ?? m._id.split('-')[1]} ${m._id.split('-')[0]}`,
        totalDeposited: m.totalDeposited,
      })),
      funds: fundsFormatted,
    },
  });
}
