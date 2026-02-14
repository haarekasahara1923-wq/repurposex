import app from '../src/index';

// Export the Express app directly as a Vercel serverless function
console.log('[VERCEL ENTRY] Serverless function invoked at:', new Date().toISOString());

export default app;
