import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProductGoal, ProductVersion } from '@/lib/models';
import { getSession } from '@/lib/auth';

// GET /api/products
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const products = await ProductGoal.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: products });
}

// POST /api/products
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const { name, fundId, budget } = await req.json();

  if (!name || !fundId || !budget) {
    return NextResponse.json({ error: 'name, fundId y budget requeridos' }, { status: 400 });
  }

  const product = await ProductGoal.create({ name, fundId, budget });
  return NextResponse.json({ data: product }, { status: 201 });
}
