import tmdbService from '../services/tmdbService.js';
import prisma from '../config/database.js';

export const searchMovies = async (req, res, next) => {
    try {
        const { q, page = 1 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query requerido' });
        }

        const results = await tmdbService.searchMovies(q, page);
        res.json(results.results);
    } catch (error) {
        next(error);
    }
};

export const getMovieDetails = async (req, res, next) => {
    try {
        const { movieId } = req.params;
        const id = parseInt(movieId);

        // Validar que el ID sea un número válido
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID de película inválido' });
        }

        // Primero buscar en BD local
        let movie = await prisma.movie.findUnique({
            where: { tmdbId: id },
        });

        // Si no existe, traer de TMDb y guardar
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

        res.json(movie);
    } catch (error) {
        next(error);
    }
};

export const getTrending = async (req, res, next) => {
    try {
        const { timeWindow = 'week' } = req.query;
        const results = await tmdbService.getTrending(timeWindow);
        res.json(results);
    } catch (error) {
        next(error);
    }
};

export const getGenres = async (req, res, next) => {
    try {
        const genres = await tmdbService.getGenres();
        res.json(genres);
    } catch (error) {
        next(error);
    }
};

export const discoverMovies = async (req, res, next) => {
    try {
        const filters = req.query;
        const results = await tmdbService.discoverMovies(filters);
        res.json(results);
    } catch (error) {
        next(error);
    }
};

export const getPopularMovies = async (req, res, next) => {
    try {
        const { page = 1 } = req.query;
        const results = await tmdbService.getPopularMovies(parseInt(page));
        res.json(results.results);
    } catch (error) {
        next(error);
    }
};

export const getUpcomingMovies = async (req, res, next) => {
    try {
        const { page = 1 } = req.query;
        const results = await tmdbService.getUpcomingMovies(parseInt(page));
        res.json(results.results);
    } catch (error) {
        next(error);
    }
};

export const getMoviesByGenre = async (req, res, next) => {
    try {
        const { genreId, page = 1 } = req.query;

        if (!genreId) {
            return res.status(400).json({ error: 'genreId es requerido' });
        }

        const results = await tmdbService.getMoviesByGenre(parseInt(genreId), parseInt(page));
        res.json(results.results);
    } catch (error) {
        next(error);
    }
};