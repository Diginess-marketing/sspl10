const paymentReminderJob = require('./paymentReminderJob');
const razorpaySyncJob = require('./razorpaySyncJob');

/** Start every scheduled job. Called once from server.js at boot. */
function startAll() {
  razorpaySyncJob.start();
  paymentReminderJob.start();
}

module.exports = { startAll, paymentReminderJob, razorpaySyncJob };
