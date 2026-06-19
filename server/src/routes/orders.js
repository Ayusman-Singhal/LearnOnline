const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const razorpay = require('../lib/razorpay')
const supabase = require('../lib/supabase')

// POST /api/orders — create Razorpay order
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { course_id, coupon_code } = req.body
    const student_id = req.user.id

    // Fetch course
    const { data: course, error: cErr } = await supabase.from('courses').select('id, title, price, instructor_id, instructors(razorpay_account_id)').eq('id', course_id).single()
    if (cErr || !course) return res.status(404).json({ error: 'Course not found' })

    // Check not already enrolled
    const { data: existing } = await supabase.from('enrollments').select('id').eq('student_id', student_id).eq('course_id', course_id).eq('status', 'active').maybeSingle()
    if (existing) return res.status(400).json({ error: 'Already enrolled' })

    let amount = course.price
    let coupon_id = null

    // Apply coupon
    if (coupon_code) {
      const { data: coupon } = await supabase.from('coupons').select('*').eq('code', coupon_code.toLowerCase()).eq('is_active', true).maybeSingle()
      if (!coupon) return res.status(400).json({ error: 'Invalid coupon' })

      const { data: used } = await supabase.from('coupon_uses').select('id').eq('coupon_id', coupon.id).eq('student_id', student_id).maybeSingle()
      if (used) return res.status(400).json({ error: 'Coupon already used' })

      amount = +(amount * (1 - coupon.discount_percent / 100)).toFixed(2)
      coupon_id = coupon.id
    }

    const amountPaise = Math.round(amount * 100)
    const razorpayAccountId = course.instructors?.razorpay_account_id

    const orderPayload = {
      amount: amountPaise,
      currency: 'INR',
      notes: { course_id, student_id, instructor_id: course.instructor_id, coupon_id },
    }

    // Add Route transfer if instructor has linked account
    if (razorpayAccountId) {
      orderPayload.transfers = [{
        account: razorpayAccountId,
        amount: Math.round(amountPaise * 0.88),
        currency: 'INR',
        notes: { course_id, student_id },
        linked_account_notes: ['course_id'],
        on_hold: 0,
      }]
    }

    const order = await razorpay.orders.create(orderPayload)

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      course_title: course.title,
      final_amount: amount,
    })
  } catch (err) { next(err) }
})

// POST /api/orders/verify — verify payment after checkout
router.post('/verify', requireAuth, async (req, res, next) => {
  try {
    const crypto = require('crypto')
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed' })
    }

    // Enrollment is created by webhook; return OK for frontend redirect
    res.json({ success: true, payment_id: razorpay_payment_id })
  } catch (err) { next(err) }
})

module.exports = router
