import mongoose from 'mongoose';

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  password: string;
  resetLink: string;
  email: string;
  active: boolean;
}
