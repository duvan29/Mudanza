import mongoose, { Schema, Document } from 'mongoose';
import { Fund } from './Fund';

export interface MovementDoc extends Document {
  fundId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: 'deposit' | 'adjustment';
  note: string | null;
  date: Date;
  deleted: boolean;
  createdAt: Date;
}

const movementSchema = new Schema<MovementDoc>(
  {
    fundId: { type: Schema.Types.ObjectId, ref: 'Fund', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'adjustment'], required: true },
    note: { type: String, default: null },
    date: { type: Date, default: () => new Date() },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// After saving a movement, recalculate the fund total
movementSchema.post('save', async function (doc: MovementDoc) {
  await recalcFund(doc.fundId);
});

// Also recalculate on findOneAndUpdate (for soft-delete)
movementSchema.post('findOneAndUpdate', async function (doc: MovementDoc | null) {
  if (doc) {
    await recalcFund(doc.fundId);
  }
});

async function recalcFund(fundId: mongoose.Types.ObjectId) {
  const result = await Movement.aggregate([
    { $match: { fundId, deleted: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const total = result[0]?.total ?? 0;
  await Fund.findByIdAndUpdate(fundId, { saved: total });
}

export const Movement = mongoose.model<MovementDoc>('Movement', movementSchema);
