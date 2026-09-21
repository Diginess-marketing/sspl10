import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..', '..');

// `.env.production` is loaded first and wins, matching the previous server.cjs
// behaviour. `.env` is then loaded as a fallback for keys it does not define
// (dotenv never overwrites a variable that is already set).
dotenv.config({ path: path.join(rootDir, '.env.production') });
dotenv.config({ path: path.join(rootDir, '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 3003,
  rootDir,

  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    // Service role key bypasses RLS for backend administrative tasks.
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || process.env.VITE_RAZORPAY_WEBHOOK_SECRET,
  },

  msGraph: {
    tenantId: process.env.MSGRAPH_TENANT_ID,
    clientId: process.env.MSGRAPH_CLIENT_ID,
    clientSecret: process.env.MSGRAPH_CLIENT_SECRET,
    fromEmail: process.env.MSGRAPH_FROM_EMAIL,
  },

  sarvam: {
    apiKey: process.env.SARVAM_API_KEY,
    url: process.env.SARVAM_API_URL || 'https://api.sarvam.ai/v1/chat/completions',
    model: process.env.SARVAM_MODEL || 'sarvam-m',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },

  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
  },
};

/**
 * Warn once at boot about credentials that are missing, so a misconfigured
 * deploy is obvious in the logs instead of failing silently at request time.
 */
const requiredKeys = [
  ['VITE_SUPABASE_URL', env.supabase.url],
  ['SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_ANON_KEY', env.supabase.key],
  ['RAZORPAY_KEY_ID', env.razorpay.keyId],
  ['RAZORPAY_KEY_SECRET', env.razorpay.keySecret],
  ['RAZORPAY_WEBHOOK_SECRET', env.razorpay.webhookSecret],
  ['MSGRAPH_CLIENT_ID', env.msGraph.clientId],
  ['SARVAM_API_KEY', env.sarvam.apiKey],
];

env.missingKeys = requiredKeys.filter(([, value]) => !value).map(([name]) => name);

export default env;
