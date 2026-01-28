import prisma from '../config/database.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { matchId, friendId, content } = req.body;
    const senderId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'El contenido del mensaje es requerido' });
    }

    let targetType = null;
    let targetExists = null;
    if (matchId) {
      // Verify match exists and user is part of it
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });
      targetExists = match;
      targetType = 'match';
      if (!match) {
        return res.status(404).json({ error: 'Match no encontrado' });
      }
      if (match.user1Id !== senderId && match.user2Id !== senderId) {
        return res.status(403).json({ error: 'No tienes permiso para enviar mensajes a este match' });
      }
    } else if (friendId) {
      // Verify friendship exists and is accepted and user is part of it
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendId },
      });
      targetExists = friendship;
      targetType = 'friend';
      if (!friendship) {
        return res.status(404).json({ error: 'Amistad no encontrada' });
      }
      if (friendship.status !== 'ACCEPTED') {
        return res.status(403).json({ error: 'La amistad no está aceptada' });
      }
      if (friendship.requesterId !== senderId && friendship.addresseeId !== senderId) {
        return res.status(403).json({ error: 'No tienes permiso para enviar mensajes a esta amistad' });
      }
    } else {
      return res.status(400).json({ error: 'Se requiere matchId o friendId' });
    }

    // Set expiration (e.g., 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const message = await prisma.message.create({
      data: {
        matchId: matchId || null,
        friendId: friendId || null,
        senderId,
        content,
        expiresAt,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { matchId, friendId } = req.params;
    const userId = req.user.id;

    if (matchId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });
      if (!match) {
        return res.status(404).json({ error: 'Match no encontrado' });
      }
      if (match.user1Id !== userId && match.user2Id !== userId) {
        return res.status(403).json({ error: 'No tienes permiso para ver estos mensajes' });
      }
    } else if (friendId) {
      const friendship = await prisma.friendship.findUnique({
        where: { id: friendId },
      });
      if (!friendship) {
        return res.status(404).json({ error: 'Amistad no encontrada' });
      }
      if (friendship.status !== 'ACCEPTED') {
        return res.status(403).json({ error: 'La amistad no está aceptada' });
      }
      if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
        return res.status(403).json({ error: 'No tienes permiso para ver estos mensajes' });
      }
    } else {
      return res.status(400).json({ error: 'Se requiere matchId o friendId' });
    }

    // Cleanup expired messages for this match (lazy cleanup)
    await prisma.message.deleteMany({
      where: {
        OR: [
          matchId ? { matchId } : {},
          friendId ? { friendId } : {},
        ],
        expiresAt: { lt: new Date() },
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          matchId ? { matchId } : {},
          friendId ? { friendId } : {},
        ],
        expiresAt: { gt: new Date() }, // Only get non-expired
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};
