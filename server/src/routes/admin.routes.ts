
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Protect all admin routes
router.use(authenticate);
// Ensure role is 'admin' for critical actions
const ensureAdmin = authorize(['admin']);

router.get('/users', ensureAdmin, adminController.listUsers);
router.patch('/users/:userId/status', ensureAdmin, adminController.toggleUserStatus);
router.post('/users/:userId/grant-access', ensureAdmin, adminController.grantAccess);

export default router;
