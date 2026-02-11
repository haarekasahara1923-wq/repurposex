import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createRepurposingJob, getJobStatus, createBulkRepurposingJobs } from '../controllers/repurpose.controller';

const router = Router();

// All repurpose routes require authentication
router.use(authenticate);

router.post('/', createRepurposingJob);
router.post('/bulk', createBulkRepurposingJobs);
router.get('/jobs/:id', getJobStatus);

export default router;
