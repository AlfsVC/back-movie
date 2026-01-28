import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Back Movie API',
            version: '1.0.0',
            description: 'API REST para aplicación de matching de películas',
            contact: {
                name: 'Alfonso',
                url: 'https://github.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Servidor de desarrollo',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);
