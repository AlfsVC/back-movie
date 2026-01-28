import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary con variables de entorno
// Estas deben ser proporcionadas por el usuario en su archivo .env o en el panel de Render
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Configuración de almacenamiento
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'movie-match/profiles', // Carpeta en Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Opcional: redimensionar para ahorrar ancho de banda
    },
});

export { cloudinary, storage };
