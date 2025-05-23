import { Container } from 'typedi';
import mongoose from 'mongoose';
import { IUser } from '../interfaces/IUser.interface';

/**
 * Attach user to req.user
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const attachCurrentUser = async (req, res, next) => {
  const Logger = Container.get('logger');
  try {
    const UserModel = Container.get('UserModel') as mongoose.Model<IUser & mongoose.Document>;
    //add code to verify access route path in the permission array
    const userRecord = await UserModel.findOne({ _id: req.token._id }, { name: 1, email: 1 });
    // userRecord -> get permission and compare with role and req.path and req.method
    if (!userRecord) {
      return res.sendStatus(401);
    }
    req.currentUser = userRecord;
    return next();
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    Logger.error('Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachCurrentUser;
