const supabase = require('../config/supabase');

const TABLE = 'teams';

/** Record a captured team payment against the team row. */
async function markPaid(teamId, { paymentId, orderId }) {
  const { error } = await supabase
    .from(TABLE)
    .update({
      payment_status: 'captured',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
    })
    .eq('id', teamId);
  if (error) throw error;
}

module.exports = { TABLE, markPaid };
