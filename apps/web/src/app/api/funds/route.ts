import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Fund } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();
  const funds = await Fund.find().sort({ order: 1 }).lean();
  return NextResponse.json({ data: funds });
}
