import * as paymentReminderJob from './paymentReminderJob.js';
import * as razorpaySyncJob from './razorpaySyncJob.js';

/** Start every scheduled job. Called once from server.js at boot. */
export function startAll() {
  razorpaySyncJob.start();
  paymentReminderJob.start();
}

export { paymentReminderJob, razorpaySyncJob };
