import express from 'express';
import * as movieController from '../controllers/movieController.js';

const router = express.Router();

/**
 * @swagger
 * /movies/search:
 *   get:
 *     summary: Buscar películas por título
 *     tags: [Películas]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *       400:
 *         description: Query requerido
 */
router.get('/search', movieController.searchMovies);

/**
 * @swagger
 * /movies/popular:
 *   get:
 *     summary: Obtener películas populares
 *     tags: [Películas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista de películas populares
 */
router.get('/popular', movieController.getPopularMovies);

/**
 * @swagger
 * /movies/upcoming:
 *   get:
 *     summary: Obtener películas próximas
 *     tags: [Películas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Lista de películas próximas
 */
router.get('/upcoming', movieController.getUpcomingMovies);

/**
 * @swagger
 * /movies/genres:
 *   get:
 *     summary: Obtener géneros disponibles
 *     tags: [Películas]
 *     responses:
 *       200:
 *         description: Lista de géneros
 */
router.get('/genres', movieController.getGenres);

/**
 * @swagger
 * /movies/by-genre:
 *   get:
 *     summary: Obtener películas por género
 *     tags: [Películas]
 *     parameters:
 *       - in: query
 *         name: genreId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del género
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Películas del género
 *       400:
 *         description: genreId es requerido
 */
router.get('/by-genre', movieController.getMoviesByGenre);

/**
 * @swagger
 * /movies/{movieId}:
 *   get:
 *     summary: Obtener detalles de una película
 *     tags: [Películas]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la película
 *     responses:
 *       200:
 *         description: Detalles de la película
 *       404:
 *         description: Película no encontrada
 */
router.get('/:movieId', movieController.getMovieDetails);

export default router;
