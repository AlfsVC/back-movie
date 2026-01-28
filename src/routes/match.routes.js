import express from 'express';
import * as matchController from '../controllers/matchController.js';
import { validateRequest } from '../middleware/validation.js';
import { matchUpload } from '../middleware/matchUpload.js';

const router = express.Router();

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Obtener todos los matches del usuario
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de matches del usuario
 */
router.get('/', matchController.getMatches);

/**
 * @swagger
 * /matches:
 *   post:
 *     summary: Crear nueva solicitud de match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUsername:
 *                 type: string
 *                 example: usuario123
 *     responses:
 *       201:
 *         description: Match creado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Ya existe un match con este usuario
 */
router.post('/', 
    validateRequest(['targetUsername']),
    matchController.createMatch
);

/**
 * @swagger
 * /matches/{id}/accept:
 *   put:
 *     summary: Aceptar solicitud de match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del match
 *     responses:
 *       200:
 *         description: Match aceptado
 *       404:
 *         description: Match no encontrado
 */
router.put('/:id/accept', matchController.acceptMatch);

/**
 * @swagger
 * /matches/{id}/reject:
 *   put:
 *     summary: Rechazar solicitud de match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Match rechazado
 *       404:
 *         description: Match no encontrado
 */
router.put('/:id/reject', matchController.rejectMatch);

/**
 * @swagger
 * /matches/{id}/common:
 *   get:
 *     summary: Obtener películas en común entre dos usuarios
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filtrar por género
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Calificación mínima
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [addedAt, rating, releaseDate]
 *         default: addedAt
 *     responses:
 *       200:
 *         description: Películas en común
 *       404:
 *         description: Match no encontrado
 */
router.get('/:id/common', matchController.getCommonMovies);

router.get('/:id/random', matchController.getRandomMovie);

router.get('/:id/stats', matchController.getMatchStats);

router.put('/:id/background', 
    matchUpload.single('backgroundImage'),
    matchController.uploadBackground
);

export default router;
