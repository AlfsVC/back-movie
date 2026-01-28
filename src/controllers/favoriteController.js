import prisma from '../config/database.js';
import tmdbService from '../services/tmdbService.js';

export const getFavorites = async (req, res, next) => {
    try {
        const favorites = await prisma.userFavorite.findMany({
            where: { userId: req.user.id },
            include: { movie: true },
            orderBy: { addedAt: 'desc' },
        });

        res.json(favorites);
    } catch (error) {
        next(error);
    }
};

export const addFavorite = async (req, res, next) => {
    try {
        const { movieId } = req.body;

        // Verificar si la película existe en BD, si no, crearla
        let movie = await prisma.movie.findUnique({
            where: { tmdbId: movieId },
        });

        if (!movie) {
            const tmdbMovie = await tmdbService.getMovieDetails(movieId);

            movie = await prisma.movie.create({
                data: {
                    id: tmdbMovie.id,
                    tmdbId: tmdbMovie.id,
                    title: tmdbMovie.title,
                    description: tmdbMovie.overview,
                    posterPath: tmdbMovie.poster_path,
                    backdropPath: tmdbMovie.backdrop_path,
                    releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date) : null,
                    rating: tmdbMovie.vote_average,
                    genres: tmdbMovie.genres,
                    runtime: tmdbMovie.runtime,
                },
            });
        }

        const favorite = await prisma.userFavorite.create({
            data: {
                userId: req.user.id,
                movieId: movie.id,
            },
            include: { movie: true },
        });

        res.status(201).json(favorite);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'La película ya está en favoritos' });
        }
        next(error);
    }
};

export const removeFavorite = async (req, res, next) => {
    try {
        const { movieId } = req.params;

        await prisma.userFavorite.deleteMany({
            where: {
                userId: req.user.id,
                movieId: parseInt(movieId),
            },
        });

        res.json({ message: 'Película eliminada de favoritos' });
    } catch (error) {
        next(error);
    }
};

export const checkFavorite = async (req, res, next) => {
    try {
        const { movieId } = req.params;

        const favorite = await prisma.userFavorite.findUnique({
            where: {
                userId_movieId: {
                    userId: req.user.id,
                    movieId: parseInt(movieId),
                },
            },
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        next(error);
    }
};