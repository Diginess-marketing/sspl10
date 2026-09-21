const env = require('./src/config/env');
const app = require('./src/app');
const jobs = require('./src/jobs');
const logger = require('./src/utils/logger');

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
