import { Request, Response } from 'express';
import prisma from '../src/config/database';

export default async function handler(req: Request, res: Response) {
    try {
        // Test database connection with a simple query
        let dbStatus = 'waiting';
        try {
            await prisma.$connect();
            dbStatus = 'connected';
            // Verify if User table exists
            const userCount = await prisma.user.count().catch(() => -1);
            dbStatus = userCount === -1 ? 'table_not_found' : `operational (users: ${userCount})`;
        } catch (dbErr: any) {
            dbStatus = `connection_failed: ${dbErr.message}`;
        }

        return res.status(200).json({
            success: true,
            message: 'Vercel serverless function is working!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            database: dbStatus,
            hasOpenAI: !!process.env.OPENAI_API_KEY,
            auth: {
                hasJWT: !!process.env.JWT_SECRET,
                jwtLength: process.env.JWT_SECRET?.length,
                jwtPrefix: process.env.JWT_SECRET?.substring(0, 4)
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
