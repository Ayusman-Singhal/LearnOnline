const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// GET quiz + questions for a course
router.get('/course/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*, questions(*)')
      .eq('course_id', req.params.courseId)
      .order('sort_order', { referencedTable: 'questions' })
      .maybeSingle()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// POST — create quiz for course
router.post('/', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { course_id, title, passing_score = 70, allow_retry = true } = req.body
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ course_id, title, passing_score, allow_retry })
      .select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// PUT — update quiz settings
router.put('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, passing_score, allow_retry } = req.body
    const { data, error } = await supabase
      .from('quizzes')
      .update({ title, passing_score, allow_retry })
      .eq('id', req.params.id)
      .select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// POST — add question to quiz
router.post('/:id/questions', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { question, options, correct_index, sort_order = 0 } = req.body
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'question, options (min 2) required' })
    }
    if (correct_index == null || correct_index < 0 || correct_index >= options.length) {
      return res.status(400).json({ error: 'correct_index out of range' })
    }
    const { data, error } = await supabase
      .from('questions')
      .insert({ quiz_id: req.params.id, question, options, correct_index, sort_order })
      .select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// DELETE — remove question
router.delete('/:id/questions/:qId', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { error } = await supabase.from('questions').delete().eq('id', req.params.qId)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

// GET — student's best attempt for a quiz
router.get('/:id/my-attempt', requireAuth, async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', req.params.id)
      .eq('student_id', req.user.id)
      .order('score', { ascending: false })
      .limit(1)
      .maybeSingle()
    res.json(data) // null if no attempt yet
  } catch (err) { next(err) }
})

// POST — student submits quiz attempt
// answers: { [question_id]: selected_index }
router.post('/:id/attempt', requireAuth, async (req, res, next) => {
  try {
    // Block re-attempt if already passed
    const { data: existingPass } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('quiz_id', req.params.id)
      .eq('student_id', req.user.id)
      .eq('passed', true)
      .maybeSingle()
    if (existingPass) return res.status(400).json({ error: 'Already passed' })

    const { answers } = req.body
    const { data: quiz, error: qErr } = await supabase
      .from('quizzes')
      .select('*, questions(*)')
      .eq('id', req.params.id)
      .single()
    if (qErr) throw qErr

    let correct = 0
    for (const q of quiz.questions) {
      if (answers[q.id] === q.correct_index) correct++
    }
    const score = quiz.questions.length
      ? Math.round((correct / quiz.questions.length) * 100)
      : 0
    const passed = score >= quiz.passing_score

    const { data: attempt, error: aErr } = await supabase
      .from('quiz_attempts')
      .insert({ quiz_id: quiz.id, student_id: req.user.id, answers, score, passed })
      .select().single()
    if (aErr) throw aErr

    res.json({ score, passed, attempt_id: attempt.id })
  } catch (err) { next(err) }
})

module.exports = router
