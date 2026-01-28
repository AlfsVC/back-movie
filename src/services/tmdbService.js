import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

class TMDBService {
    async searchMovies(query, page = 1) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    query,
                    language: 'es-ES',
                    page,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error buscando películas en TMDb');
        }
    }

    async getMovieDetails(movieId) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                    append_to_response: 'credits,videos',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error obteniendo detalles de película');
        }
    }

    async getTrending(timeWindow = 'week') {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error obteniendo películas populares');
        }
    }

    async getGenres() {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                },
            });
            return response.data.genres;
        } catch (error) {
            throw new Error('Error obteniendo géneros');
        }
    }

    async discoverMovies(filters = {}) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                    sort_by: 'popularity.desc',
                    ...filters,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error en discover de películas');
        }
    }

    async getPopularMovies(page = 1) {
        return await this.discoverMovies({ page, sort_by: 'popularity.desc' });
    }

    async getUpcomingMovies(page = 1) {
        try {
            const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
                params: {
                    api_key: TMDB_API_KEY,
                    language: 'es-ES',
                    page,
                },
            });
            return response.data;
        } catch (error) {
            throw new Error('Error obteniendo películas próximas');
        }
    }

    async getMoviesByGenre(genreId, page = 1) {
        return await this.discoverMovies({ page, with_genres: genreId });
    }
}

export default new TMDBService();