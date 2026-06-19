const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*, users!announcements_author_id_fkey(name, avatar_url)')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, body, target_role = 'all' } = req.body
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: 'title and body required' })
    const { data, error } = await supabase
      .from('announcements')
      .insert({ title, body, target_role, author_id: req.user.id })
      .select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { error } = await supabase.from('announcements').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
