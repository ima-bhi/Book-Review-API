import { Service, Inject } from 'typedi';
import { IUser } from '../interfaces/IUser.interface';

@Service()
export default class AuthService {
  constructor(
    @Inject('UserModel') private userModel: Models.UserModel,
    @Inject('logger') private logger,
  ) {}

  // Find a user by key (e.g., email)
  public async findUser(key: object): Promise<{ userRecord: IUser }> {
    try {
      const userRecord = await this.userModel.findOne(key);
      return { userRecord };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Create a new user
  public async createUser(userObject: object): Promise<{ user: IUser }> {
    try {
      let user = await this.userModel.create(userObject);
      return { user };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Update user's password
  public async updatePassword(key: object, userObject: object): Promise<any> {
    try {
      let user = await this.userModel.updateOne(key, userObject, { new: true });
      return { user };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
