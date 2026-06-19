const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// Student: my enrollments
router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, courses(*, categories(name), users!courses_instructor_id_fkey(name))')
      .eq('student_id', req.user.id)
      .eq('status', 'active')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Instructor: students enrolled in my courses
router.get('/instructor', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, users!enrollments_student_id_fkey(name, email, avatar_url), courses(title)')
      .eq('courses.instructor_id', req.user.id)
      .eq('status', 'active')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
