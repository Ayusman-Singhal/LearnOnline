const express = require('express')
const router = express.Router()
const multer = require('multer')
const { requireAuth } = require('../middleware/auth')
const cloudinary = require('../lib/cloudinary')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    }).end(buffer)
  })
}

// POST /api/uploads — handles image, video, pdf
router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' })
    const { type = 'image', folder = 'learnonline' } = req.body

    const resourceType = type === 'video' ? 'video' : type === 'pdf' ? 'raw' : 'image'

    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type: resourceType,
    })

    res.json({ url: result.secure_url, public_id: result.public_id })
  } catch (err) { next(err) }
})

// POST /api/uploads/from-url — fetch external image URL and re-host on Cloudinary
router.post('/from-url', requireAuth, async (req, res, next) => {
  try {
    const { url, folder = 'learnonline/thumbnails' } = req.body
    if (!url) return res.status(400).json({ error: 'url required' })

    const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) return res.status(400).json({ error: `Fetch failed: ${response.status}` })

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) return res.status(400).json({ error: 'URL is not an image' })

    const buffer = Buffer.from(await response.arrayBuffer())
    const result = await uploadToCloudinary(buffer, { folder, resource_type: 'image' })
    res.json({ url: result.secure_url, public_id: result.public_id })
  } catch (err) { next(err) }
})

module.exports = router
