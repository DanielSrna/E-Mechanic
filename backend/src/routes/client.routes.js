import express from 'express';
const router = express.Router();
import * as clientController from '../controllers/client.controller.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import {
  createClientValidator,
  updateClientValidator,
  clientIdValidator,
} from '../validators/client.validators.js';

router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         address:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado
 *       400:
 *         description: Error de validación
 */
router
  .route('/')
  .post(
    requireRole('admin'),
    createClientValidator,
    validate,
    clientController.createClient
  );

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Listar todos los clientes
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, teléfono o email
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router
  .route('/')
  .get(requireRole('admin', 'mecanico'), clientController.getClients);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clients]
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
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router
  .route('/:id')
  .get(
    requireRole('admin', 'mecanico'),
    clientIdValidator,
    validate,
    clientController.getClientById
  );

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clients]
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
 *         description: Cliente actualizado
 */
router
  .route('/:id')
  .put(
    requireRole('admin'),
    clientIdValidator,
    updateClientValidator,
    validate,
    clientController.updateClient
  );

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags: [Clients]
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
 *         description: Cliente eliminado
 */
router
  .route('/:id')
  .delete(
    requireRole('admin'),
    clientIdValidator,
    validate,
    clientController.deleteClient
  );

export default router;
