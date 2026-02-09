import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createRepurposingJob, getJobStatus } from '../controllers/repurpose.controller';

const router = Router();

// All repurpose routes require authentication
router.use(authenticate);

router.post('/', createRepurposingJob);
router.get('/jobs/:id', getJobStatus);

export default router;
