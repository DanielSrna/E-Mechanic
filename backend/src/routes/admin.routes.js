import express from 'express';
const router = express.Router();
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';
import Client from '../models/client.model.js';
import Motorcycle from '../models/motorcycle.model.js';
import Part from '../models/part.model.js';
import Order from '../models/order.model.js';
import Notification from '../models/notification.model.js';
import logger from '../utils/logger.js';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, '..', '..', 'seed.js');

// Público: permite poblar la BD sin autenticación
router.post('/seed-demo', async (req, res, next) => {
  try {
    exec(`node ${seedPath} --force`, (error, stdout, stderr) => {
      if (error) {
        logger.fracaso('Error ejecutando seed: %s', stderr || error.message);
        return res.status(500).json({ message: 'Error ejecutando seed' });
      }
      logger.exito('Seed ejecutado vía endpoint público');
      res.status(200).json({ message: 'Datos demo recargados' });
    });
  } catch (error) {
    next(error);
  }
});

// Protegido: solo admins autenticados pueden limpiar
router.use(verifyToken);
router.use(requireRole('admin'));

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
