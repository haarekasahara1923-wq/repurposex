import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
    createRazorpayOrder,
    createStripeSession,
    createPaypalOrder,
    verifyPayment
} from '../controllers/payment.controller';

const router = Router();

router.use(authenticate);

router.post('/razorpay/create', createRazorpayOrder);
router.post('/stripe/create-session', createStripeSession);
router.post('/paypal/create', createPaypalOrder);
router.post('/verify', verifyPayment);

export default router;
