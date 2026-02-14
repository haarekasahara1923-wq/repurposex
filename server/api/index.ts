console.log('[VERCEL ENTRY] Loading application...');

let app: any;
try {
    app = require('../src/index').default;
    console.log('[VERCEL ENTRY] Application loaded successfully');
} catch (err) {
    console.error('[VERCEL ENTRY] FATAL ERROR DURING LOAD:', err);
    throw err;
}

export default app;
