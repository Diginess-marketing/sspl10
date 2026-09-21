const supabase = require('../config/supabase');
const logger = require('../utils/logger');

const TABLE = 'chat_logs';

/**
 * Append a chat turn. Logging must never break a live conversation, so a
 * failure here is reported and swallowed rather than thrown.
 *
 * @param {{role:'user'|'assistant', message:string,
 *          platform:'web'|'whatsapp', mobileNumber?:string, metadata?:Object}} entry
 */
async function insert({ role, message, platform, mobileNumber, metadata = {} }) {
  try {
    await supabase.from(TABLE).insert({
      role,
      message,
      platform,
      mobile_number: mobileNumber,
      metadata,
    });
  } catch (err) {
    logger.error('Failed to log chat message:', err);
  }
}

module.exports = { TABLE, insert };
