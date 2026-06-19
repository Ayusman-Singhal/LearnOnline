const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const stripe = require('../lib/stripe')
const supabase = require('../lib/supabase')

// GET /api/instructor/status — instructor profile + Stripe account status
router.get('/status', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle()

    let stripeStatus = null
    if (profile?.stripe_account_id) {
      const account = await stripe.accounts.retrieve(profile.stripe_account_id)
      stripeStatus = {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      }
    }

    res.json({ profile, stripeStatus })
  } catch (err) { next(err) }
})

// POST /api/instructor/onboard — create/resume Stripe Express account onboarding
router.post('/onboard', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    let { data: profile } = await supabase
      .from('instructors')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle()

    // Create Stripe Express account if not yet done
    let stripeAccountId = profile?.stripe_account_id
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // test mode only — production needs Stripe India account for 'IN'
        email: req.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { user_id: req.user.id },
      })
      stripeAccountId = account.id

      // Upsert instructor row with stripe account ID
      await supabase.from('instructors').upsert({
        user_id: req.user.id,
        stripe_account_id: stripeAccountId,
        stripe_onboard_status: 'pending',
      }, { onConflict: 'user_id' })
    }

    // Generate fresh onboarding link (links expire after a few minutes)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.CLIENT_URL}/dashboard/onboarding?refresh=1`,
      return_url: `${process.env.CLIENT_URL}/dashboard/onboarding?success=1`,
      type: 'account_onboarding',
    })

    res.json({ url: accountLink.url })
  } catch (err) { next(err) }
})

// POST /api/instructor/profile — update bio/headline
router.post('/profile', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { bio, headline } = req.body
    const { data, error } = await supabase
      .from('instructors')
      .upsert({ user_id: req.user.id, bio, headline }, { onConflict: 'user_id' })
      .select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
