import logger from './logger.js';

const KEEP_ALIVE_MS = 20000;

/** registrationId -> Express response held open as an SSE stream. */
const clients = new Map();

/**
 * Turn a response into an SSE stream and register it under `registrationId`.
 * The stream is cleaned up when the client disconnects.
 */
export function subscribe(registrationId, req, res) {
  logger.info(`SSE connection opened for: ${registrationId}`);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.set(registrationId, res);

  const keepAlive = setInterval(() => res.write(':\n\n'), KEEP_ALIVE_MS);

  req.on('close', () => {
    logger.info(`SSE connection closed: ${registrationId}`);
    clearInterval(keepAlive);
    clients.delete(registrationId);
  });
}

/**
 * Push an event to a subscribed client. No-op when nobody is listening.
 */
export function notify(registrationId, data, event = 'payment_success') {
  const client = clients.get(registrationId);
  if (!client) {
    logger.info(`No active SSE client for ${registrationId}`);
    return false;
  }
  logger.info(`Notifying SSE client ${registrationId} (${event})`);
  client.write(`event: ${event}\n`);
  client.write(`data: ${JSON.stringify(data)}\n\n`);
  return true;
}
