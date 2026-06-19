const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

router.get('/course/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, questions(*)')
      .eq('course_id', req.params.courseId)
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { course_id, title, passing_score, allow_retry } = req.body
    const { data, error } = await supabase.from('quizzes').insert({ course_id, title, passing_score, allow_retry }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// Submit quiz attempt
router.post('/:id/attempt', requireAuth, async (req, res, next) => {
  try {
    const { answers } = req.body // [{ question_id, selected_option }]
    const { data: quiz, error: qErr } = await supabase
      .from('quizzes')
      .select('*, questions(*)')
      .eq('id', req.params.id)
      .single()
    if (qErr) throw qErr

    let correct = 0
    for (const ans of answers) {
      const q = quiz.questions.find((q) => q.id === ans.question_id)
      if (q && q.correct_option === ans.selected_option) correct++
    }
    const score = Math.round((correct / quiz.questions.length) * 100)
    const passed = score >= quiz.passing_score

    const { data: attempt, error: aErr } = await supabase.from('quiz_attempts').insert({
      quiz_id: quiz.id,
      student_id: req.user.id,
      answers,
      score,
      passed,
    }).select().single()
    if (aErr) throw aErr

    res.json({ score, passed, attempt_id: attempt.id })
  } catch (err) { next(err) }
})

module.exports = router
