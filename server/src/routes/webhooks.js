const express = require('express')
const router = express.Router()
const { Webhook } = require('svix')
const stripe = require('../lib/stripe')
const supabase = require('../lib/supabase')

// Raw body — required for both Clerk and Stripe signature verification
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

// Stripe webhook
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const handlers = require('../services/webhookHandlers')

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlers.onPaymentSucceeded(event.data.object)
      break
    case 'payment_intent.payment_failed':
      await handlers.onPaymentFailed(event.data.object)
      break
    case 'charge.refunded':
      await handlers.onChargeRefunded(event.data.object)
      break
    case 'transfer.paid':
      await handlers.onTransferPaid(event.data.object)
      break
    case 'transfer.failed':
      await handlers.onTransferFailed(event.data.object)
      break
    case 'account.updated':
      await handlers.onAccountUpdated(event.data.object)
      break
  }

  res.json({ received: true })
})

module.exports = router
