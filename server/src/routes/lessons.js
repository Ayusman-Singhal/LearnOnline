const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// GET lessons for a course (enrolled students or instructor)
router.get('/course/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, learning_materials(*)')
      .eq('course_id', req.params.courseId)
      .order('order')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { course_id, title, content_type, content_url, order, is_free_preview, duration_seconds } = req.body
    const { data, error } = await supabase.from('lessons').insert({
      course_id, title, content_type, content_url, order, is_free_preview, duration_seconds,
    }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.put('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, content_type, content_url, order, is_free_preview, duration_seconds } = req.body
    const { data, error } = await supabase.from('lessons').update({ title, content_type, content_url, order, is_free_preview, duration_seconds }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { error } = await supabase.from('lessons').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
