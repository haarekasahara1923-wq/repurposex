import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';
import {
    uploadContent,
    getContentList,
    getContentById,
    analyzeContent
} from '../controllers/content.controller';

const router = Router();

import { storage as cloudinaryStorage } from '../services/cloudinary.service';

const upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

// All content routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), uploadContent);
router.get('/', getContentList);
router.get('/:id', getContentById);
router.post('/:id/analyze', analyzeContent);

export default router;
