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

router.post('/upload', upload.single('file'), uploadContent);
router.get('/', getContentList);
router.get('/:id', getContentById);
router.post('/:id/analyze', analyzeContent);

export default router;
