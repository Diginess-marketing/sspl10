import env from './env.js';

const baseAllowedOrigins = [
  'https://ssplt10.co.in',
  'https://www.ssplt10.co.in',
  'https://ssplt10.cloud',
  'https://www.ssplt10.cloud',
  'https://admin.ssplt10.co.in',
  'http://admin.ssplt10.co.in',
  'https://sspladmin.up.railway.app',
  'http://sspladmin.up.railway.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
];

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...baseAllowedOrigins, ...envAllowedOrigins])];

export const corsOptions = {
  origin(origin, callback) {
    // Requests with no origin (curl, mobile apps, file://) are allowed outside
    // of production only.
    if (!origin) {
      if (env.isProduction) {
        return callback(new Error('Not allowed by CORS'), false);
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview and production deployments (*.vercel.app)
    if (/^https:\/\/[a-zA-Z0-9-_.]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Any local dev server port (e.g. Vite on 127.0.0.1:5199), outside production only.
    if (!env.isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
};

export { allowedOrigins };
