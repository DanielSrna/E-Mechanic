import eventEmitter from '../eventEmitter.js';
import Notification from '../../models/notification.model.js';
import Order from '../../models/order.model.js';
import logger from '../../utils/logger.js';

async function notifyUser(userId, type, title, message, orderId = null) {
  try {
    await Notification.create({ userId, type, title, message, orderId });
    logger.exito('Notificación creada: %s → %s', type, title.substring(0, 40));
  } catch (error) {
    logger.fracaso('Error creando notificación: %s', error.message);
  }
}

eventEmitter.on(
  'order:statusChanged',
  async ({ orderId, oldStatus, newStatus, motorcycle }) => {
    try {
      const order = await Order.findById(orderId)
        .select('mechanic client')
        .lean();
      if (!order) return;

      const title = `OT ${motorcycle || ''} — ${newStatus.replace(/_/g, ' ')}`;
      const message = `La orden pasó de ${oldStatus.replace(/_/g, ' ')} a ${newStatus.replace(/_/g, ' ')}`;

      if (order.client) {
        await notifyUser(order.client, 'order_status', title, message, orderId);
      }
      if (order.mechanic) {
        await notifyUser(
          order.mechanic,
          'order_status',
          title,
          message,
          orderId
        );
      }
    } catch (error) {
      logger.fracaso('Error notificando cambio de estado: %s', error.message);
    }
  }
);

eventEmitter.on('order:closed', async ({ orderId, orderData }) => {
  try {
    const client = orderData?.client?._id || orderData?.client;
    const mechanic = orderData?.mechanic;

    const title = `Orden cerrada — ${orderData?.motorcycle?.plate || orderId}`;
    const message = `Total: $${(orderData?.total || 0).toLocaleString('es-CO')}`;

    if (client)
      await notifyUser(client, 'order_closed', title, message, orderId);
    if (mechanic)
      await notifyUser(mechanic, 'order_closed', title, message, orderId);
  } catch (error) {
    logger.fracaso('Error notificando cierre de orden: %s', error.message);
  }
});

eventEmitter.on(
  'inventory:low-stock',
  async ({ sku, name, stock, minStock }) => {
    try {
      const { default: User } = await import('../../models/user.model.js');
      const admins = await User.find({ rol: 'admin', isActive: true }).select(
        '_id'
      );
      const title = `Stock bajo: ${name}`;
      const message = `${sku}: ${stock}/${minStock} unidades`;

      for (const admin of admins) {
        await notifyUser(admin._id, 'low_stock', title, message);
      }
    } catch (error) {
      logger.fracaso('Error notificando stock bajo: %s', error.message);
    }
  }
);

eventEmitter.on(
  'invoice:created',
  async ({ orderId, invoiceNumber, status }) => {
    try {
      const order = await Order.findById(orderId)
        .select('client mechanic')
        .lean();
      if (!order) return;

      const title = `Factura ${invoiceNumber} — ${status === 'sent' ? 'Enviada' : 'Falló'}`;
      const message =
        status === 'sent'
          ? `Factura generada y enviada exitosamente`
          : `La factura se generó pero el envío falló`;

      if (order.client)
        await notifyUser(order.client, 'invoice', title, message, orderId);
    } catch (error) {
      logger.fracaso('Error notificando factura: %s', error.message);
    }
  }
);

logger.exito('Listeners de notificaciones cargados');
