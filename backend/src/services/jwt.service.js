import jwt from 'jsonwebtoken';
import JWT from '../models/jwt.model.js';
import { env } from '../config/env.config.js';
import logger from '../utils/logger.js';

function parseDuration(dur) {
  const match = dur.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 86400000);
}

export const generateAuthTokens = async (user, userAgent) => {
  logger.contexto(
    'Iniciando servicio generateAuthTokens en backend/src/services/jwt.service.js'
  );

  logger.proceso('Generando accessToken...');
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email, rol: user.rol },
    env.JWT_SECRET,
    { expiresIn: env.JWT_SECRET_EXPIRES_IN }
  );

  logger.proceso('Generando refreshToken...');
  const refreshToken = jwt.sign(
    { userId: user._id, email: user.email, rol: user.rol },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_SECRET_EXPIRES_IN }
  );

  const expiresInMs = parseDuration(env.JWT_REFRESH_SECRET_EXPIRES_IN);
  logger.proceso('Guardando refreshToken (expira en %d ms)...', expiresInMs);
  await JWT.saveToken(
    user._id,
    refreshToken,
    'refresh',
    userAgent || 'unknown',
    expiresInMs
  );

  return { accessToken, refreshToken };
};
