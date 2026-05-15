import express from 'express';
const router = express.Router();
import * as partController from '../controllers/part.controller.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import {
  createPartValidator,
  updatePartValidator,
  partIdValidator,
} from '../validators/part.validators.js';

router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Part:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         sku:
 *           type: string
 *         name:
 *           type: string
 *         brand:
 *           type: string
 *         description:
 *           type: string
 *         purchasePrice:
 *           type: number
 *         salePrice:
 *           type: number
 *         stock:
 *           type: number
 *         minStock:
 *           type: number
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/parts:
 *   post:
 *     summary: Crear un nuevo repuesto en inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sku, name, purchasePrice, salePrice]
 *             properties:
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               brand:
 *                 type: string
 *               description:
 *                 type: string
 *               purchasePrice:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               stock:
 *                 type: number
 *               minStock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Repuesto creado
 *       409:
 *         description: SKU duplicado
 */
router
  .route('/')
  .post(
    requireRole('admin'),
    createPartValidator,
    validate,
    partController.createPart
  );

/**
 * @swagger
 * /api/parts:
 *   get:
 *     summary: Listar repuestos (con búsqueda y filtro de stock bajo)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, SKU o marca
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filtrar solo repuestos con stock bajo (stock <= minStock)
 *     responses:
 *       200:
 *         description: Lista de repuestos
 */
router
  .route('/')
  .get(requireRole('admin', 'mecanico'), partController.getParts);

/**
 * @swagger
 * /api/parts/{id}:
 *   get:
 *     summary: Obtener repuesto por ID
 *     tags: [Inventory]
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
 *         description: Repuesto encontrado
 */
router
  .route('/:id')
  .get(
    requireRole('admin', 'mecanico'),
    partIdValidator,
    validate,
    partController.getPartById
  );

/**
 * @swagger
 * /api/parts/{id}:
 *   put:
 *     summary: Actualizar repuesto
 *     tags: [Inventory]
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
 *         description: Repuesto actualizado
 */
router
  .route('/:id')
  .put(
    requireRole('admin'),
    partIdValidator,
    updatePartValidator,
    validate,
    partController.updatePart
  );

/**
 * @swagger
 * /api/parts/{id}:
 *   delete:
 *     summary: Eliminar repuesto del inventario
 *     tags: [Inventory]
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
 *         description: Repuesto eliminado
 */
router
  .route('/:id')
  .delete(
    requireRole('admin'),
    partIdValidator,
    validate,
    partController.deletePart
  );

export default router;
