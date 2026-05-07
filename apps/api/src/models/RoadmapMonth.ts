import mongoose, { Schema, Document } from 'mongoose';

export interface RoadmapMonthDoc extends Document {
  month: string;
  order: number;
  action: string;
  status: 'pending' | 'active' | 'done';
  note: string | null;
}

const roadmapMonthSchema = new Schema<RoadmapMonthDoc>(
  {
    month: { type: String, required: true },
    order: { type: Number, required: true },
    action: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'done'], default: 'pending' },
    note: { type: String, default: null },
  },
  { timestamps: true }
);

export const RoadmapMonth = mongoose.model<RoadmapMonthDoc>('RoadmapMonth', roadmapMonthSchema);
