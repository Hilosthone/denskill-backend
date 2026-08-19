// // src/server.js
// const express = require('express')
// const cors = require('cors')
// const helmet = require('helmet')
// require('dotenv').config()

// // Import database connection and Swagger documentation setup
// const db = require('./config/db')
// const { swaggerDocs } = require('./config/swagger')
// const { initTokenCleanupCron } = require('./utils/tokenCleanup')

// const app = express()

// // Security & Utility Middleware
// app.use(helmet())

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

// // Import Routes
// const authRoutes = require('./routes/authRoutes')
// const paymentRoutes = require('./routes/paymentRoutes')
// const enrollmentRoutes = require('./routes/enrollmentRoutes')
// const dashboardRoutes = require('./routes/dashboardRoutes')
// const adminAuthRoutes = require('./routes/adminAuthRoutes')
// const adminRoutes = require('./routes/adminRoutes')
// const systemRoutes = require('./routes/systemRoutes')
// const tutorRoutes = require('./routes/tutorRoutes')

// // Mount System Routes (Handles root '/' and '/health')
// app.use('/', systemRoutes)

// // Mount Feature & API Routes
// app.use('/api/auth', authRoutes)
// app.use('/api/payments', paymentRoutes)
// app.use('/api/enrollments', enrollmentRoutes)
// app.use('/api/dashboard', dashboardRoutes)
// app.use('/api/tutor', tutorRoutes)

// // Mount Admin Routes
// app.use('/api/admin/auth', adminAuthRoutes)
// app.use('/api/admin', adminRoutes)

// // Scholarship Module Routes
// app.use('/api/scholarship/auth', require('./routes/scholarship/scholarshipAuthRoutes'));
// app.use('/api/scholarship/enrollment', require('./routes/scholarship/scholarshipEnrollmentRoutes'));
// app.use('/api/scholarship/admin', require('./routes/scholarship/scholarshipAdminRoutes'));
// app.use('/api/scholarship/dashboard', require('./routes/scholarship/scholarshipDashboardRoutes'));
// app.use('/api/scholarship/tutor', require('./routes/scholarship/scholarshipTutorRoutes'));

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

// // Port Configuration & Server Startup
// const PORT = process.env.PORT || 5000

// // Start the server
// app.listen(PORT, () => {
//   console.log(
//     `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`,
//   )
//   console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`)

//   // Start the automated token cleanup cron job
//   initTokenCleanupCron()
// })




// // src/server.js
// const express = require('express')
// const cors = require('cors')
// const helmet = require('helmet')
// require('dotenv').config()

// // Import database connection and Swagger documentation setup
// const db = require('./config/db')
// const { swaggerDocs } = require('./config/swagger')
// const { initTokenCleanupCron } = require('./utils/tokenCleanup')

// const app = express()

// // Security & Utility Middleware
// app.use(helmet())

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

// // Import General Routes
// const authRoutes = require('./routes/authRoutes')
// const paymentRoutes = require('./routes/paymentRoutes')
// const enrollmentRoutes = require('./routes/enrollmentRoutes')
// const dashboardRoutes = require('./routes/dashboardRoutes')
// const adminAuthRoutes = require('./routes/adminAuthRoutes')
// const adminRoutes = require('./routes/adminRoutes')
// const systemRoutes = require('./routes/systemRoutes')
// const tutorRoutes = require('./routes/tutorRoutes')

// // Import Scholarship Routes
// const scholarshipAuthRoutes = require('./routes/scholarship/scholarshipAuthRoutes')
// const scholarshipEnrollmentRoutes = require('./routes/scholarship/scholarshipEnrollmentRoutes')
// const scholarshipAdminRoutes = require('./routes/scholarship/scholarshipAdminRoutes')
// const scholarshipDashboardRoutes = require('./routes/scholarship/scholarshipDashboardRoutes')
// const scholarshipTutorRoutes = require('./routes/scholarship/scholarshipTutorRoutes')

// // Mount System Routes (Handles root '/' and '/health')
// app.use('/', systemRoutes)

// // Mount Feature & API Routes
// app.use('/api/auth', authRoutes)
// app.use('/api/payments', paymentRoutes)
// app.use('/api/enrollments', enrollmentRoutes)
// app.use('/api/dashboard', dashboardRoutes)
// app.use('/api/tutor', tutorRoutes)

// // Mount Admin Routes
// app.use('/api/admin/auth', adminAuthRoutes)
// app.use('/api/admin', adminRoutes)

// // Mount Scholarship Module Routes
// app.use('/api/scholarship/auth', scholarshipAuthRoutes)
// app.use('/api/scholarship/enrollment', scholarshipEnrollmentRoutes)
// app.use('/api/scholarship/admin', scholarshipAdminRoutes)
// app.use('/api/scholarship/dashboard', scholarshipDashboardRoutes)
// app.use('/api/scholarship/tutor', scholarshipTutorRoutes)

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

// // Port Configuration & Server Startup
// const PORT = process.env.PORT || 5000

// // Start the server
// app.listen(PORT, () => {
//   console.log(
//     `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`,
//   )
//   console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`)

//   // Start the automated token cleanup cron job
//   initTokenCleanupCron()
// })


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

// Security & Utility Middleware
app.use(helmet())
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

// Mount System Routes (Handles root '/' and '/health')
app.use('/', systemRoutes)

// Mount Core API Routes (Unified Students, Tutors, and General Features)
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/dashboard', dashboardRoutes) // Handles all student dashboards (Normal & Scholarship)
app.use('/api/tutors', tutorRoutes)        // Handles all tutor workflows & assigned cohort students

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

// Start the server
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`,
  )
  console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`)

  // Start the automated token cleanup cron job
  initTokenCleanupCron()
})