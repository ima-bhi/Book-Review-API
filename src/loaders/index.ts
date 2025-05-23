import expressLoader from './express';
import dependencyInjectorLoader from './dependencyInjector';
import mongooseLoader from './mongoose';
import Logger from './logger';
import config from '../config';
import { name } from 'agenda/dist/agenda/name';
import { model } from 'mongoose';

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader(config.bt.databaseURL);
  Logger.info('Mongo loaded & connected!');

  const UserModel = {
    name: 'UserModel',
    model: require('../models/user.model').default,
  };
  const BookModel = {
    name: 'BookModel',
    model: require('../models/book.model').default,
  };
  const ReviewModel = {
    name: 'ReviewModel',
    model: require('../models/review.model').default,
  };
  // It returns the agenda instance because it's needed in the subsequent loaders
  const { agenda } = await dependencyInjectorLoader({
    mongoConnection,
    models: [UserModel, BookModel, ReviewModel],
  });

  Logger.info('Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  Logger.info('Express loaded');
};
