import { IBook } from '../interfaces/IBook.interface';
import { Service, Inject, Container } from 'typedi';
import Response from '../loaders/responseHandler';
import mongoose from 'mongoose';
import BookService from '../services/book.service';

@Service()
export default class BookController {
  constructor(@Inject('logger') private logger) {}

  // Create a single book entry
  public async create(
    doc: { title: string; author: string; genre: string; description: string },
    addedBy: mongoose.Schema.Types.ObjectId,
    res: object,
  ): Promise<{ books: IBook }> {
    try {
      const bookServiceInstance = Container.get(BookService);
      doc['addedBy'] = addedBy;
      //@ts-ignore
      const { book } = await bookServiceInstance.create(doc);
      return Response(res, 201, 'BOOK ENTRY CREATED', book, 1);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Create multiple books in bulk
  public async createBulk(
    doc: [{ title: string; author: string; genre: string; description: string }],
    addedBy: mongoose.Schema.Types.ObjectId,
    res: object,
  ): Promise<{ books: IBook }> {
    try {
      const bookServiceInstance = Container.get(BookService);
      doc.forEach((item) => {
        item['addedBy'] = addedBy;
      });
      //@ts-ignore
      const { books } = await bookServiceInstance.createBulk(doc);
      return Response(res, 201, 'BOOK ENTRY CREATED', books, 1);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Update a book by ID
  public async updateBook(
    id: string,
    doc: { title: string; author: string; genre: string; description: string },
    res: object,
  ): Promise<{ books: IBook }> {
    try {
      const bookServiceInstance = Container.get(BookService);
      //check if review exists
      const { book } = await bookServiceInstance.findOne({ _id: new mongoose.Types.ObjectId(id) });
      if (!book) {
        return Response(res, 404, 'BOOK NOT FOUND', {}, 0);
      }
      const updateBook = {
        title: doc.title,
        author: doc.author,
        genre: doc.genre,
        description: doc.description,
      };
      await bookServiceInstance.updateBook({ _id: new mongoose.Types.ObjectId(id) }, updateBook);
      return Response(res, 201, 'BOOK DATA UPDATED', {}, 1);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Get all books with pagination and filters
  public async find(filter: object, page: number, limit: number, skip: number, res: object): Promise<any> {
    try {
      const bookServiceInstance = Container.get(BookService);
      //GET ALL BOOKS COUNT
      const { totalBooks } = await bookServiceInstance.countDoc(filter);

      // Get books as per the limit and skip
      const { books } = await bookServiceInstance.find(filter, limit, skip);
      return Response(
        res,
        200,
        'DATA FETCHED SUCCESSFULLY',
        {
          count: books.length,
          pagination: {
            totalBooks,
            page,
            pages: Math.ceil(totalBooks / limit),
            limit,
          },
          data: {
            books,
          },
        },
        1,
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Get a book by ID with paginated reviews and stats
  public async findBookById(bookId: string, page: number, limit: number, skip: number, res: object): Promise<any> {
    try {
      const bookServiceInstance = Container.get(BookService);
      //CHECK IF BOOK EXISTS
      const { book } = await bookServiceInstance.findOne({ _id: new mongoose.Types.ObjectId(bookId) });
      if (!book) {
        return Response(res, 404, 'BOOK NOT FOUND', {}, 0);
      }
      //GET ALL BOOKS COUNT
      const aggregate = [
        { $match: { _id: new mongoose.Types.ObjectId(bookId) } },
        {
          $lookup: {
            from: 'reviews',
            let: { bookId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$bookId', '$$bookId'] } } },
              // Optional: sort reviews by createdAt descending
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
            ],
            as: 'reviews',
          },
        },
        {
          $lookup: {
            from: 'reviews',
            let: { bookId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$bookId', '$$bookId'] } } },
              {
                $group: {
                  _id: null,
                  averageRating: { $avg: '$rating' },
                  totalReviews: { $sum: 1 },
                },
              },
            ],
            as: 'reviewStats',
          },
        },
        {
          $addFields: {
            averageRating: { $ifNull: [{ $arrayElemAt: ['$reviewStats.averageRating', 0] }, 0] },
            totalReviews: { $ifNull: [{ $arrayElemAt: ['$reviewStats.totalReviews', 0] }, 0] },
          },
        },
        {
          $project: {
            title: 1,
            author: 1,
            genre: 1,
            description: 1,
            addedBy: 1,
            averageRating: 1,
            totalReviews: 1,
            reviews: 1,
          },
        },
      ];
      const { result } = await bookServiceInstance.findAggregate(aggregate);
      const bookData = result[0];
      return Response(
        res,
        200,
        'BOOK DATA FETCHED SUCCESSFULLY',
        {
          book: {
            _id: bookData._id,
            title: bookData.title,
            author: bookData.author,
            genre: bookData.genre,
            description: bookData.description,
          },
          averageRating: Number(bookData?.averageRating?.toFixed(2)) || 0,
          reviews: {
            count: bookData.reviews.length,
            pagination: {
              totalReviews: bookData.totalReviews,
              page,
              pages: Math.ceil(bookData.totalReviews / limit),
              limit,
            },
            data: bookData.reviews,
          },
        },
        1,
      );
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Create a review for a book
  public async createReview(
    doc: { bookId: mongoose.Types.ObjectId; userId: mongoose.Types.ObjectId; rating: number; comment: string },
    res: object,
  ): Promise<any> {
    try {
      const bookServiceInstance = Container.get(BookService);
      //step 1: check if book exists
      const bookId = doc.bookId;
      const { book } = await bookServiceInstance.findOne({ _id: bookId });
      if (!book) {
        //book not found
        return Response(res, 404, 'BOOK NOT FOUND', {}, 0);
      } else {
        //check if user already reviewed the book
        const { review } = await bookServiceInstance.findUserReview({ bookId: bookId, userId: doc.userId });
        if (review) {
          return Response(res, 400, 'USER ALREADY REVIEWED THIS BOOK', {}, 0);
        }
      }
      const { review } = await bookServiceInstance.createReview(doc);
      return Response(res, 201, 'BOOK REVIEW SUBMITTED', review, 1);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Update a review by ID
  public async updateReview(id: string, doc: { rating: number; comment: string }, res: object): Promise<any> {
    try {
      const bookServiceInstance = Container.get(BookService);
      //check if review exists
      const { review } = await bookServiceInstance.findUserReview({ _id: new mongoose.Types.ObjectId(id) });
      if (!review) {
        return Response(res, 404, 'REVIEW NOT FOUND', {}, 0);
      }
      const updateReview = {
        rating: doc.rating,
        comment: doc.comment,
      };
      await bookServiceInstance.updateReview({ _id: new mongoose.Types.ObjectId(id) }, updateReview);
      return Response(res, 201, 'BOOK REVIEW UPDATED', {}, 1);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Delete a review by ID
  public async deleteReview(id: string, res: object): Promise<any> {
    try {
      const bookServiceInstance = Container.get(BookService);
      //check if review exists
      const { review } = await bookServiceInstance.findUserReview({ _id: new mongoose.Types.ObjectId(id) });
      if (!review) {
        return Response(res, 404, 'REVIEW NOT FOUND', {}, 0);
      }
      await bookServiceInstance.deleteReview({ _id: new mongoose.Types.ObjectId(id) });
      return Response(res, 200, 'BOOK REVIEW DELETED', {}, 1);
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
