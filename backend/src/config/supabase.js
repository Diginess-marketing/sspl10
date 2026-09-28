import { createClient } from '@supabase/supabase-js';
import env from './env.js';
import logger from '../utils/logger.js';

let supabase;

if (!env.supabase.url || !env.supabase.key) {
  logger.error(
    '⚠️ Missing Supabase URL or key in environment variables. Database operations will fail until VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured.'
  );
  // Fallback dummy client so the server process does not crash on boot
  supabase = createClient(
    env.supabase.url || 'https://placeholder.supabase.co',
    env.supabase.key || 'placeholder-anon-key'
  );
} else {
  supabase = createClient(env.supabase.url, env.supabase.key);
}

export default supabase;
