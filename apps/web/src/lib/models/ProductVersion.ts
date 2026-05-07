import mongoose, { Schema, Document } from 'mongoose';

export interface ProductVersionDoc extends Document {
  goalId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  store: string;
  link?: string;
  notes?: string;
  chosen: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ProductVersionSchema = new Schema<ProductVersionDoc>(
  {
    goalId: { type: Schema.Types.ObjectId, ref: 'ProductGoal', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    store: { type: String, required: true },
    link: { type: String },
    notes: { type: String },
    chosen: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Ensure only one chosen version per goal
ProductVersionSchema.pre('save', async function () {
  if (this.chosen && this.isModified('chosen')) {
    await ProductVersion.updateMany(
      { goalId: this.goalId, _id: { $ne: this._id } },
      { chosen: false }
    );
  }
});

export const ProductVersion =
  mongoose.models.ProductVersion ||
  mongoose.model<ProductVersionDoc>('ProductVersion', ProductVersionSchema);
