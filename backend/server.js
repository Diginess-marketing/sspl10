import env from './src/config/env.js';
import app from './src/app.js';
import * as jobs from './src/jobs/index.js';
import logger from './src/utils/logger.js';

if (env.missingKeys.length > 0) {
  logger.warn(`Missing environment variables: ${env.missingKeys.join(', ')}`);
}

// Local dev points at the live database, where these jobs would email real registrants.
if (process.env.DISABLE_JOBS === 'true') {
  logger.warn('Background jobs disabled (DISABLE_JOBS=true)');
} else {
  jobs.startAll();
}

const HOST = '0.0.0.0';
const server = app.listen(env.port, HOST, () => {
  logger.info(`🚀 API server running on http://${HOST}:${env.port} (${env.nodeEnv})`);
});

server.on('error', (err) => {
  logger.error('Failed to bind server port:', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});
