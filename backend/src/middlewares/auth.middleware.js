import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';

export const verifyToken = async (req, res, next) => {
  logger.contexto('Ejecutando middleware verifyToken');

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.fracaso('Token de acceso no proporcionado o formato inválido');
      return res.status(401).json({
        message: 'Access token required. Use format: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1];

    logger.proceso('Verificando access token...');
    const decoded = jwt.verify(token, env.JWT_SECRET);

    logger.proceso('Buscando usuario en la base de datos...');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      logger.fracaso('Usuario no encontrado para el token proporcionado');
      return res.status(401).json({ message: 'Invalid token: user not found' });
    }

    if (!user.isActive) {
      logger.fracaso('Usuario desactivado intentó acceder: %s', user.email);
      return res.status(401).json({
        message: 'Account is deactivated. Contact an administrator.',
      });
    }

    req.user = user;
    logger.exito('Token verificado correctamente para usuario: %s', user.email);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.fracaso('Token expirado');
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      logger.fracaso('Token inválido: %s', error.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
    logger.fracaso('Error en verifyToken: %s', error.message);
    return res
      .status(500)
      .json({ message: 'Internal server error during authentication' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    logger.contexto('Ejecutando middleware requireRole con roles: %o', roles);

    if (!req.user) {
      logger.fracaso('requireRole ejecutado sin verifyToken previo');
      return res.status(401).json({
        message: 'Authentication required before role verification',
      });
    }

    if (!roles.includes(req.user.rol)) {
      logger.fracaso(
        "Acceso denegado: usuario %s con rol '%s' no tiene permisos para esta ruta. Roles requeridos: %o",
        req.user.email,
        req.user.rol,
        roles
      );
      return res.status(403).json({
        message: 'Insufficient permissions to access this resource',
      });
    }

    logger.exito("Rol '%s' autorizado para acceder a la ruta", req.user.rol);
    next();
  };
};
