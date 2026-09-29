// Single source for the backend (Render) address. Set VITE_API_URL in .env.production / .env.local
// or the Vercel dashboard, e.g. https://sspl-backend.onrender.com — with or without a trailing /api.
// Never hardcode backend URLs in components: a different origin breaks CORS on Vercel.

const DEV_FALLBACK = 'http://localhost:3003';

const configured = (import.meta.env.VITE_API_URL || '').trim();

if (!configured && import.meta.env.PROD) {
  console.error('[api] VITE_API_URL is not set; backend requests (payments, rewards, admin) will fail.');
}

/** Backend origin without /api, e.g. https://sspl-backend.onrender.com */
export const API_ORIGIN = (configured || (import.meta.env.DEV ? DEV_FALLBACK : ''))
  .replace(/\/+$/, '')
  .replace(/\/api$/, '');

/** Base for API routes, e.g. https://sspl-backend.onrender.com/api */
export const API_BASE_URL = `${API_ORIGIN}/api`;
