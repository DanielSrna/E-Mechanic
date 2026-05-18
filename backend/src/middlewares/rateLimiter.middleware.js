import rateLimit from 'express-rate-limit';

const isTest = process.env.NODE_ENV === 'test';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: !isTest,
  message: {
    status: 429,
    message: 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.',
  },
});
