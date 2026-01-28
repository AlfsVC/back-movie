import prisma from '../config/database.js'
import notificationService from '../services/notificationService.js'

export const getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { select: { id: true, username: true, firstName: true, lastName: true, profileImage: true } },
        addressee: { select: { id: true, username: true, firstName: true, lastName: true, profileImage: true } },
      },
      orderBy: { acceptedAt: 'desc' },
    })

    const friends = friendships.map((f) => ({
      id: f.id,
      status: f.status,
      createdAt: f.createdAt,
      acceptedAt: f.acceptedAt,
      partner: f.requesterId === userId ? f.addressee : f.requester,
    }))

    res.json(friends)
  } catch (error) {
    next(error)
  }
}

export const getRequests = async (req, res, next) => {
  try {
    const userId = req.user.id
    const requests = await prisma.friendship.findMany({
      where: {
        status: 'PENDING',
        addresseeId: userId,
      },
      include: {
        requester: { select: { id: true, username: true, firstName: true, lastName: true, profileImage: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(requests)
  } catch (error) {
    next(error)
  }
}

export const requestFriend = async (req, res, next) => {
  try {
    const { targetUsername } = req.body
    const requesterId = req.user.id

    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername },
    })

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    if (targetUser.id === requesterId) {
      return res.status(400).json({ error: 'No puedes agregarte como amigo' })
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId: targetUser.id },
          { requesterId: targetUser.id, addresseeId: requesterId },
        ],
      },
    })

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return res.status(409).json({ error: 'Ya son amigos' })
      }
      if (existing.status === 'PENDING') {
        return res.status(409).json({ error: 'Solicitud de amistad ya existente' })
      }
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId: targetUser.id,
        status: 'PENDING',
      },
    })

    await notificationService.notifyFriendRequest(requesterId, targetUser.id, req.user.username)

    res.status(201).json(friendship)
  } catch (error) {
    next(error)
  }
}

export const acceptFriend = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const friendship = await prisma.friendship.findUnique({ where: { id } })
    if (!friendship) {
      return res.status(404).json({ error: 'Solicitud no encontrada' })
    }
    if (friendship.addresseeId !== userId) {
      return res.status(403).json({ error: 'No puedes aceptar esta solicitud' })
    }
    if (friendship.status === 'ACCEPTED') {
      return res.status(409).json({ error: 'Ya fue aceptada' })
    }

    const updated = await prisma.friendship.update({
      where: { id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    })

    await notificationService.notifyFriendAccepted(userId, friendship.requesterId, req.user.username)

    res.json(updated)
  } catch (error) {
    next(error)
  }
}

export const rejectFriend = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const friendship = await prisma.friendship.findUnique({ where: { id } })
    if (!friendship) {
      return res.status(404).json({ error: 'Solicitud no encontrada' })
    }
    if (friendship.addresseeId !== userId) {
      return res.status(403).json({ error: 'No puedes rechazar esta solicitud' })
    }

    await prisma.friendship.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const removeFriend = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const friendship = await prisma.friendship.findUnique({ where: { id } })
    if (!friendship) {
      return res.status(404).json({ error: 'Amistad no encontrada' })
    }
    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      return res.status(403).json({ error: 'No puedes eliminar esta amistad' })
    }

    await prisma.friendship.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
