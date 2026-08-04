import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Fund, RoadmapMonth } from '@/lib/models';

// Temporary, session-gated trigger for the one-time Jan 15 2027 plan migration.
// Mirrors apps/web/scripts/migrate-jan15.ts exactly, using the app's live DB connection
// since this sandbox can't reach Atlas directly. Idempotent and non-destructive: only
// touches Fund.target (by name) and RoadmapMonth.action/year (by order) — never Movement
// or Fund.saved, and existing status/note on RoadmapMonth entries are left untouched.
// Remove this route (and the /admin/migrate-jan15 page) once the migration has run.

const FUND_TARGET_UPDATES: { name: string; newTarget: number }[] = [
  { name: 'Reserva emergencia', newTarget: 9_000_000 },
  { name: 'Colchón general', newTarget: 14_300_000 },
];

const ROADMAP_ACTION_UPDATES: { order: number; newAction: string }[] = [
  { order: 9, newAction: 'Revisión de plazo extendido — subir aportes para la nueva meta de $30M' },
  { order: 10, newAction: 'Seguir ahorrando al nuevo ritmo — reforzar Colchón y Emergencia' },
];

const NEW_ROADMAP_MONTHS = [
  { month: 'Nov', year: 2026, order: 11, action: 'Buscar apartamento y agendar visitas para enero', status: 'pending', note: null },
  { month: 'Dic', year: 2026, order: 12, action: 'Firmar contrato y coordinar logística de trasteo', status: 'pending', note: null },
  { month: 'Ene', year: 2027, order: 13, action: 'Mudanza — instalarse en el nuevo hogar (15 de enero)', status: 'pending', note: null },
];

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  await connectDB();

  const fundsUpdated: string[] = [];
  const fundsSkipped: string[] = [];
  for (const { name, newTarget } of FUND_TARGET_UPDATES) {
    const fund = await Fund.findOne({ name });
    if (!fund) {
      fundsSkipped.push(`${name}: no encontrado`);
      continue;
    }
    if (fund.target === newTarget) {
      fundsSkipped.push(`${name}: ya está en $${newTarget.toLocaleString('es-CO')}`);
      continue;
    }
    const before = fund.target;
    await Fund.updateOne({ _id: fund._id }, { $set: { target: newTarget } });
    fundsUpdated.push(`${name}: $${before.toLocaleString('es-CO')} -> $${newTarget.toLocaleString('es-CO')}`);
  }

  const roadmapTextUpdated: string[] = [];
  const roadmapTextSkipped: string[] = [];
  for (const { order, newAction } of ROADMAP_ACTION_UPDATES) {
    const entry = await RoadmapMonth.findOne({ order });
    if (!entry) {
      roadmapTextSkipped.push(`orden ${order}: no encontrado`);
      continue;
    }
    if (entry.action === newAction) {
      roadmapTextSkipped.push(`orden ${order}: texto ya actualizado`);
      continue;
    }
    await RoadmapMonth.updateOne({ _id: entry._id }, { $set: { action: newAction } });
    roadmapTextUpdated.push(`orden ${order} (status="${entry.status}" preservado)`);
  }

  const backfillResult = await RoadmapMonth.updateMany(
    { year: { $exists: false } },
    { $set: { year: 2026 } }
  );

  const roadmapCreated: string[] = [];
  const roadmapCreatedSkipped: string[] = [];
  for (const month of NEW_ROADMAP_MONTHS) {
    const exists = await RoadmapMonth.findOne({ order: month.order });
    if (!exists) {
      await RoadmapMonth.create(month);
      roadmapCreated.push(`${month.month} ${month.year} (orden ${month.order})`);
    } else {
      roadmapCreatedSkipped.push(`orden ${month.order}: ya existe`);
    }
  }

  return NextResponse.json({
    data: {
      fundsUpdated,
      fundsSkipped,
      roadmapTextUpdated,
      roadmapTextSkipped,
      roadmapYearBackfilled: backfillResult.modifiedCount,
      roadmapCreated,
      roadmapCreatedSkipped,
    },
  });
}
