import mongoose from 'mongoose';
import userModel from './user.model';
import { IReview } from '../interfaces/IReview.interface';
import bookModel from './book.model';
const Review = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: bookModel,
      required: [true, 'Book ID is required'],
      autopopulate: { select: '_id title' },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: userModel,
      required: [true, 'User ID is required'],
      autopopulate: { select: '_id name' },
    },
    rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    comment: { type: String, required: [true, 'Comment is required'], trim: true },
  },
  { timestamps: true },
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
Review.plugin(require('mongoose-autopopulate'));

export default mongoose.model<IReview & mongoose.Document>('Review', Review);
