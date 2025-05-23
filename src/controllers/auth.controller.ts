import { IUser } from '../interfaces/IUser.interface';
import { Service, Inject, Container } from 'typedi';
import Response from '../loaders/responseHandler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthService from '../services/auth.service';
import mongoose from 'mongoose';
import config from '../config';
@Service()
export default class AuthController {
  constructor(@Inject('logger') private logger) {}

  // Register a new user
  public async register(doc: { name: string; email: string; password: string }, res: object): Promise<any> {
    try {
      const authServiceInstance = Container.get(AuthService); // Get AuthService instance
      const { name, email, password } = doc;
      const key = { email };
      const { userRecord } = await authServiceInstance.findUser(key); // Check if user exists
      if (userRecord) {
        return Response(res, 400, 'User already exists', 'User already exists', 1);
      }
      const salt = bcrypt.genSaltSync(10); // Generate salt for password hashing
      const hashedPassword = bcrypt.hashSync(password, salt); // Hash the password
      const userObject = {
        name,
        email,
        password: hashedPassword,
      };
      await authServiceInstance.createUser(userObject); // Create new user
      return Response(res, 201, 'USER CREATE SUCCESSFULLY', { sucess: true, name, email }, 1);
    } catch (e) {
      this.logger.error(e); // Log error
      throw e;
    }
  }

  // Login user and return JWT token
  public async signInUser(email: string, password: string, res: object): Promise<{ token: string }> {
    try {
      const authServiceInstance = Container.get(AuthService);
      const key = { email: email };
      const { userRecord } = await authServiceInstance.findUser(key); // Find user by email
      if (!userRecord) {
        return Response(res, 401, 'USER NOT FOUND', {}, 0);
      }
      if (userRecord.active) {
        const validPassword = await bcrypt.compare(password, userRecord.password); // Compare password
        if (validPassword) {
          const userRecordData = {
            _id: userRecord._id,
            name: userRecord.name,
            email: userRecord.email,
          };
          const token = AuthController.generateToken(userRecordData); // Generate JWT token
          return Response(res, 200, 'SUCCESSFULLY LOGIN', token, 1);
        } else {
          return Response(res, 401, 'INVALID CREDENTIALS', {}, 0);
        }
      } else {
        return Response(res, 403, 'INACTIVE USER', {}, 0);
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Change/reset user password
  public async resetPassword(email: string, newPassword: string, res: object): Promise<any> {
    try {
      const authServiceInstance = Container.get(AuthService);
      const key = { email: email };
      const { userRecord } = await authServiceInstance.findUser(key); // Find user by email
      if (!userRecord) {
        return Response(res, 401, 'USER NOT FOUND', {}, 0);
      }
      if (userRecord.active) {
        const upKey = {
          _id: new mongoose.Types.ObjectId(userRecord._id),
        };
        const salt = bcrypt.genSaltSync(10); // Generate salt for new password
        const hashedPassword = bcrypt.hashSync(newPassword, salt); // Hash new password

        const userObject = {
          password: hashedPassword,
        };

        // Update user password
        const { user } = await authServiceInstance.updatePassword(upKey, userObject);
        if (!user) {
          return Response(res, 500, 'Internal Server Error', {}, 0);
        }
        return Response(res, 200, 'UPDATE PASSWORD SUCCESSFULLY', {}, 1);
      } else {
        return Response(res, 403, 'INACTIVE USER', {}, 0);
      }
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  // Generate JWT token for user
  private static generateToken(user) {
    return jwt.sign(
      { ...user },
      config.jwtSecret, // Use a secret key from your config
      { expiresIn: '4h' }, // Token expires in 2 hours
    );
  }
}
