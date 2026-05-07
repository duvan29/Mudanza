import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { User } from './models/User';
import { Fund } from './models/Fund';
import { RoadmapMonth } from './models/RoadmapMonth';
import { INITIAL_FUNDS, ROADMAP_MONTHS } from '@mudanza/types';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(config.mongodbUri);
  console.log('Connected');

  // Seed users (idempotent)
  const users = [
    { email: config.seed.user1Email, displayName: 'Duvan', password: config.seed.user1Password },
    { email: config.seed.user2Email, displayName: 'Kata', password: config.seed.user2Password },
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ email: u.email, displayName: u.displayName, passwordHash });
      console.log(`User created: ${u.displayName} (${u.email})`);
    } else {
      console.log(`User already exists: ${u.displayName}`);
    }
  }

  // Seed funds (idempotent)
  for (const fund of INITIAL_FUNDS) {
    const exists = await Fund.findOne({ name: fund.name });
    if (!exists) {
      await Fund.create({ ...fund, saved: 0 });
      console.log(`Fund created: ${fund.name} (target: $${fund.target.toLocaleString('es-CO')})`);
    } else {
      console.log(`Fund already exists: ${fund.name}`);
    }
  }

  // Seed roadmap months (idempotent)
  for (const month of ROADMAP_MONTHS) {
    const exists = await RoadmapMonth.findOne({ order: month.order });
    if (!exists) {
      await RoadmapMonth.create({ ...month, status: 'pending', note: null });
      console.log(`Roadmap: ${month.month} — ${month.action.substring(0, 40)}...`);
    } else {
      console.log(`Roadmap already exists: ${month.month}`);
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
