import express from 'express';
const router = express.Router();
import * as statsController from '../controllers/stats.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

router.use(verifyToken);

/**
 * @swagger
 * /api/stats/overview:
 *   get:
 *     summary: Resumen general del negocio (KPIs)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPIs (total clientes, órdenes, repuestos, ingresos del mes, pendientes)
 */
router
  .route('/overview')
  .get(requireRole('admin'), statsController.getOverview);

/**
 * @swagger
 * /api/stats/revenue:
 *   get:
 *     summary: Ingresos por período (monthly | weekly)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, weekly]
 *         description: Período de agrupación
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Fecha fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Datos de ingresos (labels, revenue, count, avgTicket)
 */
router
  .route('/revenue')
  .get(requireRole('admin'), statsController.getRevenueStats);

/**
 * @swagger
 * /api/stats/mechanic-productivity:
 *   get:
 *     summary: Productividad por mecánico (órdenes completadas, total facturado)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking de mecánicos
 */
router
  .route('/mechanic-productivity')
  .get(requireRole('admin'), statsController.getMechanicProductivity);

/**
 * @swagger
 * /api/stats/most-used-parts:
 *   get:
 *     summary: Repuestos más usados (top 20)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking de repuestos por cantidad y revenue
 */
router
  .route('/most-used-parts')
  .get(requireRole('admin'), statsController.getMostUsedParts);

/**
 * @swagger
 * /api/stats/order-status-distribution:
 *   get:
 *     summary: Distribución de órdenes por estado (para gráfica de pastel)
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Distribución de estados
 */
router
  .route('/order-status-distribution')
  .get(requireRole('admin'), statsController.getOrderStatusDistribution);

router
  .route('/mechanics/:id')
  .get(requireRole('admin'), statsController.getMechanicDetailStats);

export default router;
