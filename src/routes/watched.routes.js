import express from 'express';
import * as watchedController from '../controllers/watchedController.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /watched/match/{matchId}/stats:
 *   get:
 *     summary: Obtener estadísticas de películas vistas en un match
 *     tags: [Películas Vistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Estadísticas del match
 *       404:
 *         description: Match no encontrado
 */
router.get('/match/:matchId/stats', watchedController.getMatchWatchStats);

/**
 * @swagger
 * /watched:
 *   get:
 *     summary: Obtener películas vistas en un match
 *     tags: [Películas Vistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: matchId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de películas vistas
 */
router.get('/', watchedController.getWatchedMovies);

/**
 * @swagger
 * /watched:
 *   post:
 *     summary: Marcar película como vista en un match
 *     tags: [Películas Vistas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchId:
 *                 type: string
 *               movieId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 description: Calificación de 1 a 10 (opcional)
 *     responses:
 *       201:
 *         description: Película marcada como vista
 *       409:
 *         description: La película ya fue marcada como vista
 */
router.post('/', 
    validateRequest(['matchId', 'movieId']),
    watchedController.addWatchedMovie
);

/**
 * @swagger
 * /watched/{id}:
 *   put:
 *     summary: Actualizar calificación de película vista
 *     tags: [Películas Vistas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Calificación actualizada
 */
router.put('/:id', 
    validateRequest(['rating']),
    watchedController.updateWatchedMovie
);

/**
 * @swagger
 * /watched/{id}:
 *   delete:
 *     summary: Desmarcar película como vista
 *     tags: [Películas Vistas]
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
 *         description: Película desmarcada
 */
router.delete('/:id', watchedController.removeWatchedMovie);

export default router;
