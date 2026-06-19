const supabase = require('../lib/supabase')

async function onPaymentCaptured(payload) {
  const payment = payload.payment.entity
  const { order_id, id: payment_id, amount, notes } = payment
  const { course_id, student_id, instructor_id, coupon_id } = notes || {}

  // Create enrollment
  await supabase.from('enrollments').upsert({ student_id, course_id, payment_id, status: 'active' }, { onConflict: 'student_id,course_id' })

  const gross = amount / 100
  const platform_fee = +(gross * 0.12).toFixed(2)
  const instructor_share = +(gross * 0.88).toFixed(2)

  // Record platform fee
  const { data: fee } = await supabase.from('platform_fees').insert({
    order_id,
    payment_id,
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
    await supabase.from('coupon_uses').insert({ coupon_id, student_id, payment_id })
  }

  console.log('payment.captured processed', { payment_id, fee: fee?.id })
}

async function onPaymentFailed(payload) {
  const payment = payload.payment.entity
  console.log('payment.failed', payment.id)
}

async function onRefundCreated(payload) {
  const refund = payload.refund.entity
  const { payment_id } = refund

  // Revoke enrollment
  await supabase.from('enrollments').update({ status: 'refunded' }).eq('payment_id', payment_id)

  // Update fee status
  await supabase.from('platform_fees').update({ status: 'refunded' }).eq('payment_id', payment_id)

  // Mark transfer reversed
  await supabase.from('instructor_transfers').update({ status: 'reversed' }).eq('payment_id', payment_id)

  console.log('refund.created processed', payment_id)
}

async function onTransferProcessed(payload) {
  const transfer = payload.transfer.entity
  await supabase.from('instructor_transfers')
    .update({ status: 'settled', settled_at: new Date().toISOString() })
    .eq('transfer_id', transfer.id)
}

async function onTransferFailed(payload) {
  const transfer = payload.transfer.entity
  await supabase.from('instructor_transfers').update({ status: 'failed' }).eq('transfer_id', transfer.id)
  // TODO: alert admin (Phase 14 notifications)
  console.error('transfer.failed', transfer.id)
}

module.exports = { onPaymentCaptured, onPaymentFailed, onRefundCreated, onTransferProcessed, onTransferFailed }
