import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ notifications });
  } catch (error) {
    logger.fracaso('Error al obtener notificaciones: ', error);
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });
    res.status(200).json({ count });
  } catch (error) {
    logger.fracaso('Error al contar notificaciones: ', error);
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true }
    );
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    logger.fracaso('Error al marcar notificación: ', error);
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    res.status(200).json({ message: 'All marked as read' });
  } catch (error) {
    logger.fracaso('Error al marcar todas: ', error);
    next(error);
  }
};

export const requestAssistance = async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ message: 'La descripción es requerida' });
    }
    if (description.trim().split(/\s+/).length > 50) {
      return res.status(400).json({ message: 'Máximo 50 palabras' });
    }

    const admins = await User.find({ rol: 'admin', isActive: true }).select('_id');
    const mechanicName = req.user.name;

    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          userId: admin._id,
          type: 'assistance_request',
          title: 'Solicitud de asistencia',
          message: `El mecánico ${mechanicName} solicita asistencia con: ${description.trim()}`,
        })
      )
    );

    res.status(200).json({ message: 'Solicitud enviada al administrador' });
  } catch (error) {
    logger.fracaso('Error al solicitar asistencia: ', error);
    next(error);
  }
};
