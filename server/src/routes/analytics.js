const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// Admin analytics
router.get('/admin', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const [users, courses, enrollments] = await Promise.all([
      supabase.from('users').select('id, created_at, role', { count: 'exact' }).is('deleted_at', null),
      supabase.from('courses').select('id, status', { count: 'exact' }),
      supabase.from('enrollments').select('id, created_at, course_id', { count: 'exact' }).eq('status', 'active'),
    ])
    res.json({
      total_users: users.count,
      total_courses: courses.count,
      total_enrollments: enrollments.count,
      users: users.data,
      enrollments: enrollments.data,
    })
  } catch (err) { next(err) }
})

// Instructor analytics
router.get('/instructor', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { data: courses } = await supabase.from('courses').select('id, title').eq('instructor_id', req.user.id)
    const ids = courses?.map((c) => c.id) || []

    const { data: enrollments } = await supabase.from('enrollments').select('course_id, progress_percent, created_at').in('course_id', ids).eq('status', 'active')
    const { data: fees } = await supabase.from('platform_fees').select('instructor_share, status, course_id').in('course_id', ids)

    const total_earnings = fees?.filter((f) => f.status !== 'refunded').reduce((s, f) => s + f.instructor_share, 0) || 0

    res.json({ courses, enrollments, total_earnings })
  } catch (err) { next(err) }
})

module.exports = router
