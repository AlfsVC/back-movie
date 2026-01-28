import prisma from '../config/database.js';
import notificationService from '../services/notificationService.js';
import statsService from '../services/statsService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getMatches = async (req, res, next) => {
    try {
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { user1Id: req.user.id },
                    { user2Id: req.user.id },
                ],
            },
            include: {
                user1: { select: { id: true, username: true, firstName: true, lastName: true, profileImage: true } },
                user2: { select: { id: true, username: true, firstName: true, lastName: true, profileImage: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formattedMatches = matches.map(match => ({
            ...match,
            partner: match.user1Id === req.user.id ? match.user2 : match.user1,
        }));

        res.json(formattedMatches);
    } catch (error) {
        next(error);
    }
};

export const createMatch = async (req, res, next) => {
    try {
        const { targetUsername } = req.body;

        const targetUser = await prisma.user.findUnique({
            where: { username: targetUsername },
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (targetUser.id === req.user.id) {
            return res.status(400).json({ error: 'No puedes hacer match contigo mismo' });
        }

        // Verificar si ya existe un match
        const existingMatch = await prisma.match.findFirst({
            where: {
                OR: [
                    { user1Id: req.user.id, user2Id: targetUser.id },
                    { user1Id: targetUser.id, user2Id: req.user.id },
                ],
            },
        });

        if (existingMatch) {
            // Si el match existe pero fue rechazado, permitir reactivarlo
            if (existingMatch.status === 'REJECTED') {
                const updatedMatch = await prisma.match.update({
                    where: { id: existingMatch.id },
                    data: {
                        status: 'PENDING',
                        user1Id: req.user.id, // El usuario actual se convierte en el solicitante
                        user2Id: targetUser.id,
                        createdAt: new Date(), // Actualizar fecha para que aparezca arriba
                        acceptedAt: null,
                    },
                    include: {
                        user1: { select: { id: true, username: true } },
                        user2: { select: { id: true, username: true } },
                    },
                });

                // Crear notificación
                await notificationService.notifyMatchRequest(
                    req.user.id,
                    targetUser.id,
                    req.user.username
                );

                return res.status(200).json(updatedMatch);
            }

            return res.status(409).json({ error: 'Ya existe un match con este usuario' });
        }

        const match = await prisma.match.create({
            data: {
                user1Id: req.user.id,
                user2Id: targetUser.id,
            },
            include: {
                user1: { select: { id: true, username: true } },
                user2: { select: { id: true, username: true } },
            },
        });

        // Crear notificación
        await notificationService.notifyMatchRequest(
            req.user.id,
            targetUser.id,
            req.user.username
        );

        res.status(201).json(match);
    } catch (error) {
        next(error);
    }
};

export const acceptMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        const match = await prisma.match.findUnique({
            where: { id },
            include: {
                user1: { select: { id: true, username: true } },
                user2: { select: { id: true, username: true } },
            },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para aceptar este match' });
        }

        const updatedMatch = await prisma.match.update({
            where: { id },
            data: {
                status: 'ACCEPTED',
                acceptedAt: new Date(),
            },
            include: {
                user1: { select: { id: true, username: true } },
                user2: { select: { id: true, username: true } },
            },
        });

        // Notificar al usuario que envió la solicitud
        await notificationService.notifyMatchAccepted(
            req.user.id,
            match.user1Id,
            req.user.username
        );

        res.json(updatedMatch);
    } catch (error) {
        next(error);
    }
};

export const rejectMatch = async (req, res, next) => {
    try {
        const { id } = req.params;

        const match = await prisma.match.findUnique({
            where: { id },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes permiso para rechazar este match' });
        }

        await prisma.match.update({
            where: { id },
            data: { status: 'REJECTED' },
        });

        res.json({ message: 'Match rechazado' });
    } catch (error) {
        next(error);
    }
};

export const getCommonMovies = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { genre, minRating, sortBy = 'addedAt' } = req.query;

        const match = await prisma.match.findUnique({
            where: { id },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este match' });
        }

        if (match.status !== 'ACCEPTED') {
            return res.status(400).json({ error: 'El match debe estar aceptado' });
        }

        // Obtener películas combinadas (Unión de favoritos)
        const user1Favorites = await prisma.userFavorite.findMany({
            where: { userId: match.user1Id },
            select: { movieId: true },
        });

        const user2Favorites = await prisma.userFavorite.findMany({
            where: { userId: match.user2Id },
            select: { movieId: true },
        });

        // Unir listas y eliminar duplicados
        const user1MovieIds = user1Favorites.map(f => f.movieId);
        const user2MovieIds = user2Favorites.map(f => f.movieId);
        const combinedMovieIds = [...new Set([...user1MovieIds, ...user2MovieIds])];

        // Obtener películas ya vistas
        const watchedMovies = await prisma.watchedMovie.findMany({
            where: { matchId: id },
            select: { movieId: true },
        });

        const watchedMovieIds = watchedMovies.map(w => w.movieId);

        // Filtrar no vistas
        const unwatchedMovieIds = combinedMovieIds.filter(
            id => !watchedMovieIds.includes(id)
        );

        // Construir filtros
        const whereClause = {
            id: { in: unwatchedMovieIds },
        };

        if (minRating) {
            whereClause.rating = { gte: parseFloat(minRating) };
        }

        // Obtener películas con detalles
        let movies = await prisma.movie.findMany({
            where: whereClause,
        });

        // Filtrar por género si se especifica
        if (genre) {
            movies = movies.filter(movie => {
                if (!movie.genres) return false;
                const genres = Array.isArray(movie.genres) ? movie.genres : JSON.parse(movie.genres);
                return genres.some(g => g.name === genre || g === genre);
            });
        }

        // Ordenar
        if (sortBy === 'rating') {
            movies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'releaseDate') {
            movies.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        } else {
            // Ordenamiento por defecto determinista (por título)
            movies.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        }

        res.json(movies);
    } catch (error) {
        next(error);
    }
};

export const getRandomMovie = async (req, res, next) => {
    try {
        const { id } = req.params;
        const match = await prisma.match.findUnique({
            where: { id },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este match' });
        }

        // Obtener favoritos de ambos usuarios
        const user1Favorites = await prisma.userFavorite.findMany({
            where: { userId: match.user1Id },
            select: { movieId: true },
        });

        const user2Favorites = await prisma.userFavorite.findMany({
            where: { userId: match.user2Id },
            select: { movieId: true },
        });

        // Combinar listas y eliminar duplicados (Unión en lugar de Intersección)
        const user1MovieIds = user1Favorites.map(f => f.movieId);
        const user2MovieIds = user2Favorites.map(f => f.movieId);
        const combinedMovieIds = [...new Set([...user1MovieIds, ...user2MovieIds])];

        const watchedMovies = await prisma.watchedMovie.findMany({
            where: { matchId: id },
            select: { movieId: true },
        });

        const watchedMovieIds = watchedMovies.map(w => w.movieId);
        const unwatchedMovieIds = combinedMovieIds.filter(
            id => !watchedMovieIds.includes(id)
        );

        if (unwatchedMovieIds.length === 0) {
            return res.status(404).json({ error: 'No hay películas disponibles sin ver' });
        }

        // Selección determinista basada en fecha y ID de match
        // Usar UTC para consistencia entre usuarios en diferentes zonas horarias
        const now = new Date();
        const seedStr = `${match.id}-${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
        
        // Simple hash function for seeding
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            const char = seedStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Usar valor absoluto y modulo para seleccionar índice
        const seed = Math.abs(hash);
        
        // Ordenar IDs para consistencia antes de seleccionar
        unwatchedMovieIds.sort((a, b) => a - b);
        
        const selectedIndex = seed % unwatchedMovieIds.length;
        const selectedId = unwatchedMovieIds[selectedIndex];

        const movie = await prisma.movie.findUnique({
            where: { id: selectedId },
        });

        res.json(movie);
    } catch (error) {
        next(error);
    }
};

export const getMatchStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const match = await prisma.match.findUnique({
            where: { id },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este match' });
        }

        const stats = await statsService.getMatchStats(id);
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

export const uploadBackground = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen' });
        }

        const match = await prisma.match.findUnique({
            where: { id },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este match' });
        }

        // Eliminar imagen anterior si existe
        if (match.backgroundImage) {
            const oldPath = match.backgroundImage.split('/uploads/')[1];
            if (oldPath) {
                const fullPath = path.join(__dirname, '../../uploads', oldPath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }
        }

        // Construir URL pública
        // Asumiendo que req.file.filename es solo el nombre del archivo en uploads/matches
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/matches/${req.file.filename}`;

        const updatedMatch = await prisma.match.update({
            where: { id },
            data: {
                backgroundImage: imageUrl,
            },
        });

        res.json({ backgroundImage: imageUrl });
    } catch (error) {
        next(error);
    }
};
