const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// GET lessons for a course
// Free lessons: public. Paid lessons: must be enrolled or instructor/admin
router.get('/course/:courseId', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*, learning_materials(*)')
      .eq('course_id', req.params.courseId)
      .order('sort_order')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// POST — create lesson
router.post('/', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { course_id, title, type, content_url, sort_order, is_free, duration_mins } = req.body
    const { data, error } = await supabase.from('lessons').insert({
      course_id, title,
      type: type || 'video',
      content_url,
      sort_order: sort_order ?? 0,
      is_free: is_free ?? false,
      duration_mins,
    }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// PUT — update lesson
router.put('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, type, content_url, sort_order, is_free, duration_mins } = req.body
    const { data, error } = await supabase
      .from('lessons')
      .update({ title, type, content_url, sort_order, is_free, duration_mins })
      .eq('id', req.params.id)
      .select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// DELETE — remove lesson
router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { error } = await supabase.from('lessons').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
