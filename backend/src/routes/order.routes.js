import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/order.controller.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import {
  verifyToken,
  requireRole,
  requireAssignedMechanic,
} from '../middlewares/auth.middleware.js';
import {
  createOrderValidator,
  updateStatusValidator,
  addPartValidator,
  removePartValidator,
  addLaborValidator,
  removeLaborValidator,
  orderIdValidator,
} from '../validators/order.validators.js';

router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkOrder:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         motorcycle:
 *           $ref: '#/components/schemas/Motorcycle'
 *         client:
 *           $ref: '#/components/schemas/Client'
 *         mechanic:
 *           type: object
 *         status:
 *           type: string
 *           enum: [ingresada, en_revision, esperando_aprobacion, esperando_repuestos, en_reparacion, lista_entrega, entregada, cancelada]
 *         entryReason:
 *           type: string
 *         diagnosis:
 *           type: string
 *         partsUsed:
 *           type: array
 *         labor:
 *           type: array
 *         subtotalParts:
 *           type: number
 *         subtotalLabor:
 *           type: number
 *         tax:
 *           type: number
 *         total:
 *           type: number
 *         isClosed:
 *           type: boolean
 *         closedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear una nueva orden de trabajo
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [motorcycle, mechanic, entryReason]
 *             properties:
 *               motorcycle:
 *                 type: string
 *                 description: ID de la motocicleta
 *               mechanic:
 *                 type: string
 *                 description: ID del mecánico asignado
 *               entryReason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orden creada
 */
router
  .route('/')
  .post(
    requireRole('admin'),
    createOrderValidator,
    validate,
    orderController.createOrder
  );

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar órdenes de trabajo (con filtros)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: mechanic
 *         schema:
 *           type: string
 *       - in: query
 *         name: motorcycle
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de órdenes
 */
router
  .route('/')
  .get(requireRole('admin', 'mecanico'), orderController.getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener orden por ID (detalle completo)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden encontrada
 */
router
  .route('/:id')
  .get(
    requireRole('admin', 'mecanico'),
    orderIdValidator,
    validate,
    orderController.getOrderById
  );

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Cambiar estado de la orden (máquina de estados)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router
  .route('/:id/status')
  .put(
    requireAssignedMechanic,
    updateStatusValidator,
    validate,
    orderController.updateOrderStatus
  );

/**
 * @swagger
 * /api/orders/{id}/parts:
 *   put:
 *     summary: Agregar repuesto a la orden (descuenta inventario automáticamente)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [partId, quantity]
 *             properties:
 *               partId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Repuesto agregado
 */
router
  .route('/:id/parts')
  .put(
    requireAssignedMechanic,
    addPartValidator,
    validate,
    orderController.addPartToOrder
  )
  .delete(
    requireAssignedMechanic,
    removePartValidator,
    validate,
    orderController.removePartFromOrder
  );

/**
 * @swagger
 * /api/orders/{id}/labor:
 *   put:
 *     summary: Agregar mano de obra a la orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, cost]
 *             properties:
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Mano de obra agregada
 */
router
  .route('/:id/labor')
  .put(
    requireRole('admin'),
    addLaborValidator,
    validate,
    orderController.addLaborToOrder
  )
  .delete(
    requireRole('admin'),
    removeLaborValidator,
    validate,
    orderController.removeLaborFromOrder
  );

/**
 * @swagger
 * /api/orders/{id}/close:
 *   put:
 *     summary: Cerrar orden (calcula totales, bloquea ediciones, dispara evento order:closed)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden cerrada
 */
router
  .route('/:id/close')
  .put(
    requireRole('admin'),
    orderIdValidator,
    validate,
    orderController.closeOrder
  );

export default router;
