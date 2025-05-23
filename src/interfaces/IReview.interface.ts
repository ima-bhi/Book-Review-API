import mongoose from 'mongoose';

export interface IReview {
  _id?: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
}
