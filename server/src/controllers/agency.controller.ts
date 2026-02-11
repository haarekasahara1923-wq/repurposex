import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { emailService } from '../services/email.service';

/**
 * Invite a new client to the agency
 */
export const inviteAgencyClient = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
            });
        }

        const { email, clientName, organizationId } = req.body;

        if (!email || !organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Email and Organization ID are required'
            });
        }

        // Verify user is owner of the organization
        const org = await prisma.organization.findFirst({
            where: {
                id: organizationId,
                ownerId: req.user.id
            }
        });

        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You do not own this organization'
            });
        }

        // For MVP: We'll create a placeholder user or just send the invite
        // In a real flow, you might create an invitation record with a token
        const inviteUrl = `${process.env.FRONTEND_URL}/signup?invite=${organizationId}&email=${encodeURIComponent(email)}`;

        // Send Onboarding Email
        await emailService.sendAgencyInviteEmail(email, org.name, inviteUrl);

        res.json({
            success: true,
            message: `Invitation sent to ${email}`
        });
    } catch (error: any) {
        console.error('Agency invite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send invitation'
        });
    }
};
