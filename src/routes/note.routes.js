import express from 'express';
import * as noteController from '../controllers/noteController.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Obtener notas de un match
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: movieId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de notas
 */
router.get('/', noteController.getNotes);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Agregar una nota
 *     tags: [Notas]
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
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nota creada
 */
router.post('/', 
    validateRequest(['matchId', 'movieId', 'note']),
    noteController.addNote
);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Eliminar una nota
 *     tags: [Notas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nota eliminada
 */
router.delete('/:id', noteController.deleteNote);

export default router;
