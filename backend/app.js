import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import logger from './src/utils/logger.js';
import { env } from './src/config/env.config.js';
import { swaggerSpec } from './src/config/swagger.config.js';
import { generalLimiter } from './src/middlewares/rateLimiter.middleware.js';

const app = express();

import userRoutes from './src/routes/user.routes.js';
import clientRoutes from './src/routes/client.routes.js';
import motorcycleRoutes from './src/routes/motorcycle.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import partRoutes from './src/routes/part.routes.js';
import statsRoutes from './src/routes/stats.routes.js';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.FRONTEND_URL.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(helmet());
app.use(hpp());
app.use(cookieParser());
app.use(generalLimiter);

// Swagger (solo development)
if (env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/motorcycles', motorcycleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/stats', statsRoutes);

// Manejador global de errores
app.use((error, req, res, _next) => {
  // 1. EXTRAER EL STATUS: Si el error no tiene status, asumimos 500.
  const statusCode = error.status || 500;

  // 2. LOG INTERNO: Imprimimos el error.
  // Si es un error de validación, incluimos los detalles de express-validator.
  logger.fracaso('LOG DE ERROR:', {
    message: error.message,
    status: statusCode,
    details: error.errors || 'N/A',
  });

  // 3. CONDICIONAL DE ENTORNO
  if (process.env.NODE_ENV === 'development') {
    // --- RESPUESTA EN DESARROLLO ---
    return res.status(statusCode).json({
      status: statusCode,
      message: error.message,
      errors: error.errors, // Mostramos qué campos fallaron en desarrollo
      stack: error.stack,
    });
  } else {
    // --- RESPUESTA EN PRODUCCIÓN ---
    return res.status(statusCode).json({
      status: statusCode,
      message:
        statusCode === 500
          ? 'Algo salió mal en nuestros servidores'
          : error.message,
      // En producción, solo enviamos los errores de validación si existen (status 400)
      errors: statusCode === 400 ? error.errors : undefined,
    });
  }
});

export default app;
