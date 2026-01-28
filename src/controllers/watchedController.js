import prisma from '../config/database.js';
import statsService from '../services/statsService.js';

export const getWatchedMovies = async (req, res, next) => {
    try {
        const { matchId } = req.query;

        if (!matchId) {
            return res.status(400).json({ error: 'matchId es requerido' });
        }

        // Verificar que el usuario tenga acceso a este match
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este match' });
        }

        const watchedMovies = await prisma.watchedMovie.findMany({
            where: { matchId },
            include: {
                movie: true,
            },
            orderBy: { watchedAt: 'desc' },
        });

        res.json(watchedMovies);
    } catch (error) {
        next(error);
    }
};

export const addWatchedMovie = async (req, res, next) => {
    try {
        const { matchId, movieId, rating } = req.body;

        if (!matchId || !movieId) {
            return res.status(400).json({ error: 'matchId y movieId son requeridos' });
        }

        // Verificar que el match existe y que el usuario tiene acceso
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este match' });
        }

        // Verificar que la película existe
        const movie = await prisma.movie.findUnique({
            where: { id: movieId },
        });

        if (!movie) {
            return res.status(404).json({ error: 'Película no encontrada' });
        }

        // Verificar si ya fue visto
        const existingWatched = await prisma.watchedMovie.findUnique({
            where: {
                matchId_movieId: {
                    matchId,
                    movieId,
                },
            },
        });

        if (existingWatched) {
            return res.status(409).json({ error: 'La película ya fue marcada como vista en este match' });
        }

        const watched = await prisma.watchedMovie.create({
            data: {
                matchId,
                movieId,
                ...(rating && { rating: parseInt(rating) }),
            },
            include: {
                movie: true,
            },
        });

        // Actualizar estadísticas
        await statsService.updateWatchedStats(matchId, movieId);

        res.status(201).json(watched);
    } catch (error) {
        next(error);
    }
};

export const updateWatchedMovie = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        if (!rating) {
            return res.status(400).json({ error: 'rating es requerido' });
        }

        const watched = await prisma.watchedMovie.findUnique({
            where: { id },
            include: { match: true },
        });

        if (!watched) {
            return res.status(404).json({ error: 'Película vista no encontrada' });
        }

        // Verificar acceso
        if (watched.match.user1Id !== req.user.id && watched.match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este recurso' });
        }

        const updated = await prisma.watchedMovie.update({
            where: { id },
            data: { rating: parseInt(rating) },
            include: { movie: true },
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const removeWatchedMovie = async (req, res, next) => {
    try {
        const { id } = req.params;

        const watched = await prisma.watchedMovie.findUnique({
            where: { id },
            include: { match: true },
        });

        if (!watched) {
            return res.status(404).json({ error: 'Película vista no encontrada' });
        }

        // Verificar acceso
        if (watched.match.user1Id !== req.user.id && watched.match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este recurso' });
        }

        await prisma.watchedMovie.delete({
            where: { id },
        });

        res.json({ message: 'Película marcada como no vista' });
    } catch (error) {
        next(error);
    }
};

export const getMatchWatchStats = async (req, res, next) => {
    try {
        const { matchId } = req.params;

        // Verificar acceso al match
        const match = await prisma.match.findUnique({
            where: { id: matchId },
        });

        if (!match) {
            return res.status(404).json({ error: 'Match no encontrado' });
        }

        if (match.user1Id !== req.user.id && match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a este match' });
        }

        const stats = await statsService.getMatchWatchStats(matchId);

        res.json(stats);
    } catch (error) {
        next(error);
    }
};
