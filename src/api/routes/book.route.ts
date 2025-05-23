import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import BookController from '../../controllers/book.controller';
import middlewares from '../../middlewares/index';
import mongoose from 'mongoose';
import { bookDef, reviewDef } from '../definition/book';

const route = Router();

export default (app: Router) => {
  app.use('/', route);

  /**
   * @route POST /books
   * @desc Create a new book
   * @access Private (Requires authentication)
   */
  route.post(
    '/books',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    bookDef,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('POST /books - body: %o', req.body);
      try {
        //@ts-ignore
        const addedBy = req.currentUser._id;
        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.create(req.body, addedBy, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @route POST /bulk-books
   * @desc Create multiple books in bulk
   * @access Private (Requires authentication)
   */
  route.post(
    '/bulk-books',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('POST /bulk-books - body: %o', req.body);
      try {
        //@ts-ignore
        const addedBy = req.currentUser._id;
        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.createBulk(req.body, addedBy, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @route PUT /books/:id
   * @desc Update a book by ID
   * @access Private (Requires authentication)
   */
  route.put(
    '/books/:id',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    bookDef,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('PUT /books/%s - body: %o', req.params.id, req.body);
      try {
        const bookId = req?.params?.id;
        if (!bookId) {
          return res.status(400).json({ message: 'Book ID is required' });
        }
        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.updateBook(bookId, req.body, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @route GET /books
   * @desc Get all books with optional filters and pagination
   * @access Private (Requires authentication)
   * @queryParam {string} [genre] - Filter by genre
   * @queryParam {string} [author] - Filter by author (partial match)
   * @queryParam {number} [page=1] - Page number
   * @queryParam {number} [limit=10] - Items per page
   */
  route.get(
    '/books',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('GET /books - query: %o', req.query);
      try {
        // Query parameters
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter: any = {};

        // Apply filters if provided
        if (typeof req.query.genre === 'string') {
          filter.genre = req.query.genre;
        }

        if (typeof req.query.author === 'string') {
          filter.author = { $regex: req.query.author, $options: 'i' };
        }
        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.find(filter, page, limit, skip, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @route GET /books/:id
   * @desc Get a book by ID with paginated reviews
   * @access Private (Requires authentication)
   * @queryParam {number} [page=1] - Page number for reviews
   * @queryParam {number} [limit=10] - Reviews per page
   */
  route.get(
    '/books/:id',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('GET /books/%s - query: %o', req.params.id, req.query);
      try {
        const bookId = req?.params?.id;
        if (!bookId) {
          return res.status(400).json({ message: 'Book ID is required' });
        }
        // Query parameters
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.findBookById(bookId, page, limit, skip, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @route POST /books/:_id/review
   * @desc Add a review to a book
   * @access Private (Requires authentication)
   */
  route.post(
    '/books/:_id/review',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    reviewDef,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('POST /books/%s/review - body: %o', req.params._id, req.body);
      try {
        const bookId = req?.params?._id;
        if (!bookId) {
          return res.status(400).json({ message: 'Book ID is required' });
        }
        //@ts-ignore
        req.body.userId = req.currentUser._id;
        req.body.bookId = new mongoose.Types.ObjectId(bookId);
        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.createReview(req.body, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @route PUT /reviews/:id
   * @desc Update a review by ID
   * @access Private (Requires authentication)
   */
  route.put(
    '/reviews/:id',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    reviewDef,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('PUT /reviews/%s - body: %o', req.params.id, req.body);
      try {
        const reviewId = req?.params?.id;
        if (!reviewId) {
          return res.status(400).json({ message: 'Review ID is required' });
        }
        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.updateReview(reviewId, req.body, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * @route DELETE /reviews/:id
   * @desc Delete a review by ID
   * @access Private (Requires authentication)
   */
  route.delete(
    '/reviews/:id',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('DELETE /reviews/%s', req.params.id);
      try {
        const reviewId = req?.params?.id;
        if (!reviewId) {
          return res.status(400).json({ message: 'Review ID is required' });
        }
        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.deleteReview(reviewId, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );

  route.get(
    '/search',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger = Container.get('logger');
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.debug('GET /books - query: %o', req.query);
      try {
        // Query parameters
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const { q } = req.query;
        if (!q) {
          return res.status(400).json({
            success: false,
            message: 'Search query is required',
          });
        }
        // Search books by title or author (case-insensitive)
        const searchQuery = {
          $or: [{ title: { $regex: q, $options: 'i' } }, { author: { $regex: q, $options: 'i' } }],
        };
        const bookControllerInstance = Container.get(BookController);
        await bookControllerInstance.find(searchQuery, page, limit, skip, res);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        logger.error('Error: %o', e);
        return next(e);
      }
    },
  );
};
