import express from 'express';
const router = express.Router();
import * as webhookController from '../controllers/webhook.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

router.use(verifyToken);
router.use(requireRole('admin'));

router
  .route('/')
  .get(webhookController.getWebhooks)
  .post(webhookController.createWebhook);

router.route('/:id').delete(webhookController.deleteWebhook);

router.route('/:id/toggle').put(webhookController.toggleWebhook);

export default router;
