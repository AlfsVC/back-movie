import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName, invitationCode } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'El usuario o email ya existe'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Generar código de invitación único
        const newInvitationCode = randomBytes(8).toString('hex').toUpperCase();

        const user = await prisma.user.create({
            data: {
                username,
                email,
                firstName,
                lastName,
                passwordHash,
                invitationCode: newInvitationCode,
            },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                invitationCode: true,
                createdAt: true,
            },
        });

        // Si vino con código de invitación, crear match automático
        if (invitationCode) {
            const inviterUser = await prisma.user.findFirst({
                where: { invitationCode },
            });

            if (inviterUser && inviterUser.id !== user.id) {
                await prisma.match.create({
                    data: {
                        userId1: inviterUser.id,
                        userId2: user.id,
                        status: 'accepted', // Match automático aceptado
                    },
                });
            }
        }

        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user,
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = generateToken(user.id);

        res.json({
            message: 'Login exitoso',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                profileImage: user.profileImage,
                backgroundImage: user.backgroundImage,
                bio: user.bio,
            },
            token,
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res) => {
    res.json(req.user);
};

export const getInvitationCode = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { invitationCode: true },
        });

        if (!user || !user.invitationCode) {
            return res.status(404).json({ error: 'Código de invitación no encontrado' });
        }

        res.json({ invitationCode: user.invitationCode });
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo código de invitación' });
    }
};

export const validateInvitationCode = async (req, res) => {
    try {
        const { invitationCode } = req.body;

        if (!invitationCode) {
            return res.status(400).json({ error: 'Código de invitación requerido' });
        }

        const user = await prisma.user.findFirst({
            where: { invitationCode },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                invitationCode: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'Código de invitación no válido' });
        }

        res.json({
            message: 'Código válido',
            user,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error validando código' });
    }
};
