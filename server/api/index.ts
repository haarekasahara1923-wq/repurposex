import app from '../src/index';
// Export the Express app directly as a Vercel serverless function
// This is the most reliable way for Vercel to handle Express apps
console.log('Serverless function invoked');
export default app;
