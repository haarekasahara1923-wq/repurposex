import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfile);

export default router;
