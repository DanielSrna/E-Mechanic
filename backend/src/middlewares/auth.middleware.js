import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
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
    if (!req.user)
      return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

export const requireAssignedMechanic = async (req, res, next) => {
  if (req.user.rol === 'admin') return next();

  const orderId = req.params.id;
  if (!orderId) return res.status(400).json({ message: 'Order ID required' });

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.mechanic.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the assigned mechanic can modify this order',
      });
    }
    req.order = order;
    next();
  } catch {
    return res
      .status(500)
      .json({ message: 'Error verifying mechanic assignment' });
  }
};
