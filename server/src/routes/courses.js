const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// Public: list published courses
router.get('/', async (req, res, next) => {
  try {
    const { search, category_id, instructor_id, sort = 'created_at' } = req.query
    let query = supabase
      .from('courses')
      .select('*, categories(name), users!courses_instructor_id_fkey(name, avatar_url)')
      .eq('status', 'published')

    if (search) query = query.ilike('title', `%${search}%`)
    if (category_id) query = query.eq('category_id', category_id)
    if (instructor_id) query = query.eq('instructor_id', instructor_id)
    query = query.order(sort, { ascending: false })

    const { data, error } = await query
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Instructor: own courses (any status)
router.get('/mine', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, categories(name)')
      .eq('instructor_id', req.user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Admin: list all courses (any status)
router.get('/admin/all', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, categories(name), users!courses_instructor_id_fkey(name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Public: single course with lessons
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, categories(name), users!courses_instructor_id_fkey(id, name, avatar_url), lessons(id, title, type, content_url, sort_order, is_free, duration_mins)')
      .eq('id', req.params.id)
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Instructor: create course
router.post('/', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, description, category_id, price, thumbnail_url } = req.body
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
    const { data, error } = await supabase.from('courses').insert({
      title, slug, description, category_id, price, thumbnail_url,
      instructor_id: req.user.id,
      status: 'draft',
    }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// Instructor: update course
router.put('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res, next) => {
  try {
    const { title, description, category_id, price, thumbnail_url, status } = req.body
    let query = supabase.from('courses')
      .update({ title, description, category_id, price, thumbnail_url, status })
      .eq('id', req.params.id)
    if (req.user.role === 'instructor') query = query.eq('instructor_id', req.user.id)
    const { data, error } = await query.select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Admin: archive course
router.patch('/:id/archive', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('courses')
      .update({ status: 'archived' })
      .eq('id', req.params.id)
      .select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

module.exports = router
