import mongoose, { Schema, Document } from 'mongoose';

export interface ProductVersionDoc extends Document {
  goalId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  store: string;
  link: string | null;
  notes: string | null;
  chosen: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const productVersionSchema = new Schema<ProductVersionDoc>(
  {
    goalId: { type: Schema.Types.ObjectId, ref: 'ProductGoal', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    store: { type: String, required: true },
    link: { type: String, default: null },
    notes: { type: String, default: null },
    chosen: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// When a version is marked as chosen, clear all others for the same goal
productVersionSchema.pre('save', async function () {
  if (this.isModified('chosen') && this.chosen) {
    await mongoose.model('ProductVersion').updateMany(
      { goalId: this.goalId, _id: { $ne: this._id } },
      { chosen: false }
    );
  }
});

export const ProductVersion = mongoose.model<ProductVersionDoc>('ProductVersion', productVersionSchema);
