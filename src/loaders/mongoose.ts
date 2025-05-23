import mongoose, { ConnectOptions } from "mongoose";

export default async (databaseURL: string): Promise<unknown> => {
  const connection = await mongoose.connect(databaseURL, {} as ConnectOptions);
  return connection.connection.db;
};
