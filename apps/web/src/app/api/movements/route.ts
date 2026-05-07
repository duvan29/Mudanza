import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Movement, recalcFund } from '@/lib/models';
import { getSession } from '@/lib/auth';

// GET /api/movements?fundId=xxx
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const fundId = req.nextUrl.searchParams.get('fundId');
  const filter: Record<string, unknown> = { deleted: false };
  if (fundId) filter.fundId = fundId;

  const movements = await Movement.find(filter)
    .sort({ date: -1 })
    .populate('userId', 'displayName')
    .lean();

  return NextResponse.json({ data: movements });
}

// POST /api/movements
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const { fundId, amount, type, note } = await req.json();

  if (!fundId || !amount || !type) {
    return NextResponse.json({ error: 'fundId, amount y type son requeridos' }, { status: 400 });
  }

  const movement = await Movement.create({
    fundId,
    userId: session.userId,
    amount,
    type,
    note,
    date: new Date(),
  });

  // Recalc is triggered by post-save hook, but just in case:
  await recalcFund(fundId);

  return NextResponse.json({ data: movement }, { status: 201 });
}

// DELETE /api/movements?id=xxx (soft delete)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const movement = await Movement.findByIdAndUpdate(id, { deleted: true }, { new: true });
  if (!movement) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await recalcFund(movement.fundId.toString());
  return NextResponse.json({ data: { success: true } });
}
