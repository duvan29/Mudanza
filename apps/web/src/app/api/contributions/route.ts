import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Fund, Movement, recalcFund } from '@/lib/models';
import { getSession } from '@/lib/auth';

// POST /api/contributions
// Creates a single deposit and distributes it proportionally across all funds
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const { amount, note } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
  }

  // Get all funds and calculate proportions
  const funds = await Fund.find().sort({ order: 1 });
  const totalTarget = funds.reduce((sum, f) => sum + f.target, 0);

  if (totalTarget === 0 || funds.length === 0) {
    return NextResponse.json({ error: 'No hay fondos configurados' }, { status: 400 });
  }

  // Distribute proportionally based on each fund's target
  const distributions: { fundId: string; fundName: string; amount: number; percentage: number }[] = [];
  let distributed = 0;

  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    const proportion = fund.target / totalTarget;
    // Last fund gets the remainder to avoid rounding issues
    const fundAmount = i === funds.length - 1
      ? amount - distributed
      : Math.round(amount * proportion);

    distributed += fundAmount;

    if (fundAmount > 0) {
      // Create movement for this fund
      await Movement.create({
        fundId: fund._id,
        userId: session.userId,
        amount: fundAmount,
        type: 'deposit',
        note: note ? `${note} (dist. ${Math.round(proportion * 100)}%)` : `Aporte distribuido (${Math.round(proportion * 100)}%)`,
        date: new Date(),
      });

      // Recalculate fund saved total
      await recalcFund(fund._id.toString());

      distributions.push({
        fundId: fund._id.toString(),
        fundName: fund.name,
        amount: fundAmount,
        percentage: Math.round(proportion * 100),
      });
    }
  }

  return NextResponse.json({
    data: {
      totalAmount: amount,
      distributions,
    },
  }, { status: 201 });
}
