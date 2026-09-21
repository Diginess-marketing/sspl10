const { createClient } = require('@supabase/supabase-js');
const env = require('./env');
const logger = require('../utils/logger');

if (!env.supabase.url || !env.supabase.key) {
  logger.error('Missing Supabase URL or key in environment variables.');
}

const supabase = createClient(env.supabase.url, env.supabase.key);

module.exports = supabase;
