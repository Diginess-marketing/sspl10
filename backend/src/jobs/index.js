import * as paymentReminderJob from './paymentReminderJob.js';
import * as razorpaySyncJob from './razorpaySyncJob.js';
import * as dailySummaryJob from './dailySummaryJob.js';
import * as healthAlertJob from './healthAlertJob.js';

/** Start every scheduled job. Called once from server.js at boot. */
export function startAll() {
  razorpaySyncJob.start();
  paymentReminderJob.start();
  dailySummaryJob.start();
  healthAlertJob.start();
}

export { paymentReminderJob, razorpaySyncJob, dailySummaryJob, healthAlertJob };
