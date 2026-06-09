import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import logger from './src/utils/logger.js';
import { env } from './src/config/env.config.js';
import { swaggerSpec } from './src/config/swagger.config.js';
import { generalLimiter } from './src/middlewares/rateLimiter.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

import userRoutes from './src/routes/user.routes.js';
import clientRoutes from './src/routes/client.routes.js';
import motorcycleRoutes from './src/routes/motorcycle.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import partRoutes from './src/routes/part.routes.js';
import statsRoutes from './src/routes/stats.routes.js';
import settingsRoutes from './src/routes/settings.routes.js';
import exportRoutes from './src/routes/export.routes.js';
import scheduleRoutes from './src/routes/schedule.routes.js';
import webhookRoutes from './src/routes/webhook.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: env.FRONTEND_URL.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://storage.googleapis.com'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    strictTransportSecurity:
      env.NODE_ENV === 'production'
        ? { maxAge: 31536000, includeSubDomains: true }
        : false,
  })
);
app.use(cookieParser());

function sanitizeInput(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key in obj) {
    if (key.startsWith('$')) {
      delete obj[key];
      continue;
    }
    const val = obj[key];
    if (typeof val === 'string') {
      if (
        val.startsWith('$') ||
        (val.includes('.') && !val.includes('@') && !val.startsWith('http'))
      ) {
        delete obj[key];
      }
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      sanitizeInput(val);
      if (Object.keys(val).length === 0) delete obj[key];
    }
  }
}

function sanitizeRequest(req, res, next) {
  if (req.query) sanitizeInput(req.query);
  if (req.body) sanitizeInput(req.body);
  next();
}

app.use(compression());
app.use(sanitizeRequest);
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({ message: 'Request timeout' });
  });
  next();
});
app.use(generalLimiter);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/settings', settingsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/notifications', notificationRoutes);

// Manejador global de errores
app.use((error, req, res, _next) => {
  if (error.name === 'ValidationError') error.status = 400;
  if (error.name === 'CastError') {
    error.status = 400;
    error.message = 'Invalid ID format';
  }
  if (error.code === 11000) {
    error.status = 409;
    error.message = `Duplicate value for ${Object.keys(error.keyValue || {})[0] || 'field'}`;
  }

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
