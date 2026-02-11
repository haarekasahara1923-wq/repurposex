import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'RepurposeX <notifications@repurposex.com>'; // Update with your verified domain

export const emailService = {
    /**
     * Welcome Email for New Signups
     */
    sendWelcomeEmail: async (to: string, name: string) => {
        return resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: 'Welcome to RepurposeX - Your Content Agency in a Box',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
                    <h1 style="color: #7c3aed;">Welcome aboard, ${name}! 🚀</h1>
                    <p>We're thrilled to have you here. RepurposeX is designed to help you transform your content into a multi-platform machine.</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Next Steps:</h3>
                        <ul>
                            <li>Complete your <strong>Brand Voice</strong> setup</li>
                            <li>Upload your first long-form video</li>
                            <li>Let our AI extract viral clips for you</li>
                        </ul>
                    </div>
                    <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
                </div>
            `
        });
    },

    /**
     * Job Completion Alert
     */
    sendJobCompletionEmail: async (to: string, name: string, jobType: string) => {
        return resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: 'Magic is Done! Your content is ready',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
                    <h2 style="color: #db2777;">Your ${jobType} is Ready! ✨</h2>
                    <p>Hey ${name}, our AI has finished repurposing your content. It looks amazing!</p>
                    <p>You can now review, edit, and schedule it for your social platforms.</p>
                    <a href="${process.env.FRONTEND_URL}/content" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Library</a>
                </div>
            `
        });
    },

    /**
     * Agency Client Invite
     */
    sendAgencyInviteEmail: async (to: string, agencyName: string, inviteUrl: string) => {
        return resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: `Invitation: Join ${agencyName} on RepurposeX`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px;">
                    <h2 style="color: #1e293b;">You've been invited!</h2>
                    <p><strong>${agencyName}</strong> has invited you to manage your content through their white-label portal on RepurposeX.</p>
                    <p>Click the button below to set up your account and access your dashboard.</p>
                    <a href="${inviteUrl}" style="background: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; margin: 20px 0;">Accept Invitation</a>
                    <p style="color: #64748b; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
                </div>
            `
        });
    },

    /**
     * Weekly ROI Report
     */
    sendWeeklyROIReport: async (to: string, name: string, stats: { multiplier: string, value: string }) => {
        return resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: 'Your Weekly Content ROI Report 📈',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1e293b;">Weekly Performance Snapshot</h2>
                    <p>Hey ${name}, here is how your content performed this week with RepurposeX.</p>
                    <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin: 30px 0;">
                        <div style="background: #faf5ff; padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="color: #7c3aed; font-size: 24px; font-bold: bold;">${stats.multiplier}x</div>
                            <div style="color: #6b21a8; font-size: 14px;">ROI Multiplier</div>
                        </div>
                        <div style="background: #fdf2f8; padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="color: #db2777; font-size: 24px; font-bold: bold;">${stats.value}</div>
                            <div style="color: #9d174d; font-size: 14px;">Est. Value Created</div>
                        </div>
                    </div>
                    <p>Keep up the consistency! You're saving roughly 15 hours of work every week.</p>
                    <a href="${process.env.FRONTEND_URL}/analytics" style="color: #7c3aed; font-weight: bold; text-decoration: none;">View Full Analytics &rarr;</a>
                </div>
            `
        });
    },

    /**
     * Subscription / Billing Alerts
     */
    sendSubscriptionAlert: async (to: string, name: string, type: 'trial_ending' | 'payment_success') => {
        const isSuccess = type === 'payment_success';
        return resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: isSuccess ? 'Payment Successful - Receipt' : 'Action Required: Your Free Trial is Ending',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 12px;">
                    <h2 style="color: #1e293b;">${isSuccess ? 'Thank you for your payment!' : 'Your trial ends in 48 hours'}</h2>
                    <p>Hi ${name},</p>
                    <p>${isSuccess
                    ? 'Your subscription plan has been successfully updated. You can now access all your premium features.'
                    : 'We hope you are enjoying RepurposeX! Your 14-day free trial is about to expire. Upgrade now to keep your content workflows running.'
                }</p>
                    <a href="${process.env.FRONTEND_URL}/settings" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px 0;">
                        ${isSuccess ? 'Manage Subscription' : 'Upgrade Plan'}
                    </a>
                </div>
            `
        });
    }
};
