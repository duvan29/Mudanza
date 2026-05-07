import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { RoadmapMonth } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const months = await RoadmapMonth.find().sort({ order: 1 }).lean();
  return NextResponse.json({ data: months });
}

// PATCH /api/roadmap?id=xxx
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const { id, status, note } = await req.json();

  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (status) update.status = status;
  if (note !== undefined) update.note = note;

  const month = await RoadmapMonth.findByIdAndUpdate(id, update, { new: true });
  if (!month) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  return NextResponse.json({ data: month });
}
