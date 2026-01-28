import app from './app.js';
import { initializeEnv } from './config/env.js';

const startServer = async () => {
    try {
        // Inicializar variables de entorno
        initializeEnv();

        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || 'localhost';

        const server = app.listen(PORT, () => {
            console.clear();
            console.log('\n');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║     🎬 BACK-MOVIE SERVER - INICIADO CORRECTAMENTE      ║');
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('\n');
            console.log('📍 INFORMACIÓN DEL SERVIDOR:');
            console.log(`   🚀 Puerto:      ${PORT}`);
            console.log(`   🌍 Host:        ${HOST}`);
            console.log(`   📦 Ambiente:    ${process.env.NODE_ENV || 'development'}`);
            console.log('\n');
            console.log('📚 DOCUMENTACIÓN Y ENDPOINTS:');
            console.log(`   📖 Swagger UI:     http://${HOST}:${PORT}/api-docs`);
            console.log(`   📋 JSON Schema:    http://${HOST}:${PORT}/api-docs.json`);
            console.log('\n');
            console.log('🔗 URLs DE LA API:');
            console.log(`   🏠 Base API:       http://${HOST}:${PORT}/api`);
            console.log(`   🔐 Auth:           http://${HOST}:${PORT}/api/auth`);
            console.log(`   🎬 Movies:         http://${HOST}:${PORT}/api/movies`);
            console.log(`   ⭐ Favorites:      http://${HOST}:${PORT}/api/favorites`);
            console.log(`   💑 Matches:        http://${HOST}:${PORT}/api/matches`);
            console.log(`   👁️ Watched:        http://${HOST}:${PORT}/api/watched`);
            console.log(`   👤 Users:          http://${HOST}:${PORT}/api/users`);
            console.log('\n');
            console.log('💡 PRÓXIMOS PASOS:');
            console.log(`   1. Abre el Swagger en tu navegador:`);
            console.log(`      → http://${HOST}:${PORT}/api-docs`);
            console.log(`   2. Conéctate desde el frontend en:`);
            console.log(`      → http://localhost:5173`);
            console.log('\n');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('Presiona CTRL+C para detener el servidor\n');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n⚠️  SIGTERM recibido, cerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\n⚠️  SIGINT recibido, cerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
