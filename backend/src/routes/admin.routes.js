import express from 'express';
const router = express.Router();
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';
import Client from '../models/client.model.js';
import Motorcycle from '../models/motorcycle.model.js';
import Part from '../models/part.model.js';
import Order from '../models/order.model.js';
import Notification from '../models/notification.model.js';
import Settings from '../models/settings.model.js';
import logger from '../utils/logger.js';

router.use(verifyToken);
router.use(requireRole('admin'));

router.post('/seed-demo', async (req, res, next) => {
  try {
    const { spawn } = await import('node:child_process');
    const cp = spawn('node', ['seed.js', '--force'], { cwd: process.cwd(), stdio: 'pipe' });

    let stderr = '';
    cp.stderr.on('data', (d) => (stderr += d));

    cp.on('close', (code) => {
      if (code !== 0) {
        logger.fracaso('Seed falló: %s', stderr);
        return res.status(500).json({ message: 'Error ejecutando seed' });
      }
      logger.exito('Seed ejecutado manualmente');
      res.status(200).json({ message: 'Datos demo recargados' });
    });

    cp.on('error', (err) => {
      logger.fracaso('Error al spawnear seed: %s', err.message);
      res.status(500).json({ message: 'Error ejecutando seed' });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/clear-demo', async (req, res, next) => {
  try {
    const results = {};
    for (const { model, name } of [
      { model: Order, name: 'Órdenes' },
      { model: Client, name: 'Clientes' },
      { model: Motorcycle, name: 'Motocicletas' },
      { model: Part, name: 'Repuestos' },
      { model: Notification, name: 'Notificaciones' },
    ]) {
      const r = await model.deleteMany({});
      results[name] = r.deletedCount;
    }
    results.Mecánicos = (await User.deleteMany({ rol: { $ne: 'admin' } })).deletedCount;

    logger.exito('Datos demo limpiados');
    res.status(200).json({ message: 'Datos demo eliminados', deleted: results });
  } catch (error) {
    logger.fracaso('Error limpiando: %s', error.message);
    next(error);
  }
});

export default router;
