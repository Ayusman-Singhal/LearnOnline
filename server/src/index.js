require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 5000

// Security
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }))

// Webhooks need raw body — mount before express.json()
app.use('/api/webhooks', require('./routes/webhooks'))

app.use(express.json())

// Routes
app.use('/api/users', require('./routes/users'))
app.use('/api/courses', require('./routes/courses'))
app.use('/api/enrollments', require('./routes/enrollments'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/lessons', require('./routes/lessons'))
app.use('/api/quizzes', require('./routes/quizzes'))
app.use('/api/progress', require('./routes/progress'))
app.use('/api/certificates', require('./routes/certificates'))
app.use('/api/announcements', require('./routes/announcements'))
app.use('/api/coupons', require('./routes/coupons'))
app.use('/api/uploads', require('./routes/uploads'))
app.use('/api/analytics', require('./routes/analytics'))

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
