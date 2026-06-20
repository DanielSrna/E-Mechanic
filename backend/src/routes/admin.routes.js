import express from 'express';
const router = express.Router();
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { env } from '../config/env.config.js';
import User from '../models/user.model.js';
import Client from '../models/client.model.js';
import Motorcycle from '../models/motorcycle.model.js';
import Part from '../models/part.model.js';
import Order from '../models/order.model.js';
import Notification from '../models/notification.model.js';
import logger from '../utils/logger.js';

router.use(verifyToken);
router.use(requireRole('admin'));

router.post('/seed-demo', async (req, res, next) => {
  try {
    const { default: seed } = await import('../../seed.js');
    logger.exito('Seed ejecutado manualmente por admin');
    res.status(200).json({ message: 'Datos demo recargados' });
  } catch (error) {
    logger.fracaso('Error ejecutando seed manual: %s', error.message);
    next(error);
  }
});

router.post('/clear-demo', async (req, res, next) => {
  try {
    const collections = [
      { model: Order, name: 'Órdenes' },
      { model: Client, name: 'Clientes' },
      { model: Motorcycle, name: 'Motocicletas' },
      { model: Part, name: 'Repuestos' },
      { model: Notification, name: 'Notificaciones' },
    ];

    const results = {};
    for (const { model, name } of collections) {
      const r = await model.deleteMany({});
      results[name] = r.deletedCount;
    }

    // Eliminar mecánicos demo (dejar solo admins)
    const mechsDeleted = await User.deleteMany({ rol: { $ne: 'admin' } });
    results.Mecánicos = mechsDeleted.deletedCount;

    logger.exito('Datos demo limpiados manualmente por admin');
    res.status(200).json({ message: 'Datos demo eliminados', deleted: results });
  } catch (error) {
    logger.fracaso('Error limpiando datos demo: %s', error.message);
    next(error);
  }
});

export default router;
