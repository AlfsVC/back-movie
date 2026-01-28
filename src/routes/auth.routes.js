import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: juan123
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: MiContraseña123
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Pérez
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       409:
 *         description: El usuario o email ya existe
 */
router.post('/register', 
    validateRequest(['username', 'email', 'password', 'firstName', 'lastName']),
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: MiContraseña123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', 
    validateRequest(['email', 'password']),
    authController.login
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario actual
 *       401:
 *         description: Token no válido o no proporcionado
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * @swagger
 * /auth/invitation-code:
 *   get:
 *     summary: Obtener código de invitación del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Código de invitación
 *       401:
 *         description: No autenticado
 */
router.get('/invitation-code', authMiddleware, authController.getInvitationCode);

/**
 * @swagger
 * /auth/validate-code:
 *   post:
 *     summary: Validar código de invitación
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invitationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código válido, usuario encontrado
 *       404:
 *         description: Código no válido
 */
router.post('/validate-code', authController.validateInvitationCode);

export default router;
