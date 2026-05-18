import express from 'express';
const router = express.Router();
import * as exportController from '../controllers/export.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

router.use(verifyToken);
router.use(requireRole('admin'));

router.route('/orders').get(exportController.exportOrdersCSV);
router.route('/inventory').get(exportController.exportPartsCSV);

export default router;
