import express from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /favorites/check/{movieId}:
 *   get:
 *     summary: Verificar si una película es favorita
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Estado de favorito
 */
router.get('/check/:movieId', favoriteController.checkFavorite);

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Obtener películas favoritas del usuario
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de películas favoritas
 *       401:
 *         description: No autorizado
 */
router.get('/', favoriteController.getFavorites);

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Agregar película a favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               movieId:
 *                 type: integer
 *                 example: 550
 *     responses:
 *       201:
 *         description: Película agregada a favoritos
 *       409:
 *         description: La película ya está en favoritos
 */
router.post('/', 
    validateRequest(['movieId']),
    favoriteController.addFavorite
);

/**
 * @swagger
 * /favorites/{movieId}:
 *   delete:
 *     summary: Eliminar película de favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Película eliminada de favoritos
 *       404:
 *         description: Favorito no encontrado
 */
router.delete('/:movieId', favoriteController.removeFavorite);

export default router;
