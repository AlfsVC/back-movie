import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/auth.routes.js';
import movieRoutes from './routes/movie.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import matchRoutes from './routes/match.routes.js';
import userRoutes from './routes/user.routes.js';
import watchedRoutes from './routes/watched.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import noteRoutes from './routes/note.routes.js';
import messageRoutes from './routes/message.routes.js';
import friendRoutes from './routes/friend.routes.js';
import { authMiddleware } from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Alias
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Ruta alternativa

// Ruta raíz con instrucciones
app.get('/api', (req, res) => {
    res.json({
        mensaje: '🎬 Bienvenido a Back-Movie API',
        documentacion: 'http://localhost:3000/api-docs',
        endpoints: {
            autenticacion: '/auth',
            peliculas: '/movies',
            favoritos: '/favorites',
            coincidencias: '/matches',
            usuarios: '/users',
            vistas: '/watched'
        },
        instrucciones: [
            '1. Accede a http://localhost:3000/api-docs para ver la documentación',
            '2. Registrate en POST /auth/register',
            '3. Inicia sesión en POST /auth/login',
            '4. Copia el token recibido',
            '5. Usa el botón "Authorize" en Swagger para agregar el token',
            '6. ¡Disfruta de la API!'
        ]
    });
});

// Public Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// Protected Routes
app.use(authMiddleware);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watched', watchedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error Handler Middleware (debe ser el último)
app.use(errorHandler);

export default app;
