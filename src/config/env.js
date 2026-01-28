import dotenv from 'dotenv';

export const initializeEnv = () => {
    dotenv.config();

    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'TMDB_API_KEY',
        'NODE_ENV',
    ];

    const missingEnvVars = requiredEnvVars.filter(
        envVar => !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
        console.warn(
            `⚠️ Variables de entorno faltantes: ${missingEnvVars.join(', ')}`
        );
    }

    // Variables por defecto
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'development';
    }

    if (!process.env.PORT) {
        process.env.PORT = 3000;
    }

    console.log('✅ Variables de entorno inicializadas');
};

export const getEnv = (key, defaultValue = null) => {
    return process.env[key] || defaultValue;
};
