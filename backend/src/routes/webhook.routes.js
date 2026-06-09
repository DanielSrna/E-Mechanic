import express from 'express';
const router = express.Router();
import * as webhookController from '../controllers/webhook.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validatorErrorHandler.js';
import { body } from 'express-validator';

const VALID_WEBHOOK_EVENTS = [
  'order:statusChanged', 'order:closed', 'inventory:low-stock', 'invoice:created',
];

const webhookValidator = [
  body('url').trim().notEmpty().matches(/^https?:\/\/.+/).withMessage('Valid HTTP(S) URL required'),
  body('description').optional().trim().isLength({ max: 300 }),
  body('events').isArray({ min: 1 }).withMessage('At least one event required')
    .custom((events) => {
      const invalid = events.filter((e) => !VALID_WEBHOOK_EVENTS.includes(e));
      if (invalid.length > 0) {
        throw new Error(`Invalid events: ${invalid.join(', ')}`);
      }
      return true;
    }),
];

router.use(verifyToken);
router.use(requireRole('admin'));

router
  .route('/')
  .get(webhookController.getWebhooks)
  .post(webhookValidator, validate, webhookController.createWebhook);

router.route('/:id').delete(webhookController.deleteWebhook);

router.route('/:id/toggle').put(webhookController.toggleWebhook);

export default router;
