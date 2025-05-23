import { Document, Model } from 'mongoose';
import { IUser } from '../../interfaces/IUser.interface';
import { IBook } from '../../interfaces/IBook.interface';
import { IReview } from '../../interfaces/IReview.interface';
declare global {
  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type BookModel = Model<IBook & Document>;
    export type ReviewModel = Model<IReview & Document>;
  }
}
