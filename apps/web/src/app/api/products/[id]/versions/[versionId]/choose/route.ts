import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ProductVersion } from '@/lib/models';
import { getSession } from '@/lib/auth';

// PATCH /api/products/[id]/versions/[versionId]/choose
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { id, versionId } = await params;
  await connectDB();

  // Unset all others
  await ProductVersion.updateMany({ goalId: id }, { chosen: false });
  // Set chosen
  const version = await ProductVersion.findByIdAndUpdate(versionId, { chosen: true }, { new: true });

  if (!version) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ data: version });
}
