const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// Validate coupon (public check before order)
router.post('/validate', requireAuth, async (req, res, next) => {
  try {
    const { code, course_id } = req.body
    const { data: coupon } = await supabase.from('coupons').select('*').eq('code', code.toLowerCase()).eq('is_active', true).maybeSingle()
    if (!coupon) return res.status(400).json({ valid: false, error: 'Invalid coupon' })

    const { data: used } = await supabase.from('coupon_uses').select('id').eq('coupon_id', coupon.id).eq('student_id', req.user.id).maybeSingle()
    if (used) return res.status(400).json({ valid: false, error: 'Coupon already used' })

    res.json({ valid: true, discount_percent: coupon.discount_percent, coupon_id: coupon.id })
  } catch (err) { next(err) }
})

router.get('/', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('coupons').select('*')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { code, discount_percent, is_active } = req.body
    const { data, error } = await supabase.from('coupons').insert({ code: code.toLowerCase(), discount_percent, is_active }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

module.exports = router
