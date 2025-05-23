import mongoose from 'mongoose';
import userModel from './user.model';
import { IBook } from '../interfaces/IBook.interface';
const Book = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: userModel, autopopulate: { select: '_id name' } },
  },
  { timestamps: true },
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
Book.plugin(require('mongoose-autopopulate'));

export default mongoose.model<IBook & mongoose.Document>('Book', Book);
