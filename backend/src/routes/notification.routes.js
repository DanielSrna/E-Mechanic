import express from 'express';
const router = express.Router();
import * as notificationController from '../controllers/notification.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

export default router;
