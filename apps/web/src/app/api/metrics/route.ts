import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { computeMetrics } from '@/lib/metrics';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const data = await computeMetrics();

  return NextResponse.json({ data });
}
