# Back Movie - API de Matching de Películas 🎬

API REST backend para una aplicación de matching de películas (como Tinder para películas).

## Características

- 🔐 Autenticación con JWT
- 🎬 Integración con TMDB API para películas
- 💑 Sistema de matching entre usuarios
- ⭐ Gestión de películas favoritas
- 👀 Seguimiento de películas vistas en parejas
- 📊 Estadísticas de visualización
- 🔔 Sistema de notificaciones

## Tecnologías

- **Node.js** con Express
- **Prisma ORM** para base de datos
- **PostgreSQL** para almacenamiento
- **JWT** para autenticación
- **Axios** para llamadas a TMDB API
- **bcryptjs** para hash de contraseñas

## Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd back-movie
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:
- `DATABASE_URL` - URL de conexión a PostgreSQL
- `JWT_SECRET` - Clave secreta para JWT
- `TMDB_API_KEY` - API key de TMDB (obtén en https://www.themoviedb.org/settings/api)
- `NODE_ENV` - Ambiente (development/production)
- `PORT` - Puerto del servidor (default: 3000)

### 4. Configurar base de datos
```bash
# Generar cliente de Prisma
npm run prisma:generate

# Crear migraciones
npm run prisma:migrate

# (Opcional) Ver base de datos en Prisma Studio
npm run prisma:studio
```

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

## Documentación de API (Swagger)

Accede a la documentación interactiva de Swagger en:
```
http://localhost:3000/api/docs
```

Allí puedes:
- Ver todos los endpoints disponibles
- Ver los parámetros requeridos
- Ver ejemplos de request/response
- Probar los endpoints directamente

## Estructura de Carpetas

```
src/
├── app.js                 # Configuración de Express
├── server.js              # Punto de entrada
├── config/                # Configuraciones
│   ├── database.js        # Cliente de Prisma
│   └── env.js             # Variables de entorno
├── controllers/           # Lógica de controladores
├── routes/                # Rutas de la API
├── middleware/            # Middlewares
├── services/              # Servicios (TMDB, notificaciones, estadísticas)
└── utils/                 # Utilidades (JWT)
```

## Endpoints principales

### Autenticación (sin protección)
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Películas (sin protección)
- `GET /api/movies/search` - Buscar películas
- `GET /api/movies/popular` - Películas populares
- `GET /api/movies/upcoming` - Películas próximas
- `GET /api/movies/genres` - Obtener géneros
- `GET /api/movies/:movieId` - Detalles de película

### Favoritos (protegido)
- `GET /api/favorites` - Obtener favoritos
- `POST /api/favorites` - Agregar favorito
- `DELETE /api/favorites/:movieId` - Eliminar favorito
- `GET /api/favorites/check/:movieId` - Verificar si es favorito

### Matches (protegido)
- `GET /api/matches` - Obtener matches del usuario
- `POST /api/matches` - Crear nueva solicitud de match
- `PUT /api/matches/:id/accept` - Aceptar match
- `PUT /api/matches/:id/reject` - Rechazar match
- `GET /api/matches/:id/common-movies` - Películas en común

### Películas Vistas (protegido)
- `GET /api/watched` - Obtener películas vistas
- `POST /api/watched` - Marcar película como vista
- `PUT /api/watched/:id` - Actualizar calificación
- `DELETE /api/watched/:id` - Desmarcar como vista
- `GET /api/watched/match/:matchId/stats` - Estadísticas del match

### Usuario (protegido)
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `POST /api/users/change-password` - Cambiar contraseña
- `GET /api/users/stats` - Obtener estadísticas
- `GET /api/users/search` - Buscar usuarios
- `DELETE /api/users/account` - Eliminar cuenta

## Modelo de Datos

### Usuario
- Identificación única
- Username y email únicos
- Contraseña hasheada
- Relaciones con favoritos, matches y notificaciones

### Película
- ID de TMDB
- Información: título, descripción, carátula, fecha de lanzamiento
- Rating y géneros
- Duración

### Match
- Entre dos usuarios
- Estados: PENDING, ACCEPTED, REJECTED
- Película vistas en conjunto
- Notas y comentarios

### Película Vista
- Asociada a un match
- Películas vistas por la pareja
- Rating individual
- Fecha de visualización

## Autenticación

La API utiliza JWT para autenticación. Incluye el token en el header:

```
Authorization: Bearer <tu_token_jwt>
```

## Error Handling

Los errores se devuelven en formato JSON:

```json
{
  "error": "Mensaje de error",
  "details": "Información adicional (si aplica)"
}
```

Códigos de error comunes:
- `400` - Bad Request (parámetros inválidos)
- `401` - Unauthorized (falta autenticación)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no encontrado)
- `409` - Conflict (el recurso ya existe)
- `500` - Internal Server Error

## Consideraciones de Seguridad

- Las contraseñas se hashean con bcryptjs
- Los tokens JWT expiran en 7 días
- Las contraseñas nunca se devuelven en respuestas
- Validación de entrada en todos los endpoints
- CORS configurado para origen específico

## Desarrollo

### Agregar una nueva ruta
1. Crear el controlador en `controllers/`
2. Crear las rutas en `routes/`
3. Importar en `app.js`

### Agregar modelo en Prisma
1. Actualizar `prisma/schema.prisma`
2. Ejecutar `npm run prisma:migrate`

## Licencia

ISC

## Autor

Alfonso
