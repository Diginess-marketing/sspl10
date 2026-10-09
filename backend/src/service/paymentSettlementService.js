import * as registrationModel from '../model/registrationModel.js';
import * as teamModel from '../model/teamModel.js';
import * as trialCandidateModel from '../model/trialCandidateModel.js';
import { sendConfirmationAsync } from './confirmationMailService.js';
import logger from '../utils/logger.js';

/* ------------------------------------------------------------------ *
 * Settlement — shared by the checkout callback and the webhook.
 * ------------------------------------------------------------------ */

/** Candidate creation is secondary: a failure here must never fail settlement. */
async function createCandidates(candidates) {
  try {
    await trialCandidateModel.upsertMany(candidates);
  } catch (err) {
    logger.error('Trial candidate creation failed (settlement kept):', err?.message || err);
  }
}

/**
 * Mark every registration in a team as paid and promote them to trial
 * candidates.
 *
 * @param {string} teamId
 * @param {{paymentId:string, orderId:string, amount?:number}} payment
 * @param {{skipIfSettled?:boolean}} [options] When set, do nothing if every
 *        player in the team is already marked paid (webhook replay guard).
 * @returns {Promise<boolean>} Whether anything was written.
 */
export async function settleTeam(teamId, payment, { skipIfSettled = false } = {}) {
  await teamModel.markPaid(teamId, payment);

  const players = await registrationModel.findByTeamId(teamId);
  if (players.length === 0) return false;

  if (skipIfSettled && players.every((player) => player.status === 'paid')) {
    return false;
  }

  await registrationModel.markTeamPaid(teamId, payment);
  await createCandidates(
    players.map((player) => trialCandidateModel.fromRegistration(player, payment.paymentId))
  );

  // Captain-only confirmation mail; fire-and-forget and idempotent.
  sendConfirmationAsync({ teamId }, payment);

  return true;
}

/**
 * Mark a single registration as paid and promote it to a trial candidate.
 *
 * @param {Object} registration
 * @param {{paymentId:string, orderId:string, amount?:number}} payment
 */
export async function settleIndividual(registration, payment) {
  await registrationModel.markPaid(registration.id, payment);
  await createCandidates([trialCandidateModel.fromRegistration(registration, payment.paymentId)]);
  sendConfirmationAsync({ registrationId: registration.id }, payment);
}

/**
 * Settle a captured Razorpay payment from its order notes (registration_id / team_id).
 * Used by the webhook and by reconciliation, so a payment whose checkout page was closed
 * still completes the registration. Does nothing if it is already settled.
 *
 * @param {{id:string, order_id:string, amount:number, status:string, notes?:Object}} payment Razorpay payment
 * @returns {Promise<string|null>} what was settled ("team <id>" / "registration <id>"), or null
 */
export async function settleCapturedPayment(payment) {
  if (payment.status !== 'captured') return null;
  const notes = payment.notes || {};
  const registrationId = notes.registrationId || notes.registration_id;
  let teamId = notes.team_id || notes.teamId;
  if (!teamId && registrationId) teamId = await registrationModel.findTeamId(registrationId);

  const settlement = { paymentId: payment.id, orderId: payment.order_id, amount: payment.amount / 100 };
  if (teamId) {
    return (await settleTeam(teamId, settlement, { skipIfSettled: true })) ? `team ${teamId}` : null;
  }
  if (registrationId) {
    const registration = await registrationModel.findById(registrationId);
    if (registration && registration.status !== 'paid') {
      await settleIndividual(registration, settlement);
      return `registration ${registrationId}`;
    }
  }
  return null;
}
