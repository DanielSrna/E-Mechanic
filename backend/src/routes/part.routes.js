import express from 'express';
const router = express.Router();
import * as partController from '../controllers/part.controller.js';
import Part from '../models/part.model.js';
import logger from '../utils/logger.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { deleteFile } from '../services/storage.service.js';
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

router.post(
  '/:id/image',
  requireRole('admin'),
  uploadSingle('image', 'parts'),
  async (req, res, next) => {
    try {
      const part = await Part.findById(req.params.id);
      if (!part) return res.status(404).json({ message: 'Part not found' });

      if (part.image) {
        await deleteFile(part.image);
      }

      part.image = req.uploadedFileUrl;
      await part.save();

      logger.exito('Imagen de repuesto actualizada: %s', part.name);
      res.status(200).json({ message: 'Image uploaded', part });
    } catch (error) {
      logger.fracaso('Error al subir imagen de repuesto: ', error);
      next(error);
    }
  }
);

export default router;
