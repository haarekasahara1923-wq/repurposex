import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getPlans, subscribe } from '../controllers/subscription.controller';

const router = Router();

// Get plans - public
router.get('/plans', getPlans);

// Subscribe - requires authentication
router.post('/subscribe', authenticate, subscribe);

export default router;
