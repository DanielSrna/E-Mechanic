import express from 'express';
const router = express.Router();
import * as motorcycleController from '../controllers/motorcycle.controller.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import {
  createMotorcycleValidator,
  updateMotorcycleValidator,
  motorcycleIdValidator,
  motorcyclePlateQueryValidator,
} from '../validators/motorcycle.validators.js';

router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Motorcycle:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         plate:
 *           type: string
 *         brand:
 *           type: string
 *         model:
 *           type: string
 *         year:
 *           type: number
 *         mileage:
 *           type: number
 *         client:
 *           $ref: '#/components/schemas/Client'
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/motorcycles:
 *   post:
 *     summary: Registrar una nueva motocicleta
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plate, brand, model, year, mileage, client]
 *             properties:
 *               plate:
 *                 type: string
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               mileage:
 *                 type: number
 *               client:
 *                 type: string
 *                 description: ID del cliente
 *     responses:
 *       201:
 *         description: Motocicleta creada
 */
router
  .route('/')
  .post(
    requireRole('admin'),
    createMotorcycleValidator,
    validate,
    motorcycleController.createMotorcycle
  );

/**
 * @swagger
 * /api/motorcycles:
 *   get:
 *     summary: Listar motocicletas (con búsqueda por placa)
 *     tags: [Motorcycles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: plate
 *         schema:
 *           type: string
 *         description: Buscar por placa exacta
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filtrar por cliente
 *     responses:
 *       200:
 *         description: Lista de motocicletas
 */
router
  .route('/')
  .get(
    requireRole('admin', 'mecanico'),
    motorcyclePlateQueryValidator,
    validate,
    motorcycleController.getMotorcycles
  );

/**
 * @swagger
 * /api/motorcycles/{id}:
 *   get:
 *     summary: Obtener motocicleta por ID
 *     tags: [Motorcycles]
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
 *         description: Motocicleta encontrada
 */
router
  .route('/:id')
  .get(
    requireRole('admin', 'mecanico'),
    motorcycleIdValidator,
    validate,
    motorcycleController.getMotorcycleById
  );

/**
 * @swagger
 * /api/motorcycles/{id}:
 *   put:
 *     summary: Actualizar motocicleta
 *     tags: [Motorcycles]
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
 *         description: Motocicleta actualizada
 */
router
  .route('/:id')
  .put(
    requireRole('admin'),
    motorcycleIdValidator,
    updateMotorcycleValidator,
    validate,
    motorcycleController.updateMotorcycle
  );

/**
 * @swagger
 * /api/motorcycles/{id}:
 *   delete:
 *     summary: Eliminar motocicleta
 *     tags: [Motorcycles]
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
 *         description: Motocicleta eliminada
 */
router
  .route('/:id')
  .delete(
    requireRole('admin'),
    motorcycleIdValidator,
    validate,
    motorcycleController.deleteMotorcycle
  );

/**
 * @swagger
 * /api/motorcycles/{id}/history:
 *   get:
 *     summary: Historial clínico de la motocicleta (todas las órdenes de trabajo)
 *     tags: [Motorcycles]
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
 *         description: Historial de órdenes
 */
router
  .route('/:id/history')
  .get(
    requireRole('admin', 'mecanico'),
    motorcycleIdValidator,
    validate,
    motorcycleController.getMotorcycleHistory
  );

export default router;
