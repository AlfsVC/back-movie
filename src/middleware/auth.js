import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { 
                id: true, 
                username: true, 
                email: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                backgroundImage: true,
                bio: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Error de autenticación' });
    }
};

// Alias para compatibilidad
export const authenticate = authMiddleware;
