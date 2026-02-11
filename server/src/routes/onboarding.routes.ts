import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { completeOnboarding } from '../controllers/onboarding.controller';

const router = Router();

// All onboarding routes require authentication
router.use(authenticate);

router.post('/complete', completeOnboarding);

export default router;
