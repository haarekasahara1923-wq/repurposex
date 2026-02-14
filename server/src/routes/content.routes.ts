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

// Configure multer to use /tmp on Vercel (read-only filesystem fix)
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : 'uploads/';

// Ensure directory exists (only if not on Vercel, as /tmp is managed by the OS)
if (!process.env.VERCEL) {
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
}

const upload = multer({
    dest: uploadDir,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

// All content routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), uploadContent);
router.get('/', getContentList);
router.get('/:id', getContentById);
router.post('/:id/analyze', analyzeContent);

export default router;
