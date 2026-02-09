import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// For MVP, we'll use hardcoded plans
const PLANS = [
    {
        id: 'creator',
        name: 'Creator',
        slug: 'creator',
        description: 'Perfect for individual creators',
        billingPeriod: 'monthly',
        priceInr: 999,
        priceUsd: 29,
        features: {
            uploads: 10,
            platforms: 5,
            credits: 500,
            teamMembers: 1,
            whiteLabel: false
        },
        limits: {
            maxUploadsPerMonth: 10,
            maxAiCredits: 500
        }
    },
    {
        id: 'pro',
        name: 'Pro',
        slug: 'pro',
        description: 'For serious creators & small teams',
        billingPeriod: 'monthly',
        priceInr: 2999,
        priceUsd: 99,
        features: {
            uploads: 50,
            platforms: 'all',
            credits: 2000,
            teamMembers: 3,
            whiteLabel: false
        },
        limits: {
            maxUploadsPerMonth: 50,
            maxAiCredits: 2000
        }
    },
    {
        id: 'agency',
        name: 'Agency',
        slug: 'agency',
        description: 'Scale your agency',
        billingPeriod: 'monthly',
        priceInr: 7999,
        priceUsd: 299,
        features: {
            uploads: 'unlimited',
            platforms: 'all',
            credits: 10000,
            teamMembers: 10,
            whiteLabel: true
        },
        limits: {
            maxUploadsPerMonth: 999999,
            maxAiCredits: 10000
        }
    }
];

export const getPlans = async (req: Request, res: Response) => {
    try {
        const { currency = 'INR' } = req.query;

        const plans = PLANS.map(plan => ({
            id: plan.id,
            name: plan.name,
            slug: plan.slug,
            description: plan.description,
            price: currency === 'USD' ? plan.priceUsd : plan.priceInr,
            currency: currency as string,
            billingPeriod: plan.billingPeriod,
            features: plan.features
        }));

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_FAILED', message: 'Failed to fetch plans' }
        });
    }
};

export const subscribe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { planSlug, paymentMethod = 'razorpay' } = req.body;

        // Find plan
        const plan = PLANS.find(p => p.slug === planSlug);
        if (!plan) {
            return res.status(400).json({
                success: false,
                error: { code: 'INVALID_PLAN', message: 'Invalid plan selected' }
            });
        }

        // For MVP: Create subscription without payment gateway integration
        // In production, you'd integrate with Razorpay/Stripe here

        // Check if user already has active subscription
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId: req.user.id,
                status: {
                    in: ['active', 'trial']
                }
            }
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                error: { code: 'SUBSCRIPTION_EXISTS', message: 'You already have an active subscription' }
            });
        }

        // Create subscription plan in DB if doesn't exist
        let dbPlan = await prisma.subscriptionPlan.findUnique({
            where: { slug: plan.slug }
        });

        if (!dbPlan) {
            dbPlan = await prisma.subscriptionPlan.create({
                data: {
                    name: plan.name,
                    slug: plan.slug,
                    description: plan.description || '',
                    billingPeriod: plan.billingPeriod,
                    priceInr: plan.priceInr,
                    priceUsd: plan.priceUsd,
                    features: plan.features,
                    limits: plan.limits
                }
            });
        }

        // Create subscription (start with trial)
        const subscription = await prisma.subscription.create({
            data: {
                userId: req.user.id,
                planId: dbPlan.id,
                status: 'trial',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
                trialStart: new Date(),
                trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
        });

        res.json({
            success: true,
            data: {
                subscriptionId: subscription.id,
                status: subscription.status,
                plan: {
                    name: dbPlan.name,
                    features: dbPlan.features
                },
                trialEnd: subscription.trialEnd,
                message: 'Subscription created! You have a 14-day free trial.'
            }
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SUBSCRIPTION_FAILED', message: 'Failed to create subscription' }
        });
    }
};
