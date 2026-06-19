const express = require('express')
const router = express.Router()
const { requireAuth, requireRole } = require('../middleware/auth')
const supabase = require('../lib/supabase')

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description } = req.body
    const { data, error } = await supabase.from('categories').insert({ name, description }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.put('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description } = req.body
    const { data, error } = await supabase.from('categories').update({ name, description }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

module.exports = router
