// src/server.js
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

// Import database connection and Swagger documentation setup
const db = require('./config/db')
const { swaggerDocs } = require('./config/swagger')
const { initTokenCleanupCron } = require('./utils/tokenCleanup')

const app = express()

// Trust proxy for cloud deployments (Render, Vercel, etc.)
app.set('trust proxy', 1)

// Security & Utility Middleware (Configured to allow Swagger CDN assets and inline scripts)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdnjs.cloudflare.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      },
    },
  }),
)

app.use(morgan('dev'))

// Configure CORS properly at the top so preflight requests succeed for all domains
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000',
      'https://denskill.com',
      'https://www.denskill.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Import Core Feature Routes
const authRoutes = require('./routes/authRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const adminAuthRoutes = require('./routes/adminAuthRoutes')
const adminRoutes = require('./routes/adminRoutes')
const systemRoutes = require('./routes/systemRoutes')
const tutorRoutes = require('./routes/tutorRoutes')

// Import Public Scholarship Application Routes (For prospective applicants before they become students)
const scholarshipAuthRoutes = require('./routes/scholarship/scholarshipAuthRoutes')
const scholarshipEnrollmentRoutes = require('./routes/scholarship/scholarshipEnrollmentRoutes')

// Import Scholarship Admin Routes (For managing cohorts, applications, and manual scholarship onboarding)
const scholarshipAdminRoutes = require('./routes/scholarship/scholarshipAdminRoutes')

// Import Leaderboard Routes
const leaderboardRoutes = require('./routes/leaderboardRoutes')

// Standalone public debug route
app.get('/debug-applications', async (req, res) => {
  try {
    const scholarshipRes = await db.query('SELECT COUNT(*) FROM scholarship_applications')
    const enrollmentRes = await db.query('SELECT COUNT(*) FROM enrollments')
    const userRes = await db.query('SELECT COUNT(*) FROM users')

    const recentEnrollments = await db.query('SELECT id, first_name, last_name, email, course, created_at FROM enrollments ORDER BY created_at DESC LIMIT 20')
    const recentUsers = await db.query('SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 20')

    res.json({
      summary: {
        scholarshipApplicationsCount: scholarshipRes.rows[0].count,
        enrollmentsCount: enrollmentRes.rows[0].count,
        totalUsersCount: userRes.rows[0].count,
      },
      recentEnrollments: recentEnrollments.rows,
      recentUsers: recentUsers.rows,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Mount System Routes (Handles root '/' and '/health')
app.use('/', systemRoutes)

// Mount Core API Routes (Unified Students, Tutors, and General Features)
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/tutor', tutorRoutes)

// Mount Admin Routes (Handles platform metrics, user management, etc.)
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin', adminRoutes)

// Mount Scholarship Admin Routes (Handles scholarship metrics, cohort management, application approvals, & manual student onboarding)
app.use('/api/admin/scholarships', scholarshipAdminRoutes)

// Mount Public Scholarship Application Routes (Pre-admission only)
app.use('/api/scholarship/auth', scholarshipAuthRoutes)
app.use('/api/scholarship/enrollment', scholarshipEnrollmentRoutes)

// Mount question banks, individual questions, and leaderboard modules under clean API namespaces
app.use('/api/question-banks', require('./routes/questionBankRoutes'))
app.use('/api/questions', require('./routes/questionRoutes'))
app.use('/api/leaderboard', leaderboardRoutes)

// Initialize Swagger Documentation UI
swaggerDocs(app)

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  })
})

// Port Configuration & Server Startup for Render & Local Development
const PORT = process.env.PORT || 5000

app.listen(PORT, '0.0.0.0', () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER
  const localUrl = `http://localhost:${PORT}`
  const swaggerDocsUrl = `${localUrl}/api-docs`
  
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`🌐 API Documentation available at: ${swaggerDocsUrl}`)
  
  if (isProduction) {
    const host = process.env.RENDER_EXTERNAL_URL || `https://denskill-backend.onrender.com`
    console.log(`🌍 Live production URL: ${host}`)
    console.log(`🌍 Live API Docs: ${host}/api-docs`)
  }
  
  initTokenCleanupCron()
})

module.exports = app