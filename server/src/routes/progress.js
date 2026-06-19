const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const supabase = require('../lib/supabase')
const { issueCertificate } = require('./certificates')

// Mark lesson complete
router.post('/lesson/:lessonId/complete', requireAuth, async (req, res, next) => {
  try {
    const { course_id } = req.body
    await supabase.from('lesson_progress').upsert({
      student_id: req.user.id,
      lesson_id: req.params.lessonId,
      course_id,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'student_id,lesson_id' })

    // Recalculate course progress % (every row = completed)
    const { count: total } = await supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('course_id', course_id)
    const { count: done } = await supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('course_id', course_id).eq('student_id', req.user.id)
    const percent = total ? Math.round((done / total) * 100) : 0

    await supabase.from('enrollments').update({ progress_percent: percent, last_lesson_id: req.params.lessonId }).eq('student_id', req.user.id).eq('course_id', course_id)

    // Auto-issue certificate when 100% (no quiz) — silently skip if quiz required but not passed
    let certificate = null
    if (percent === 100) {
      try { certificate = await issueCertificate(req.user.id, course_id) } catch {}
    }

    res.json({ progress_percent: percent, certificate })
  } catch (err) { next(err) }
})

// Get course progress
router.get('/course/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed_at')
      .eq('student_id', req.user.id)
      .eq('course_id', req.params.courseId)
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
