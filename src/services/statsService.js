import prisma from '../config/database.js';

class StatsService {
    async getMatchStats(matchId) {
        const watched = await prisma.watchedMovie.findMany({
            where: { matchId },
            include: { movie: true },
        });

        const totalWatched = watched.length;
        const averageRating = watched.reduce((acc, w) => acc + (w.rating || 0), 0) / totalWatched || 0;

        const genreCounts = {};
        watched.forEach(w => {
            if (w.movie.genres) {
                const genres = Array.isArray(w.movie.genres) ? w.movie.genres : JSON.parse(w.movie.genres);
                genres.forEach(genre => {
                    const genreName = genre.name || genre;
                    genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
                });
            }
        });

        const topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Calcular racha
        const sortedWatched = watched.sort((a, b) =>
            new Date(b.watchedAt) - new Date(a.watchedAt)
        );

        let currentStreak = 0;
        let lastDate = null;

        for (const movie of sortedWatched) {
            const watchedDate = new Date(movie.watchedAt);
            if (!lastDate) {
                currentStreak = 1;
                lastDate = watchedDate;
            } else {
                const daysDiff = Math.floor((lastDate - watchedDate) / (1000 * 60 * 60 * 24));
                if (daysDiff <= 7) {
                    currentStreak++;
                    lastDate = watchedDate;
                } else {
                    break;
                }
            }
        }

        return {
            totalWatched,
            averageRating: averageRating.toFixed(1),
            topGenres,
            currentStreak,
            recentMovies: watched.slice(0, 5),
        };
    }

    async getUserStats(userId) {
        const favorites = await prisma.userFavorite.count({
            where: { userId },
        });

        const matches = await prisma.match.count({
            where: {
                OR: [{ user1Id: userId }, { user2Id: userId }],
                status: 'ACCEPTED',
            },
        });

        return {
            totalFavorites: favorites,
            totalMatches: matches,
        };
    }

    async updateWatchedStats(matchId, movieId) {
        // Aquí puedes agregar lógica para actualizar estadísticas de películas vistas
        // Por ejemplo, incrementar contadores, actualizar tendencias, etc.
        return await prisma.watchedMovie.findUnique({
            where: {
                matchId_movieId: {
                    matchId,
                    movieId,
                },
            },
        });
    }

    async getMatchWatchStats(matchId) {
        return await this.getMatchStats(matchId);
    }
}

export default new StatsService();