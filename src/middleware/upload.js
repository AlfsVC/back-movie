import multer from 'multer';
import { storage } from '../config/cloudinary.js';

// Si no hay credenciales de Cloudinary configuradas, se podría hacer fallback a disco,
// pero para Render es mejor fallar o avisar que se necesita Cloudinary.
// Por simplicidad, asumiremos que se configurará Cloudinary.

const fileFilter = (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});
