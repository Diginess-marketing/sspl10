/**
 * Map a Razorpay payment entity onto the `razorpay_ledger` table schema.
 * Razorpay returns amounts in paise and timestamps in seconds.
 *
 * Shared by the webhook handler, the reconciliation service and the sync job
 * so all three write identically shaped rows.
 *
 * @param {Object} payment Razorpay payment entity.
 * @param {Object} [rawPayload] Payload to store verbatim; defaults to `payment`.
 */
export function mapPaymentToLedger(payment, rawPayload = payment) {
  return {
    payment_id: payment.id,
    order_id: payment.order_id,
    amount: payment.amount ? payment.amount / 100 : 0,
    currency: payment.currency,
    status: payment.status,
    method: payment.method,
    email: payment.email,
    contact: payment.contact,
    fee: payment.fee ? payment.fee / 100 : null,
    tax: payment.tax ? payment.tax / 100 : null,
    created_at: new Date(payment.created_at * 1000).toISOString(),
    // Razorpay omits captured_at in list responses, so fall back to created_at.
    captured_at: payment.captured ? new Date(payment.created_at * 1000).toISOString() : null,
    raw_payload: rawPayload,
    last_synced_at: new Date().toISOString(),
  };
}
