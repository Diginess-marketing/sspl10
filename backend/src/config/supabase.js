import { createClient } from '@supabase/supabase-js';
import env from './env.js';
import logger from '../utils/logger.js';

if (!env.supabase.url || !env.supabase.key) {
  logger.error('Missing Supabase URL or key in environment variables.');
}

const supabase = createClient(env.supabase.url, env.supabase.key);

export default supabase;
