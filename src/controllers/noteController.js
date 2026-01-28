import prisma from '../config/database.js';

export const getNotes = async (req, res, next) => {
    try {
        const { matchId, movieId } = req.query;

        if (!matchId) {
            return res.status(400).json({ error: 'matchId es requerido' });
        }

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

        const whereClause = { matchId };
        if (movieId) {
            whereClause.movieId = parseInt(movieId);
        }

        const notes = await prisma.matchNote.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });

        res.json(notes);
    } catch (error) {
        next(error);
    }
};

export const addNote = async (req, res, next) => {
    try {
        const { matchId, movieId, note } = req.body;

        if (!matchId || !movieId || !note) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

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

        const newNote = await prisma.matchNote.create({
            data: {
                matchId,
                movieId: parseInt(movieId),
                note,
            },
        });

        res.status(201).json(newNote);
    } catch (error) {
        next(error);
    }
};

export const deleteNote = async (req, res, next) => {
    try {
        const { id } = req.params;

        const note = await prisma.matchNote.findUnique({
            where: { id },
            include: { match: true },
        });

        if (!note) {
            return res.status(404).json({ error: 'Nota no encontrada' });
        }

        if (note.match.user1Id !== req.user.id && note.match.user2Id !== req.user.id) {
            return res.status(403).json({ error: 'No tienes acceso a esta nota' });
        }

        await prisma.matchNote.delete({
            where: { id },
        });

        res.json({ message: 'Nota eliminada' });
    } catch (error) {
        next(error);
    }
};
