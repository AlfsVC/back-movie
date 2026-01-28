import prisma from '../config/database.js';

export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        res.json(notifications);
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.update({
            where: { id },
            data: { read: true },
        });

        res.json(notification);
    } catch (error) {
        next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.notification.delete({
            where: { id },
        });

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
