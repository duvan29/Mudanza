import mongoose, { Schema, Document } from 'mongoose';
import { Fund } from './Fund';

export interface MovementDoc extends Document {
  fundId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: 'deposit' | 'adjustment';
  note?: string;
  date: Date;
  deleted: boolean;
  createdAt: Date;
}

const MovementSchema = new Schema<MovementDoc>(
  {
    fundId: { type: Schema.Types.ObjectId, ref: 'Fund', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'adjustment'], required: true },
    note: { type: String },
    date: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Recalculate fund saved amount after save
MovementSchema.post('save', async function () {
  await recalcFund(this.fundId.toString());
});

export async function recalcFund(fundId: string) {
  const result = await Movement.aggregate([
    { $match: { fundId: new mongoose.Types.ObjectId(fundId), deleted: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const total = result[0]?.total ?? 0;
  await Fund.findByIdAndUpdate(fundId, { saved: total });
}

export const Movement =
  mongoose.models.Movement || mongoose.model<MovementDoc>('Movement', MovementSchema);
