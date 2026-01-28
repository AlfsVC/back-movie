import app from './app.js';
import { initializeEnv } from './config/env.js';

const startServer = async () => {
  try {
    // Inicializar variables de entorno
    initializeEnv();

    const PORT = process.env.PORT || 3000;
    const NODE_ENV = process.env.NODE_ENV || 'development';

    // 👉 Detectar si estamos en Render
    const IS_PROD = NODE_ENV === 'production';
    const HOST = IS_PROD
      ? 'back-movie-91yo.onrender.com'
      : 'localhost';

    const BASE_URL = IS_PROD
      ? `https://${HOST}`
      : `http://${HOST}:${PORT}`;

    const server = app.listen(PORT, () => {
      console.clear();
      console.log('\n');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║     🎬 BACK-MOVIE SERVER - INICIADO CORRECTAMENTE      ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('\n');
      console.log('📍 INFORMACIÓN DEL SERVIDOR:');
      console.log(`   🚀 Puerto:      ${PORT}`);
      console.log(`   🌍 Entorno:     ${NODE_ENV}`);
      console.log('\n');
      console.log('📚 DOCUMENTACIÓN Y ENDPOINTS:');
      console.log(`   📖 Swagger UI:     ${BASE_URL}/api-docs`);
      console.log(`   📋 JSON Schema:    ${BASE_URL}/api-docs.json`);
      console.log('\n');
      console.log('🔗 URLs DE LA API:');
      console.log(`   🏠 Base API:       ${BASE_URL}/api`);
      console.log(`   🔐 Auth:           ${BASE_URL}/api/auth`);
      console.log(`   🎬 Movies:         ${BASE_URL}/api/movies`);
      console.log(`   ⭐ Favorites:      ${BASE_URL}/api/favorites`);
      console.log(`   💑 Matches:        ${BASE_URL}/api/matches`);
      console.log(`   👁️ Watched:        ${BASE_URL}/api/watched`);
      console.log(`   👤 Users:          ${BASE_URL}/api/users`);
      console.log('\n');
      console.log('💡 PRÓXIMOS PASOS:');
      console.log(`   1. Abre el Swagger en tu navegador:`);
      console.log(`      → ${BASE_URL}/api-docs`);
      console.log('\n');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('Presiona CTRL+C para detener el servidor\n');
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\n⚠️  Señal recibida, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
