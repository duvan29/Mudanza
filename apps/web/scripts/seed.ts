import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { INITIAL_FUNDS, ROADMAP_MONTHS } from '@mudanza/types';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

// Schemas (inline to avoid Next.js import issues — the constants above are a plain
// TS package with no Next.js-specific code, so those are safe to import directly)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

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

const User = mongoose.model('User', userSchema);
const Fund = mongoose.model('Fund', fundSchema);
const RoadmapMonth = mongoose.model('RoadmapMonth', roadmapSchema);

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  // Seed users
  const users = [
    { email: 'duvan@mudanza.app', displayName: 'Duvan', password: 'password123' },
    { email: 'kata@mudanza.app', displayName: 'Kata', password: 'password123' },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ email: u.email, displayName: u.displayName, passwordHash });
      console.log(`+ User created: ${u.displayName} (${u.email})`);
    } else {
      console.log(`= User exists: ${u.displayName}`);
    }
  }

  // Seed funds
  for (const fund of INITIAL_FUNDS) {
    const exists = await Fund.findOne({ name: fund.name });
    if (!exists) {
      await Fund.create({ ...fund, saved: 0 });
      console.log(`+ Fund created: ${fund.name}`);
    } else {
      console.log(`= Fund exists: ${fund.name}`);
    }
  }

  // Seed roadmap
  for (const month of ROADMAP_MONTHS) {
    const exists = await RoadmapMonth.findOne({ order: month.order });
    if (!exists) {
      await RoadmapMonth.create({ ...month, status: 'pending', note: null });
      console.log(`+ Roadmap: ${month.month}`);
    } else {
      console.log(`= Roadmap exists: ${month.month}`);
    }
  }

  console.log('\nSeed completed!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
