import express from 'express';
import * as userController from '../controllers/userController.js';
import { validateRequest } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/profile', userController.getProfile);
router.get('/profile/:username', userController.getPublicProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               backgroundImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Perfil actualizado
 */
router.put('/profile', 
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'backgroundImage', maxCount: 1 }
    ]), 
    userController.updateProfile
);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.post('/change-password', 
    validateRequest(['currentPassword', 'newPassword']),
    userController.changePassword
);

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Obtener estadísticas del usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del usuario
 */
router.get('/stats', userController.getUserStats);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Buscar usuarios
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de usuarios encontrados
 */
router.get('/search', userController.searchUsers);

/**
 * @swagger
 * /users/account:
 *   delete:
 *     summary: Eliminar cuenta de usuario
 *     tags: [Usuario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *       401:
 *         description: Contraseña incorrecta
 */
router.delete('/account', 
    validateRequest(['password']),
    userController.deleteAccount
);

export default router;
