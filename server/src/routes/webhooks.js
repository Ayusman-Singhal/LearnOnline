const express = require('express')
const router = express.Router()
const { Webhook } = require('svix')
const crypto = require('crypto')
const supabase = require('../lib/supabase')

// Raw body for signature verification
router.use(express.raw({ type: 'application/json' }))

// Clerk webhook — sync users to Supabase
router.post('/clerk', async (req, res) => {
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
  let event
  try {
    event = wh.verify(req.body, {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    })
  } catch {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const { type, data } = event

  if (type === 'user.created' || type === 'user.updated') {
    const email = data.email_addresses?.[0]?.email_address
    await supabase.from('users').upsert({
      clerk_id: data.id,
      email,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      avatar_url: data.image_url,
      role: 'student',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'clerk_id' })
  }

  if (type === 'user.deleted') {
    await supabase.from('users').update({ deleted_at: new Date().toISOString() }).eq('clerk_id', data.id)
  }

  res.json({ received: true })
})

// Razorpay webhook
router.post('/razorpay', async (req, res) => {
  const body = req.body.toString()
  const signature = req.headers['x-razorpay-signature']
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  if (signature !== expected) {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const event = JSON.parse(body)
  const { event: eventType, payload } = event

  // Handlers imported lazily to avoid circular deps
  const handlers = require('../services/webhookHandlers')

  switch (eventType) {
    case 'payment.captured':
      await handlers.onPaymentCaptured(payload)
      break
    case 'payment.failed':
      await handlers.onPaymentFailed(payload)
      break
    case 'refund.created':
      await handlers.onRefundCreated(payload)
      break
    case 'transfer.processed':
      await handlers.onTransferProcessed(payload)
      break
    case 'transfer.failed':
      await handlers.onTransferFailed(payload)
      break
  }

  res.json({ received: true })
})

module.exports = router
