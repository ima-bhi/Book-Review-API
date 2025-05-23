import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import AuthController from '../../controllers/auth.controller';
import { registerDef, loginDef, resetPassword } from '../definition/auth';
const route = Router();

export default (app: Router) => {
  app.use('/', route);

  /**
   * @route POST /signup
   * @desc Register a new user
   * @access Public
   * @bodyParam {string} email - User's email
   * @bodyParam {string} password - User's password
   * @bodyParam {string} name - User's name
   */

  route.post('/signup', registerDef, async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get('logger');
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    logger.debug('POST /signup - body: %o', req.body);
    try {
      const authControllerInstance = Container.get(AuthController);
      await authControllerInstance.register(req.body, res);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.error('Error: %o', e);
      return next(e);
    }
  });

  /**
   * @route POST /login
   * @desc Login user and return JWT token
   * @access Public
   * @bodyParam {string} email - User's email
   * @bodyParam {string} password - User's password
   */
  route.post('/login', loginDef, async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get('logger');
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    logger.debug('POST /login - body: %o', req.body);
    try {
      let { email, password } = req.body;
      const authControllerInstance = Container.get(AuthController);
      await authControllerInstance.signInUser(email, password, res);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.error('Error: %o', e);
      return next(e);
    }
  });

  /**
   * @route PUT /changePassword
   * @desc Change user's password
   * @access Public
   * @bodyParam {string} email - User's email
   * @bodyParam {string} newPassword - New password
   */
  route.put('/changePassword', resetPassword, async (req: Request, res: Response, next: NextFunction) => {
    const logger = Container.get('logger');
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    logger.debug('PUT /changePassword - body: %o', req.body);
    try {
      let { email, newPassword } = req.body;
      const authControllerInstance = Container.get(AuthController);
      await authControllerInstance.resetPassword(email, newPassword, res);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      logger.error('Error: %o', e);
      return next(e);
    }
  });
};
