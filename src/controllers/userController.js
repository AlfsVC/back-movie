import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deleteOldImage = (imageUrl) => {
    if (!imageUrl) return;
    
    try {
        // Extraer el nombre del archivo de la URL
        const filename = imageUrl.split('/').pop();
        if (!filename) return;

        const filePath = path.join(__dirname, '../../uploads/profiles', filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error al eliminar imagen anterior:', error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                favorites: {
                    include: {
                        movie: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // No devolver el passwordHash
        const { passwordHash, ...userWithoutPassword } = user;

        res.json(userWithoutPassword);
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, firstName, lastName, bio } = req.body;
        let profileImageUrl = typeof req.body.profileImage === 'string' || req.body.profileImage === null
            ? req.body.profileImage
            : undefined;
        let backgroundImageUrl = typeof req.body.backgroundImage === 'string' || req.body.backgroundImage === null
            ? req.body.backgroundImage
            : undefined;

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Obtener usuario actual para borrar imágenes anteriores si es necesario
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { profileImage: true, backgroundImage: true }
        });

        console.log('updateProfile headers content-type:', req.headers['content-type']);
        console.log('updateProfile body keys:', Object.keys(req.body));
        console.log('updateProfile body backgroundImage value:', req.body.backgroundImage, 'type:', typeof req.body.backgroundImage);
        if (req.files) {
            console.log('updateProfile files keys:', Object.keys(req.files));
            if (req.files.backgroundImage) {
                console.log('Found backgroundImage file:', req.files.backgroundImage[0].originalname);
            }
        } else {
            console.log('req.files is undefined');
        }

        // Manejar archivos subidos
        if (req.files) {
            if (req.files.profileImage) {
                // Con Cloudinary, file.path contiene la URL segura
                profileImageUrl = req.files.profileImage[0].path;
                console.log('New profileImageUrl (Cloudinary):', profileImageUrl);
            }
            if (req.files.backgroundImage) {
                // Con Cloudinary, file.path contiene la URL segura
                backgroundImageUrl = req.files.backgroundImage[0].path;
                console.log('New backgroundImageUrl (Cloudinary):', backgroundImageUrl);
            }
        } else if (req.file) {
            // Retrocompatibilidad por si acaso (aunque ahora usamos fields)
            if (currentUser.profileImage) {
                deleteOldImage(currentUser.profileImage);
            }
            profileImageUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
        }

        // Si el cliente solicita borrar explícitamente la imagen (enviar null), eliminar el archivo anterior
        if (backgroundImageUrl === null && currentUser.backgroundImage) {
            deleteOldImage(currentUser.backgroundImage);
        }
        if (profileImageUrl === null && currentUser.profileImage) {
            deleteOldImage(currentUser.profileImage);
        }

        // Verificar que el nuevo username/email no exista
        if (username || email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        ...(username ? [{ username }] : []),
                        ...(email ? [{ email }] : []),
                    ],
                    NOT: { id: req.user.id },
                },
            });

            if (existingUser) {
                return res.status(409).json({ error: 'El usuario o email ya existe' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(username && { username }),
                ...(email && { email }),
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(bio && { bio }),
                ...(profileImageUrl !== undefined && { profileImage: profileImageUrl }),
                ...(backgroundImageUrl !== undefined && { backgroundImage: backgroundImageUrl }),
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                bio: true,
                profileImage: true,
                backgroundImage: true,
                createdAt: true,
            },
        });

        console.log('updateProfile result backgroundImage:', updatedUser.backgroundImage);

        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'currentPassword y newPassword son requeridos' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash: newPasswordHash },
        });

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        next(error);
    }
};

export const getUserStats = async (req, res, next) => {
    try {
        const stats = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                _count: {
                    select: {
                        favorites: true,
                        matchesAsUser1: true,
                        matchesAsUser2: true,
                    },
                },
            },
        });

        if (!stats) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const totalMatches = 
            (stats._count.matchesAsUser1 || 0) + (stats._count.matchesAsUser2 || 0);

        res.json({
            userId: stats.id,
            username: stats.username,
            totalFavorites: stats._count.favorites || 0,
            totalMatches,
            totalMatchRequests: stats._count.matchesAsUser1 || 0,
            totalMatchResponses: stats._count.matchesAsUser2 || 0,
        });
    } catch (error) {
        next(error);
    }
};

export const searchUsers = async (req, res, next) => {
    try {
        const { q, username, limit = 10 } = req.query;
        const searchQuery = q || username;

        if (!searchQuery) {
            return res.status(400).json({ error: 'Parámetro de búsqueda requerido' });
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: searchQuery, mode: 'insensitive' } },
                    { email: { contains: searchQuery, mode: 'insensitive' } },
                    { firstName: { contains: searchQuery, mode: 'insensitive' } },
                    { lastName: { contains: searchQuery, mode: 'insensitive' } },
                ],
                NOT: { id: req.user.id },
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                profileImage: true,
                backgroundImage: true,
                createdAt: true,
                _count: {
                    select: {
                        favorites: true,
                    },
                },
            },
            take: parseInt(limit),
        });

        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const getPublicProfile = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                bio: true,
                profileImage: true,
                backgroundImage: true,
                favorites: {
                    include: {
                        movie: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};
export const deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'password es requerido' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        await prisma.user.delete({
            where: { id: req.user.id },
        });

        res.json({ message: 'Cuenta eliminada exitosamente' });
    } catch (error) {
        next(error);
    }
};
