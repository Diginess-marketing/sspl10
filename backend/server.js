import env from './src/config/env.js';
import app from './src/app.js';
import * as jobs from './src/jobs/index.js';
import logger from './src/utils/logger.js';

if (env.missingKeys.length > 0) {
  logger.warn(`Missing environment variables: ${env.missingKeys.join(', ')}`);
}

jobs.startAll();

app.listen(env.port, () => {
  logger.info(`🚀 API server running on port ${env.port} (${env.nodeEnv})`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});
