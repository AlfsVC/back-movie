import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Obtener notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get('/', notificationController.getNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Marcar notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Eliminar notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/:id', notificationController.deleteNotification);

export default router;
