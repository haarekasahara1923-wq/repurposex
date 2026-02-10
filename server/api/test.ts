import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
    try {
        return res.status(200).json({
            success: true,
            message: 'Vercel serverless function is working!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            hasDatabase: !!process.env.DATABASE_URL,
            hasRedis: !!process.env.REDIS_URL,
            hasOpenAI: !!process.env.OPENAI_API_KEY,
            hasJWT: !!process.env.JWT_SECRET
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
