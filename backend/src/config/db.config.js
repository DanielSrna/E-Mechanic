import mongoose from 'mongoose';
import { env } from './env.config.js';

export const connectDB = async () => {
  await mongoose.connect(env.MONGODB_URL, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 2,
  });
};
