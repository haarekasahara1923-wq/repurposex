import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import contentRoutes from './routes/content.routes';
import repurposeRoutes from './routes/repurpose.routes';
import subscriptionRoutes from './routes/subscription.routes';
import onboardingRoutes from './routes/onboarding.routes';
import paymentRoutes from './routes/payment.routes';
import agencyRoutes from './routes/agency.routes';

const app: Application = express();
const PORT = process.env.API_PORT || 5000;

// Required for Vercel
app.set('trust proxy', 1);

// ========================================
// MIDDLEWARE
// ========================================

// Security
app.use(helmet());

// CORS
app.use(cors({
    origin: '*', // Allow all origins for debugging
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    // Trust proxy for Vercel
    validate: { trustProxy: false },
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter); // Apply globally instead of limiting to /api/ path which might mismatch on Vercel rewrites

// ========================================
// ROUTES
// ========================================

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
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

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
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
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
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

