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

module.exports = router
