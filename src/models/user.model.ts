import mongoose from 'mongoose';
import { IUser } from '../interfaces/IUser.interface';
const User = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: { type: String, default: null },
    resetLink: { type: String, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<IUser & mongoose.Document>('User', User);
