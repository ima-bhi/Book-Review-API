import { Service, Inject } from 'typedi';
import { IBook } from '../interfaces/IBook.interface';
import { IReview } from '../interfaces/IReview.interface';
@Service()
export default class BookService {
  constructor(
    @Inject('BookModel') private BookModel: Models.BookModel,
    @Inject('ReviewModel') private ReviewModel: Models.ReviewModel,
    @Inject('logger') private logger,
  ) {}

  // Find a single book by key
  public async findOne(key: object): Promise<{ book: IBook }> {
    try {
      const book = await this.BookModel.findOne(key, { title: 1, author: 1, genre: 1, description: 1 });
      return { book };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Run an aggregation pipeline on books
  public async findAggregate(aggregate: any[]): Promise<any> {
    try {
      const result = await this.BookModel.aggregate(aggregate);
      return { result };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Update a book by key
  public async updateBook(key: object, doc: object): Promise<any> {
    try {
      let book = await this.BookModel.updateOne(key, doc, { new: true });
      return { book };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Count total books matching key
  public async countDoc(key: object): Promise<any> {
    try {
      const totalBooks = await this.BookModel.countDocuments(key);
      return { totalBooks };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Find books with pagination and sorting
  public async find(key: object, limit: number, skip: number): Promise<{ books: IBook[] }> {
    try {
      const books = await this.BookModel.find(key, { title: 1, author: 1, genre: 1, description: 1 })
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 });
      return { books };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Create a single book
  public async create(userObject: IBook): Promise<{ book: IBook }> {
    try {
      let book = await this.BookModel.create(userObject);
      return { book };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Create multiple books in bulk
  public async createBulk(doc: IBook[]): Promise<{ books: IBook[] }> {
    try {
      let books = await this.BookModel.insertMany(doc);
      return { books };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Create a review for a book
  public async createReview(doc: IReview): Promise<{ review: IReview }> {
    try {
      let review = await this.ReviewModel.create(doc);
      return { review };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Update a review by key
  public async updateReview(key: object, doc: object): Promise<any> {
    try {
      let review = await this.ReviewModel.updateOne(key, doc, { new: true });
      return { review };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Delete a review by key
  public async deleteReview(key: object): Promise<any> {
    try {
      let review = await this.ReviewModel.deleteOne(key);
      return { review };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Find a review by criteria
  public async findUserReview(doc: object): Promise<{ review: IReview }> {
    try {
      let review = await this.ReviewModel.findOne(doc);
      return { review };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
