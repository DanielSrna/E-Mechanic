import express from 'express';
const router = express.Router();
import * as scheduleController from '../controllers/schedule.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

router.use(verifyToken);

/**
 * @swagger
 * /api/schedule:
 *   get:
 *     summary: Obtener capacidad del taller por rango de fechas
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Fecha fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Capacidad por día
 */
router
  .route('/')
  .get(requireRole('admin'), scheduleController.getSchedule);

/**
 * @swagger
 * /api/schedule/check:
 *   get:
 *     summary: Verificar si un día tiene capacidad para un tipo de servicio
 *     tags: [Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         description: Fecha (YYYY-MM-DD)
 *       - in: query
 *         name: serviceType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [rapido, medio, complejo, especial]
 *     responses:
 *       200:
 *         description: Resultado de capacidad
 */
router
  .route('/check')
  .get(requireRole('admin'), scheduleController.checkCapacity);

export default router;
