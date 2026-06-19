const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const supabase = require('../lib/supabase')
const { v4: uuidv4 } = require('crypto')

// Issue or fetch certificate
router.get('/course/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { course_id } = req.params
    const student_id = req.user.id

    // Check 100% progress + quiz passed
    const { data: enrollment } = await supabase.from('enrollments').select('progress_percent').eq('student_id', student_id).eq('course_id', course_id).single()
    if (!enrollment || enrollment.progress_percent < 100) return res.status(400).json({ error: 'Course not complete' })

    const { data: attempt } = await supabase.from('quiz_attempts').select('passed').eq('student_id', student_id).eq('quizzes.course_id', course_id).eq('passed', true).maybeSingle()
    if (!attempt) return res.status(400).json({ error: 'Quiz not passed' })

    // Upsert certificate
    const cert_id = uuidv4()
    const { data: cert, error } = await supabase.from('certificates').upsert({
      student_id, course_id, cert_id,
    }, { onConflict: 'student_id,course_id' }).select().single()
    if (error) throw error

    res.json(cert)
  } catch (err) { next(err) }
})

// Public verify
router.get('/verify/:certId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*, users(name), courses(title, users!courses_instructor_id_fkey(name))')
      .eq('cert_id', req.params.certId)
      .single()
    if (error) return res.status(404).json({ error: 'Certificate not found' })
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
