import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const completeOnboarding = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const {
            businessName,
            businessType,
            industry,
            niche,
            subNiches,
            targetAudience,
            platforms,
            primaryPlatform,
            tonePreset,
            customGuidelines
        } = req.body;

        const userId = req.user.id;

        // 1. Create Organization
        const organization = await prisma.organization.create({
            data: {
                name: businessName || `${req.user.fullName}'s Org`,
                slug: (businessName || `${req.user.fullName}-org`).toLowerCase().replace(/\s+/g, '-'),
                ownerId: userId,
                type: businessType || 'individual',
                industry: industry,
                settings: {
                    niche,
                    subNiches,
                    platforms,
                    primaryPlatform
                }
            }
        });

        // 2. Add user as owner in OrganizationMember
        await prisma.organizationMember.create({
            data: {
                organizationId: organization.id,
                userId: userId,
                role: 'owner',
                status: 'active',
                joinedAt: new Date()
            }
        });

        // 3. Create Brand Profile
        const brandProfile = await prisma.brandProfile.create({
            data: {
                userId: userId,
                organizationId: organization.id,
                name: businessName || 'Default Brand',
                industry: industry,
                targetAudience: JSON.stringify(targetAudience),
                preferredPlatforms: platforms || [],
                tonePreset: tonePreset || 'professional',
                customGuidelines: customGuidelines
            }
        });

        // 4. Update user status to active (if not already)
        await prisma.user.update({
            where: { id: userId },
            data: { status: 'active' }
        });

        res.status(201).json({
            success: true,
            message: 'Onboarding completed successfully',
            data: {
                organizationId: organization.id,
                brandProfileId: brandProfile.id
            }
        });
    } catch (error: any) {
        console.error('Onboarding completion error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to complete onboarding',
            error: { code: 'ONBOARDING_FAILED', details: error.toString() }
        });
    }
};
