import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProductVersion } from '@/lib/models';
import { getSession } from '@/lib/auth';

// GET /api/products/[id]/versions
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const versions = await ProductVersion.find({ goalId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: versions });
}

// POST /api/products/[id]/versions
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const { name, price, store, link, notes } = await req.json();

  if (!name || !price || !store) {
    return NextResponse.json({ error: 'name, price y store requeridos' }, { status: 400 });
  }

  const version = await ProductVersion.create({
    goalId: id,
    name,
    price,
    store,
    link,
    notes,
    createdBy: session.userId,
  });

  return NextResponse.json({ data: version }, { status: 201 });
}
