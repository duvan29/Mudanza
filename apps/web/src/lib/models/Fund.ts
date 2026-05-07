import mongoose, { Schema, Document } from 'mongoose';

export interface FundDoc extends Document {
  name: string;
  target: number;
  saved: number;
  color: string;
  icon: string;
  order: number;
  createdAt: Date;
}

const FundSchema = new Schema<FundDoc>(
  {
    name: { type: String, required: true },
    target: { type: Number, required: true },
    saved: { type: Number, default: 0 },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Fund = mongoose.models.Fund || mongoose.model<FundDoc>('Fund', FundSchema);
