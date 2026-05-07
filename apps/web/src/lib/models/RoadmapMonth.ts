import mongoose, { Schema, Document } from 'mongoose';

export interface RoadmapMonthDoc extends Document {
  month: string;
  order: number;
  action: string;
  status: 'pending' | 'active' | 'done';
  note?: string;
  createdAt: Date;
}

const RoadmapMonthSchema = new Schema<RoadmapMonthDoc>(
  {
    month: { type: String, required: true },
    order: { type: Number, required: true },
    action: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'done'], default: 'pending' },
    note: { type: String },
  },
  { timestamps: true }
);

export const RoadmapMonth =
  mongoose.models.RoadmapMonth ||
  mongoose.model<RoadmapMonthDoc>('RoadmapMonth', RoadmapMonthSchema);
