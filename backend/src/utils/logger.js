/**
 * Thin console wrapper that prefixes every line with an ISO timestamp, so
 * production logs can be correlated with Razorpay / Supabase dashboards.
 */
const stamp = () => `[${new Date().toISOString()}]`;

export default {
  info: (...args) => console.log(stamp(), ...args),
  warn: (...args) => console.warn(stamp(), ...args),
  error: (...args) => console.error(stamp(), ...args),
};
