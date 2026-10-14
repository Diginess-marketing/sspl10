import * as reportService from '../../service/reportService.js';
import { sendDailySummary } from '../../jobs/dailySummaryJob.js';

/** GET /api/admin/reports/daily-summary?daysAgo=1 */
export const dailySummary = async (req, res) => {
  const daysAgo = Math.min(60, Math.max(0, Number(req.query.daysAgo ?? 1) || 0));
  res.json(await reportService.dailySummary(daysAgo));
};

/** POST /api/admin/reports/daily-summary/send — email yesterday's summary now. */
export const sendSummaryNow = async (req, res) => {
  res.json({ sent: Boolean(process.env.DAILY_SUMMARY_TO), summary: await sendDailySummary() });
};

/** GET /api/admin/reports/data-quality */
export const dataQuality = async (req, res) => {
  res.json(await reportService.dataQuality());
};
