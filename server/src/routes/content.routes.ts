import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    uploadContent,
    getContentList,
    getContentById,
    analyzeContent
} from '../controllers/content.controller';

const router = Router();

import { storage as cloudinaryStorage, isCloudinaryConfigured } from '../services/cloudinary.service';

// Local storage configuration (fallback)
const localStorageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// Use Cloudinary if configured, otherwise use local storage
const storageEngine = isCloudinaryConfigured ? cloudinaryStorage : localStorageConfig;

if (!isCloudinaryConfigured) {
    console.warn('⚠️ Using local file storage. For production, please configure Cloudinary.');
}

const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
    fileFilter: (req, file, cb) => {
        // Accept all file types for now
        const allowedMimes = [
            'video/',
            'audio/',
            'image/',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        const isAllowed = allowedMimes.some(mime => file.mimetype.startsWith(mime) || file.mimetype === mime);

        if (isAllowed) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} is not supported. Please upload video, audio, document, or image files.`));
        }
    }
});

// All content routes require authentication
router.use(authenticate);

// Multer error handling middleware
const handleMulterError = (err: any, req: any, res: any, next: any) => {
    console.error('Multer error:', err);

    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: 'File size exceeds the maximum limit of 2GB'
                }
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'UNEXPECTED_FIELD',
                    message: 'Unexpected file field. Please use "file" as the field name.'
                }
            });
        }
        return res.status(400).json({
            success: false,
            error: {
                code: 'UPLOAD_ERROR',
                message: err.message || 'File upload failed'
            }
        });
    }

    if (err.message && err.message.includes('File type')) {
        // File type validation error
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_FILE_TYPE',
                message: err.message
            }
        });
    }

    if (err.message && err.message.includes('Cloudinary')) {
        // Cloudinary configuration error
        return res.status(500).json({
            success: false,
            error: {
                code: 'SERVICE_ERROR',
                message: 'File upload service error. Please try again or contact support.'
            }
        });
    }

    // Pass to next error handler
    next(err);
};

router.post('/upload', upload.single('file'), handleMulterError, uploadContent);
router.get('/', getContentList);
router.get('/:id', getContentById);
router.post('/:id/analyze', analyzeContent);

export default router;
