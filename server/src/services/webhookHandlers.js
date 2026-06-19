const supabase = require('../lib/supabase')

async function onPaymentSucceeded(paymentIntent) {
  const { id: payment_intent_id, amount, metadata } = paymentIntent
  const { course_id, student_id, instructor_id, coupon_id } = metadata || {}

  // Create enrollment
  await supabase.from('enrollments').upsert(
    { student_id, course_id, payment_id: payment_intent_id, status: 'active' },
    { onConflict: 'student_id,course_id' }
  )

  const gross = amount / 100
  const platform_fee = +(gross * 0.12).toFixed(2)
  const instructor_share = +(gross * 0.88).toFixed(2)

  // Record platform fee
  const { data: fee } = await supabase.from('platform_fees').insert({
    payment_id: payment_intent_id,
    course_id,
    student_id,
    instructor_id,
    gross,
    platform_fee,
    instructor_share,
    status: 'pending_transfer',
  }).select().single()

  // Mark coupon used
  if (coupon_id) {
    await supabase.from('coupon_uses').insert({ coupon_id, student_id, payment_id: payment_intent_id })
  }

  console.log('payment_intent.succeeded processed', { payment_intent_id, fee: fee?.id })
}

async function onPaymentFailed(paymentIntent) {
  console.log('payment_intent.payment_failed', paymentIntent.id)
}

async function onChargeRefunded(charge) {
  const { payment_intent: payment_intent_id } = charge

  // Revoke enrollment
  await supabase.from('enrollments').update({ status: 'refunded' }).eq('payment_id', payment_intent_id)

  // Update fee status
  await supabase.from('platform_fees').update({ status: 'refunded' }).eq('payment_id', payment_intent_id)

  // Mark transfer reversed
  await supabase.from('instructor_transfers').update({ status: 'reversed' }).eq('payment_id', payment_intent_id)

  console.log('charge.refunded processed', payment_intent_id)
}

async function onTransferPaid(transfer) {
  await supabase.from('instructor_transfers')
    .update({ status: 'settled', settled_at: new Date().toISOString() })
    .eq('transfer_id', transfer.id)
}

async function onTransferFailed(transfer) {
  await supabase.from('instructor_transfers').update({ status: 'failed' }).eq('transfer_id', transfer.id)
  console.error('transfer.failed', transfer.id)
}

async function onAccountUpdated(account) {
  if (!account.metadata?.user_id) return
  const status = account.charges_enabled ? 'active' : 'pending'
  await supabase
    .from('instructors')
    .update({ stripe_onboard_status: status })
    .eq('stripe_account_id', account.id)
  console.log('account.updated', account.id, status)
}

module.exports = { onPaymentSucceeded, onPaymentFailed, onChargeRefunded, onTransferPaid, onTransferFailed, onAccountUpdated }
