import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { inviteAgencyClient } from '../controllers/agency.controller';

const router = Router();

router.use(authenticate);

router.post('/invite-client', inviteAgencyClient);

export default router;
