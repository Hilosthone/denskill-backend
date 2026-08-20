// // src/server.js
// const express = require('express')
// const cors = require('cors')
// const helmet = require('helmet')
// const morgan = require('morgan')
// require('dotenv').config()

// // Import database connection and Swagger documentation setup
// const db = require('./config/db')
// const { swaggerDocs } = require('./config/swagger')
// const { initTokenCleanupCron } = require('./utils/tokenCleanup')

// const app = express()

// // Trust proxy for cloud deployments (Render, Heroku, etc.)
// app.set('trust proxy', 1)

// // Security & Utility Middleware
// app.use(helmet())
// app.use(morgan('dev'))

// // Configure CORS properly at the top so preflight requests succeed for all domains
// app.use(
//   cors({
//     origin: [
//       'http://localhost:3000',
//       'http://localhost:5173',
//       'http://localhost:5000',
//       'https://denskill.com',
//       'https://www.denskill.com',
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   }),
// )

// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// // Import Core Feature Routes
// const authRoutes = require('./routes/authRoutes')
// const paymentRoutes = require('./routes/paymentRoutes')
// const enrollmentRoutes = require('./routes/enrollmentRoutes')
// const dashboardRoutes = require('./routes/dashboardRoutes')
// const adminAuthRoutes = require('./routes/adminAuthRoutes')
// const adminRoutes = require('./routes/adminRoutes')
// const systemRoutes = require('./routes/systemRoutes')
// const tutorRoutes = require('./routes/tutorRoutes')

// // Import Public Scholarship Application Routes (For prospective applicants before they become students)
// const scholarshipAuthRoutes = require('./routes/scholarship/scholarshipAuthRoutes')
// const scholarshipEnrollmentRoutes = require('./routes/scholarship/scholarshipEnrollmentRoutes')

// // Import Scholarship Admin Routes (For managing cohorts, applications, and manual scholarship onboarding)
// const scholarshipAdminRoutes = require('./routes/scholarship/scholarshipAdminRoutes')



// // Standalone public debug route
// // Expanded debug route to check all potential tables
// app.get('/debug-applications', async (req, res) => {
//   try {
//     const scholarshipRes = await db.query('SELECT COUNT(*) FROM scholarship_applications');
//     const enrollmentRes = await db.query('SELECT COUNT(*) FROM enrollments');
//     const userRes = await db.query('SELECT COUNT(*) FROM users');

//     const recentEnrollments = await db.query('SELECT id, first_name, last_name, email, course, created_at FROM enrollments ORDER BY created_at DESC LIMIT 20');
//     const recentUsers = await db.query('SELECT id, email, first_name, last_name, created_at FROM users ORDER BY created_at DESC LIMIT 20');

//     res.json({
//       summary: {
//         scholarshipApplicationsCount: scholarshipRes.rows[0].count,
//         enrollmentsCount: enrollmentRes.rows[0].count,
//         totalUsersCount: userRes.rows[0].count,
//       },
//       recentEnrollments: recentEnrollments.rows,
//       recentUsers: recentUsers.rows,
//     })
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//   }
// })

// // Mount System Routes (Handles root '/' and '/health')
// app.use('/', systemRoutes)

// // Mount Core API Routes (Unified Students, Tutors, and General Features)
// app.use('/api/auth', authRoutes)
// app.use('/api/payments', paymentRoutes)
// app.use('/api/enrollments', enrollmentRoutes)
// app.use('/api/dashboard', dashboardRoutes) // Handles all student dashboards (Normal & Scholarship)
// app.use('/api/tutors', tutorRoutes)        // Handles all tutor workflows & assigned cohort students

// // Mount Admin Routes (Handles platform metrics, user management, etc.)
// app.use('/api/admin/auth', adminAuthRoutes)
// app.use('/api/admin', adminRoutes)

// // Mount Scholarship Admin Routes (Handles scholarship metrics, cohort management, application approvals, & manual student onboarding)
// app.use('/api/admin/scholarships', scholarshipAdminRoutes)

// // Mount Public Scholarship Application Routes (Pre-admission only)
// app.use('/api/scholarship/auth', scholarshipAuthRoutes)
// app.use('/api/scholarship/enrollment', scholarshipEnrollmentRoutes)

// // Initialize Swagger Documentation UI
// swaggerDocs(app)

// // Centralized Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(err.status || 500).json({
//     status: 'error',
//     message: err.message || 'Internal Server Error',
//   })
// })

// // // Port Configuration & Server Startup
// // const PORT = process.env.PORT || 5000

// // // Start the server
// // app.listen(PORT, () => {
// //   console.log(
// //     `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`,
// //   )
// //   console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`)

// //   // Start the automated token cleanup cron job
// //   initTokenCleanupCron()
// // })





// // Centralized Error Handling Middleware (Keep this right above)
// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(err.status || 500).json({
//     status: 'error',
//     message: err.message || 'Internal Server Error',
//   })
// })

// // Port Configuration & Server Startup
// const PORT = process.env.PORT || 5000

// // Only call app.listen in local development.
// // Vercel handles production requests via the exported app module.
// if (process.env.NODE_ENV !== 'production') {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT} in development mode`)
//     console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`)
//     initTokenCleanupCron()
//   })
// } else {
//   // Ensure background jobs like cron still run in production if needed
//   initTokenCleanupCron()
// }

// // Export the app for Vercel serverless execution
// module.exports = app



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

// Trust proxy for cloud deployments (Render, Heroku, etc.)
app.set('trust proxy', 1)

// Security & Utility Middleware (Configured to allow Swagger CDN assets)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
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
app.use('/api/tutors', tutorRoutes)

// Mount Admin Routes (Handles platform metrics, user management, etc.)
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin', adminRoutes)

// Mount Scholarship Admin Routes (Handles scholarship metrics, cohort management, application approvals, & manual student onboarding)
app.use('/api/admin/scholarships', scholarshipAdminRoutes)

// Mount Public Scholarship Application Routes (Pre-admission only)
app.use('/api/scholarship/auth', scholarshipAuthRoutes)
app.use('/api/scholarship/enrollment', scholarshipEnrollmentRoutes)

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

// Port Configuration & Server Startup
const PORT = process.env.PORT || 5000

// Only call app.listen in local development. 
// Vercel handles production requests via the exported app module.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in development mode`)
    console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`)
    initTokenCleanupCron()
  })
} else {
  // Ensure background jobs like cron still run in production if needed
  initTokenCleanupCron()
}

// Export the app for Vercel serverless execution
module.exports = app