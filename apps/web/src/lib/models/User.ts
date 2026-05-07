import mongoose, { Schema, Document } from 'mongoose';

export interface UserDoc extends Document {
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<UserDoc>('User', UserSchema);
