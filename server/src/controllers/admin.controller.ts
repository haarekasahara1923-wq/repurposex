
import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// ========================================
// ADMIN CONTROLLERS
// ========================================

// Get all users with subscription details
export const listUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                lastLoginAt: true,
                organizations: {
                    select: {
                        organization: {
                            select: { name: true, type: true }
                        }
                    }
                },
                subscriptions: {
                    where: { status: 'active' },
                    take: 1,
                    select: {
                        status: true,
                        plan: {
                            select: { name: true, priceInr: true }
                        },
                        currentPeriodEnd: true
                    }
                }
            }
        });

        // Format data for table
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role, // 'admin', 'agency', 'client'
            businessName: user.organizations[0]?.organization.name || 'N/A',
            plan: user.subscriptions[0]?.plan.name || 'Free',
            status: user.status,
            joinedAt: user.createdAt,
            lastLogin: user.lastLoginAt
        }));

        res.json({
            success: true,
            data: formattedUsers
        });
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch users' }
        });
    }
};

// Toggle User Status (Block/Unblock)
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // 'active' | 'suspended'

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid status' }
            });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { status }
        });

        res.json({
            success: true,
            message: `User ${status === 'active' ? 'unblocked' : 'blocked'} successfully`,
            user: { id: user.id, status: user.status }
        });
    } catch (error) {
        console.error('Toggle status error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to update user status' }
        });
    }
};

// Grant Access (Mark Paid / Override Plan)
export const grantAccess = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { planId, durationDays = 30 } = req.body;

        // 1. Find a plan (default to Pro Monthly if not specified, but usually we should specify)
        // For simplicity, let's assume we look up the 'pro-monthly' plan if planId not provided
        let plan;
        if (planId) {
            plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        } else {
            // Fallback: find any paid plan or create a dummy logic
            plan = await prisma.subscriptionPlan.findFirst({
                where: { priceInr: { gt: 0 } }
            });
        }

        if (!plan) {
            return res.status(404).json({
                success: false,
                error: { message: 'Subscription plan not found to grant access' }
            });
        }

        // 2. Check existing subscription
        const existingSub = await prisma.subscription.findUnique({
            where: { userId } // One active sub per user constraint we added earlier
        });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + durationDays);

        let subscription;
        if (existingSub) {
            subscription = await prisma.subscription.update({
                where: { id: existingSub.id },
                data: {
                    status: 'active',
                    planId: plan.id,
                    currentPeriodStart: startDate,
                    currentPeriodEnd: endDate,
                    cancelAtPeriodEnd: false
                }
            });
        } else {
            subscription = await prisma.subscription.create({
                data: {
                    userId,
                    planId: plan.id,
                    status: 'active',
                    currentPeriodStart: startDate,
                    currentPeriodEnd: endDate
                }
            });
        }

        // 3. Log a "manual" payment for record keeping
        await prisma.payment.create({
            data: {
                userId,
                subscriptionId: subscription.id,
                amount: 0, // Admin override
                currency: 'INR',
                status: 'success',
                paymentGateway: 'manual_admin_override',
                gatewayPaymentId: `admin_override_${Date.now()}`,
                paidAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'Access granted successfully',
            subscription
        });

    } catch (error) {
        console.error('Grant access error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to grant access' }
        });
    }
};
