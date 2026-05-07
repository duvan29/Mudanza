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

const fundSchema = new Schema<FundDoc>(
  {
    name: { type: String, required: true },
    target: { type: Number, required: true },
    saved: { type: Number, default: 0 },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Fund = mongoose.model<FundDoc>('Fund', fundSchema);
