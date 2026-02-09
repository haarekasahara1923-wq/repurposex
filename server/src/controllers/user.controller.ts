import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                phone: true,
                countryCode: true,
                timezone: true,
                language: true,
                emailVerified: true,
                createdAt: true
            }
        });

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'FETCH_FAILED', message: 'Failed to fetch profile' }
        });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { fullName, timezone, language } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(fullName && { fullName }),
                ...(timezone && { timezone }),
                ...(language && { language })
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                timezone: true,
                language: true
            }
        });

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'UPDATE_FAILED', message: 'Failed to update profile' }
        });
    }
};
