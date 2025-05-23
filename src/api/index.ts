import { Router } from 'express';
import userRoute from './routes/user.route';
import bookRoute from './routes/book.route';
export default () => {
  const app = Router();
  userRoute(app);
  bookRoute(app);
  return app;
};
