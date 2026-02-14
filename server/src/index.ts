import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import path from 'path';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import contentRoutes from './routes/content.routes';
import repurposeRoutes from './routes/repurpose.routes';
import subscriptionRoutes from './routes/subscription.routes';
import onboardingRoutes from './routes/onboarding.routes';
import paymentRoutes from './routes/payment.routes';
import agencyRoutes from './routes/agency.routes';
import adminRoutes from './routes/admin.routes';

const app: Application = express();
const PORT = process.env.API_PORT || 5000;

// Required for Vercel
app.set('trust proxy', 1);

// ========================================
// MIDDLEWARE
// ========================================

// Security - Relaxed for media playback
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Custom CORS & Logging Middleware for absolute reliability
app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    // Reflect origin or use wildcard for debugging (Vercel prefers reflection)
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Log for Vercel debugging
    console.log(`[SERVER] ${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${origin}`);

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

// app.use(cors({ ... })); // Replaced by manual middleware for better Vercel compatibility

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        process.stdout.write('Body: ' + JSON.stringify(req.body, null, 2) + '\n');
    }
    res.on('finish', () => {
        console.log(`Response: ${res.statusCode}`);
    });
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    // Trust proxy for Vercel
    validate: { trustProxy: false },
    message: 'Too many requests from this IP, please try again later.'
});
// app.use(limiter); // Disabled temporarily to prevent test users from being blocked

// ========================================
// ROUTES
// ========================================

import prisma from './config/database';

// Health check
app.get('/ping', (req, res) => res.json({ status: 'pong' }));

app.get('/health', async (req: Request, res: Response) => {
    try {
        // Check DB connection and table existence
        await prisma.$queryRaw`SELECT 1`;
        const userCount = await prisma.user.count(); // This will fail if tables don't exist

        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: 'connected',
            schema: 'verified',
            userCount,
            env_check: {
                JWT_SECRET: !!process.env.JWT_SECRET,
                DATABASE_URL: !!process.env.DATABASE_URL,
                RESEND_API_KEY: !!process.env.RESEND_API_KEY
            }
        });
    } catch (error: any) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: 'disconnected',
            error: error.message
        });
    }
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/content', contentRoutes);
app.use('/api/v1/repurpose', repurposeRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/agency', agencyRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route not found: ${req.method} ${req.url}`
        }
    });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'An internal server error occurred',
            stack: err.stack // Exposed for debugging
        }
    });
});

// ========================================
// SERVER START
// ========================================

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`
  ╔═══════════════════════════════════════╗
  ║   RepurposeX API Server Started       ║
  ╠═══════════════════════════════════════╣
  ║   Environment: ${process.env.NODE_ENV || 'development'.padEnd(20)}║
  ║   Port: ${PORT.toString().padEnd(31)}║
  ║   URL: http://localhost:${PORT.toString().padEnd(18)}║
  ╚═══════════════════════════════════════╝
  `);
    });
}

// Export for Vercel serverless
export default app;

