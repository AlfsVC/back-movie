import prisma from '../config/database.js';

class NotificationService {
    async createNotification(userId, type, title, message, data = null) {
        return await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data,
            },
        });
    }

    async notifyMatchRequest(requesterId, targetUserId, requesterUsername) {
        return await this.createNotification(
            targetUserId,
            'MATCH_REQUEST',
            'Nueva solicitud de match',
            `${requesterUsername} quiere hacer match contigo`,
            { requesterId }
        );
    }

    async notifyMatchAccepted(accepterId, requesterId, accepterUsername) {
        return await this.createNotification(
            requesterId,
            'MATCH_ACCEPTED',
            'Match aceptado',
            `${accepterUsername} aceptó tu solicitud de match`,
            { accepterId }
        );
    }

    async notifyFriendRequest(requesterId, targetUserId, requesterUsername) {
        return await this.createNotification(
            targetUserId,
            'FRIEND_REQUEST',
            'Nueva solicitud de amistad',
            `${requesterUsername} quiere ser tu amigo`,
            { requesterId }
        );
    }

    async notifyFriendAccepted(accepterId, requesterId, accepterUsername) {
        return await this.createNotification(
            requesterId,
            'FRIEND_ACCEPTED',
            'Solicitud de amistad aceptada',
            `${accepterUsername} aceptó tu solicitud de amistad`,
            { accepterId }
        );
    }

    async notifyMovieWatched(matchId, movieTitle, partnerIds) {
        const notifications = partnerIds.map(userId =>
            this.createNotification(
                userId,
                'MOVIE_WATCHED',
                'Película marcada como vista',
                `Tu pareja marcó "${movieTitle}" como vista`,
                { matchId, movieTitle }
            )
        );
        return await Promise.all(notifications);
    }

    async getUserNotifications(userId, unreadOnly = false) {
        return await prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly && { read: false }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async markAsRead(notificationId, userId) {
        return await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
            },
            data: { read: true },
        });
    }

    async markAllAsRead(userId) {
        return await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
}

export default new NotificationService();