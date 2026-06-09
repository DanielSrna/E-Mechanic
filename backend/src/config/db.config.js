import mongoose from 'mongoose';
import { env } from './env.config.js';
import logger from '../utils/logger.js';

export const connectDB = async () => {
  await mongoose.connect(env.MONGODB_URL, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  mongoose.connection.on('error', (err) => {
    logger.fracaso('Error de conexión MongoDB: %s', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    logger.proceso('MongoDB desconectado. Intentando reconectar...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.exito('MongoDB reconectado exitosamente');
  });
};
