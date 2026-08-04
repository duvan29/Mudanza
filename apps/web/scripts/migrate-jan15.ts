import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

// Same inline-schema pattern as seed.ts. This script ONLY touches Fund.target and
// RoadmapMonth (action text, year backfill, 3 new entries) — it never touches
// Movement documents or Fund.saved, so real deposit history is untouched.
const fundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  target: { type: Number, required: true },
  saved: { type: Number, default: 0 },
  color: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, required: true },
}, { timestamps: true });

const roadmapSchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  order: { type: Number, required: true },
  action: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'done'], default: 'pending' },
  note: { type: String, default: null },
}, { timestamps: true });

const Fund = mongoose.model('Fund', fundSchema);
const RoadmapMonth = mongoose.model('RoadmapMonth', roadmapSchema);

// Only these two fund targets change for the $30M plan; the other two funds are untouched.
const FUND_TARGET_UPDATES: { name: string; newTarget: number }[] = [
  { name: 'Reserva emergencia', newTarget: 9_000_000 },
  { name: 'Colchón general', newTarget: 14_300_000 },
];

// Only the action text changes for these two months — status/note (real progress) stays untouched.
const ROADMAP_ACTION_UPDATES: { order: number; newAction: string }[] = [
  { order: 9, newAction: 'Revisión de plazo extendido — subir aportes para la nueva meta de $30M' },
  { order: 10, newAction: 'Seguir ahorrando al nuevo ritmo — reforzar Colchón y Emergencia' },
];

// New entries for the extended timeline (Nov 2026 – Ene 2027). Inserted only if missing.
const NEW_ROADMAP_MONTHS = [
  { month: 'Nov', year: 2026, order: 11, action: 'Buscar apartamento y agendar visitas para enero', status: 'pending', note: null },
  { month: 'Dic', year: 2026, order: 12, action: 'Firmar contrato y coordinar logística de trasteo', status: 'pending', note: null },
  { month: 'Ene', year: 2027, order: 13, action: 'Mudanza — instalarse en el nuevo hogar (15 de enero)', status: 'pending', note: null },
];

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');
  console.log('Esta migración solo actualiza Fund.target (por nombre) y RoadmapMonth.action (por orden),');
  console.log('agrega el campo year donde falte, e inserta 3 entradas nuevas de roadmap.');
  console.log('NUNCA toca Movement ni Fund.saved.\n');

  console.log('--- Fondos ---');
  for (const { name, newTarget } of FUND_TARGET_UPDATES) {
    const fund = await Fund.findOne({ name });
    if (!fund) {
      console.log(`! Fondo no encontrado, se omite: ${name}`);
      continue;
    }
    const before = fund.target;
    if (before === newTarget) {
      console.log(`= ${name}: ya está en $${newTarget.toLocaleString('es-CO')}`);
      continue;
    }
    await Fund.updateOne({ _id: fund._id }, { $set: { target: newTarget } });
    console.log(`~ ${name}: $${before.toLocaleString('es-CO')} -> $${newTarget.toLocaleString('es-CO')}`);
  }

  console.log('\n--- Roadmap: texto actualizado ---');
  for (const { order, newAction } of ROADMAP_ACTION_UPDATES) {
    const entry = await RoadmapMonth.findOne({ order });
    if (!entry) {
      console.log(`! Roadmap orden ${order} no encontrado, se omite`);
      continue;
    }
    const before = entry.action;
    if (before === newAction) {
      console.log(`= orden ${order}: texto ya actualizado`);
      continue;
    }
    await RoadmapMonth.updateOne({ _id: entry._id }, { $set: { action: newAction } });
    console.log(`~ orden ${order} (status="${entry.status}" preservado sin cambios):`);
    console.log(`    antes: "${before}"`);
    console.log(`    ahora: "${newAction}"`);
  }

  console.log('\n--- Roadmap: backfill de year ---');
  const backfillResult = await RoadmapMonth.updateMany(
    { year: { $exists: false } },
    { $set: { year: 2026 } }
  );
  console.log(`~ ${backfillResult.modifiedCount} documento(s) actualizado(s) con year: 2026`);

  console.log('\n--- Roadmap: nuevas entradas ---');
  for (const month of NEW_ROADMAP_MONTHS) {
    const exists = await RoadmapMonth.findOne({ order: month.order });
    if (!exists) {
      await RoadmapMonth.create(month);
      console.log(`+ Roadmap creado: ${month.month} ${month.year} (orden ${month.order})`);
    } else {
      console.log(`= Roadmap orden ${month.order} ya existe, se omite`);
    }
  }

  console.log('\nMigración completada. Movement y Fund.saved no fueron modificados.');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
