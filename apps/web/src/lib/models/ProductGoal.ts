import mongoose, { Schema, Document } from 'mongoose';

export interface ProductGoalDoc extends Document {
  name: string;
  fundId: mongoose.Types.ObjectId;
  budget: number;
  purchased: boolean;
  createdAt: Date;
}

const ProductGoalSchema = new Schema<ProductGoalDoc>(
  {
    name: { type: String, required: true },
    fundId: { type: Schema.Types.ObjectId, ref: 'Fund', required: true },
    budget: { type: Number, required: true },
    purchased: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ProductGoal =
  mongoose.models.ProductGoal || mongoose.model<ProductGoalDoc>('ProductGoal', ProductGoalSchema);
