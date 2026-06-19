const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

// GET /api/users/me
router.get('/me', requireAuth, (req, res) => res.json(req.user))

// GET /api/users — admin only
router.get('/', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('users').select('*').is('deleted_at', null).order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// PATCH /api/users/:id/role — admin only
router.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body
    if (!['admin', 'instructor', 'student'].includes(role)) return res.status(400).json({ error: 'Invalid role' })
    const { data, error } = await supabase.from('users').update({ role }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// DELETE /api/users/:id — admin soft-delete
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { error } = await supabase.from('users').update({ deleted_at: new Date().toISOString() }).eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
