import Notification from '../models/notification.model.js';
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
