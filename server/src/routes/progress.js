const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// Mark lesson complete
router.post('/lesson/:lessonId/complete', requireAuth, async (req, res, next) => {
  try {
    const { course_id } = req.body
    await supabase.from('lesson_progress').upsert({
      student_id: req.user.id,
      lesson_id: req.params.lessonId,
      course_id,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'student_id,lesson_id' })

    // Recalculate course progress %
    const { count: total } = await supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('course_id', course_id)
    const { count: done } = await supabase.from('lesson_progress').select('id', { count: 'exact', head: true }).eq('course_id', course_id).eq('student_id', req.user.id).eq('completed', true)
    const percent = total ? Math.round((done / total) * 100) : 0

    await supabase.from('enrollments').update({ progress_percent: percent, last_lesson_id: req.params.lessonId }).eq('student_id', req.user.id).eq('course_id', course_id)

    res.json({ progress_percent: percent })
  } catch (err) { next(err) }
})

// Get course progress
router.get('/course/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed, completed_at')
      .eq('student_id', req.user.id)
      .eq('course_id', req.params.courseId)
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
