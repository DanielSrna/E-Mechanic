import { env } from './src/config/env.config.js';
import logger from './src/utils/logger.js';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './src/config/db.config.js';
import './src/events/listeners/order.listeners.js';

const PORT = env.PORT;

process.on('unhandledRejection', (reason, promise) => {
  logger.fracaso('Unhandled Rejection at: %s, reason: %s', promise, reason);
});

process.on('uncaughtException', (error) => {
  logger.fracaso('Uncaught Exception: %s', error.message);
  if (error.stack) logger.fracaso(error.stack);
  process.exit(1);
});

try {
  logger.proceso('Iniciando la conexión a la base de datos...');
  await connectDB();
  logger.exito('Conexión a MongoDB Atlas establecida.');

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.exito(
      'Servidor escuchando en 0.0.0.0:%d | Entorno: %s',
      PORT,
      env.NODE_ENV
    );
  });

  process.on('SIGTERM', async () => {
    logger.proceso('SIGTERM recibido. Cerrando conexiones limpiamente...');
    const shutdownTimeout = setTimeout(() => {
      logger.fracaso('Forzando cierre tras timeout de 10s');
      process.exit(1);
    }, 10000);

    server.close(() => {
      clearTimeout(shutdownTimeout);
      logger.exito('Servidor HTTP cerrado');
      mongoose.disconnect().then(() => {
        logger.exito('Conexión a MongoDB cerrada');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', async () => {
    logger.proceso('SIGINT recibido. Cerrando...');
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  });
} catch (error) {
  logger.fracaso('Error al conectar a la base de datos: %s', error.message);
  process.exit(1);
}
