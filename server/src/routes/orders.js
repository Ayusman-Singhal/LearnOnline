const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const stripe = require('../lib/stripe')
const supabase = require('../lib/supabase')
const { sendEnrollmentEmail } = require('../lib/emails')

// POST /api/orders/validate-coupon — preview discount without creating PaymentIntent
router.post('/validate-coupon', requireAuth, async (req, res, next) => {
  try {
    const { coupon_code, course_id } = req.body
    const { data: course } = await supabase.from('courses').select('price').eq('id', course_id).single()
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code.toLowerCase())
      .eq('is_active', true)
      .maybeSingle()
    if (!coupon) return res.status(400).json({ error: 'Invalid coupon' })

    const { data: used } = await supabase
      .from('coupon_uses')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('student_id', req.user.id)
      .maybeSingle()
    if (used) return res.status(400).json({ error: 'Coupon already used' })

    const discount_amount = +(course.price * (coupon.discount_percent / 100)).toFixed(2)
    res.json({ discount_amount, discount_percent: coupon.discount_percent })
  } catch (err) { next(err) }
})

// POST /api/orders — create Stripe PaymentIntent
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { course_id, coupon_code } = req.body
    const student_id = req.user.id

    // Fetch course
    const { data: course, error: cErr } = await supabase
      .from('courses')
      .select('id, title, price, instructor_id')
      .eq('id', course_id)
      .single()
    if (cErr || !course) return res.status(404).json({ error: 'Course not found' })

    // Fetch instructor's Stripe account (two-hop: courses→users→instructors)
    const { data: instructorProfile } = await supabase
      .from('instructors')
      .select('stripe_account_id')
      .eq('user_id', course.instructor_id)
      .maybeSingle()
    const stripeAccountId = instructorProfile?.stripe_account_id

    // Check not already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .eq('status', 'active')
      .maybeSingle()
    if (existing) return res.status(400).json({ error: 'Already enrolled' })

    let amount = course.price
    let coupon_id = null

    // Apply coupon
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toLowerCase())
        .eq('is_active', true)
        .maybeSingle()
      if (!coupon) return res.status(400).json({ error: 'Invalid coupon' })

      const { data: used } = await supabase
        .from('coupon_uses')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('student_id', student_id)
        .maybeSingle()
      if (used) return res.status(400).json({ error: 'Coupon already used' })

      amount = +(amount * (1 - coupon.discount_percent / 100)).toFixed(2)
      coupon_id = coupon.id
    }

    // Free after coupon — create enrollment directly, no payment needed
    if (amount <= 0) {
      await supabase.from('enrollments').insert({
        student_id,
        course_id,
        status: 'active',
        enrolled_at: new Date().toISOString(),
      })
      if (coupon_id) {
        await supabase.from('coupon_uses').insert({ coupon_id, student_id, course_id })
      }
      // Send enrollment email (fire-and-forget)
      const { data: student } = await supabase.from('users').select('name, email').eq('id', student_id).single()
      if (student?.email) {
        sendEnrollmentEmail({ to: student.email, studentName: student.name || 'Student', courseTitle: course.title }).catch(() => {})
      }
      return res.json({ enrolled: true, course_title: course.title })
    }

    const amountPaise = Math.round(amount * 100)
    void stripeAccountId // available for Connect split when Stripe India account configured

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountPaise,
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
      metadata: {
        course_id,
        student_id,
        instructor_id: course.instructor_id,
        coupon_id: coupon_id || '',
      },
    })
    // NOTE: re-enable Connect split below when Stripe India account configured:
    // application_fee_amount: Math.round(amountPaise * 0.12),
    // transfer_data: { destination: instructorStripeAccountId },

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: amountPaise,
      currency: 'inr',
      course_title: course.title,
      final_amount: amount,
    })
  } catch (err) { next(err) }
})

// POST /api/orders/confirm — verify payment + create enrollment (dev fallback; webhook handles prod)
router.post('/confirm', requireAuth, async (req, res, next) => {
  try {
    const { payment_intent_id, course_id } = req.body
    const student_id = req.user.id

    const pi = await stripe.paymentIntents.retrieve(payment_intent_id)
    if (pi.status !== 'succeeded') return res.status(400).json({ error: 'Payment not completed' })
    if (pi.metadata.student_id !== student_id) return res.status(403).json({ error: 'Forbidden' })
    if (pi.metadata.course_id !== course_id) return res.status(403).json({ error: 'Course mismatch' })

    await supabase.from('enrollments').upsert(
      { student_id, course_id, payment_id: payment_intent_id, status: 'active', enrolled_at: new Date().toISOString() },
      { onConflict: 'student_id,course_id' }
    )

    // Record fee only if webhook hasn't already done so
    const { data: existingFee } = await supabase
      .from('platform_fees').select('id').eq('payment_id', payment_intent_id).maybeSingle()

    if (!existingFee) {
      const gross = pi.amount / 100
      const { instructor_id, coupon_id } = pi.metadata
      await supabase.from('platform_fees').insert({
        payment_id: payment_intent_id, course_id, student_id, instructor_id,
        gross, platform_fee: +(gross * 0.12).toFixed(2),
        instructor_share: +(gross * 0.88).toFixed(2), status: 'pending_transfer',
      })
      if (coupon_id) {
        await supabase.from('coupon_uses').upsert(
          { coupon_id, student_id, payment_id: payment_intent_id },
          { onConflict: 'coupon_id,student_id' }
        )
      }
    }

    // Send enrollment confirmation email (fire-and-forget)
    const { data: student } = await supabase.from('users').select('name, email').eq('id', student_id).single()
    const { data: course } = await supabase.from('courses').select('title').eq('id', course_id).single()
    if (student?.email && course?.title) {
      sendEnrollmentEmail({ to: student.email, studentName: student.name || 'Student', courseTitle: course.title }).catch(() => {})
    }

    res.json({ enrolled: true })
  } catch (err) { next(err) }
})

module.exports = router
