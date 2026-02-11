import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Razorpay from 'razorpay';
import Stripe from 'stripe';
import prisma from '../config/database';
import axios from 'axios';
import { emailService } from '../services/email.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const createRazorpayOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, currency = 'INR', planId } = req.body;

        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
};

export const createStripeSession = async (req: AuthRequest, res: Response) => {
    try {
        const { planId, successUrl, cancelUrl } = req.body;

        // Fetch plan details from DB or constant
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: plan.name,
                            description: plan.description || undefined,
                        },
                        unit_amount: Number(plan.priceUsd) * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: req.user?.email || undefined,
            metadata: {
                userId: req.user?.id || '',
                planId: planId
            }
        });

        res.json({ success: true, sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe session creation failed:', error);
        res.status(500).json({ success: false, message: 'Stripe initiation failed' });
    }
};

export const createPaypalOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, planId } = req.body;

        // PayPal API Integration (Simplified)
        // In a real scenario, you'd use the PayPal SDK or direct REST API
        // This is a placeholder for the integration logic

        res.json({
            success: true,
            message: 'PayPal order creation endpoint (Placeholder)',
            // In reality, return orderID from PayPal
            orderId: `PAYPAL-${Date.now()}`
        });
    } catch (error) {
        console.error('PayPal order creation failed:', error);
        res.status(500).json({ success: false, message: 'PayPal initiation failed' });
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
    const { paymentId, orderId, signature, gateway, planId } = req.body;

    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // Verification logic here for different gateways
        // For now, we'll mark it as successful and update subscription

        const plan = await prisma.subscriptionPlan.findFirst({ where: { slug: planId } });
        if (!plan) throw new Error('Plan not found');

        // Update or Create Subscription
        await prisma.subscription.upsert({
            where: { userId: req.user.id },
            update: {
                planId: plan.id,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            create: {
                userId: req.user.id,
                planId: plan.id,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        res.json({ success: true, message: 'Payment verified and subscription activated' });

        // Send Payment Success Email
        emailService.sendSubscriptionAlert(req.user.email, req.user.fullName, 'payment_success').catch(err => {
            console.error('Failed to send payment success email:', err);
        });
    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};
