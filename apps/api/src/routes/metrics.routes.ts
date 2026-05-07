import type { FastifyInstance } from 'fastify';
import { Movement } from '../models/Movement';
import { Fund } from '../models/Fund';
import { User } from '../models/User';
import { TOTAL_TARGET } from '@mudanza/types';

export async function metricsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /metrics — full metrics snapshot
  fastify.get('/', async (_request, reply) => {
    // Get all funds
    const funds = await Fund.find().sort({ order: 1 });
    const totalSaved = funds.reduce((sum, f) => sum + f.saved, 0);
    const totalTarget = TOTAL_TARGET;
    const percentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 10000) / 100 : 0;
    const remaining = Math.max(0, totalTarget - totalSaved);

    // Monthly history via aggregation
    const rawHistory = await Movement.aggregate([
      { $match: { deleted: false } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$date' } },
            userId: '$userId',
          },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Group by month
    const monthsMap = new Map<string, { totalDeposited: number; byUser: { userId: string; amount: number }[] }>();
    for (const row of rawHistory) {
      const month = row._id.month as string;
      if (!monthsMap.has(month)) {
        monthsMap.set(month, { totalDeposited: 0, byUser: [] });
      }
      const entry = monthsMap.get(month)!;
      entry.totalDeposited += row.amount as number;
      entry.byUser.push({ userId: row._id.userId.toString(), amount: row.amount as number });
    }

    const monthlyHistory = Array.from(monthsMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));

    // Velocity: average of last 2 months of actual deposits
    const lastTwoMonths = monthlyHistory.slice(-2);
    const currentVelocity = lastTwoMonths.length > 0
      ? Math.round(lastTwoMonths.reduce((sum, m) => sum + m.totalDeposited, 0) / lastTwoMonths.length)
      : 0;

    // Projection: months needed at current velocity
    const projectedMonths = currentVelocity > 0
      ? Math.ceil(remaining / currentVelocity)
      : null;

    // Months remaining until October 2026
    const now = new Date();
    const target = new Date('2026-10-01');
    const monthsRemaining = Math.max(0,
      (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
    );

    const onTrack = projectedMonths !== null && projectedMonths <= monthsRemaining;

    // Monthly savings needed to reach target on time
    const monthlyRequired = monthsRemaining > 0 ? Math.ceil(remaining / monthsRemaining) : remaining;

    // Per-user contributions
    const users = await User.find().select('displayName');
    const userContributions = await Movement.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: '$userId', totalContributed: { $sum: '$amount' } } },
    ]);

    const contributionsByUser = users.map(user => {
      const contrib = userContributions.find(c => c._id.toString() === user._id.toString());
      const totalContributed = (contrib?.totalContributed ?? 0) as number;
      return {
        userId: user._id.toString(),
        displayName: user.displayName,
        totalContributed,
        percentageOfTotal: totalSaved > 0
          ? Math.round((totalContributed / totalSaved) * 10000) / 100
          : 0,
      };
    });

    return reply.send({
      data: {
        totalSaved,
        totalTarget,
        percentage,
        remaining,
        monthlyRequired,
        currentVelocity,
        projectedMonths,
        onTrack,
        contributionsByUser,
        monthlyHistory,
        funds: funds.map(f => ({
          fundId: f._id.toString(),
          name: f.name,
          saved: f.saved,
          target: f.target,
          percentage: f.target > 0 ? Math.round((f.saved / f.target) * 10000) / 100 : 0,
        })),
      },
    });
  });
}
