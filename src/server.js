// src/server.js
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

// Import database connection and Swagger documentation setup
const db = require('./config/db')
const { swaggerDocs } = require('./config/swagger')

const app = express()

// Security & Utility Middleware
app.use(helmet())

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

// Import Routes
const authRoutes = require('./routes/authRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const adminAuthRoutes = require('./routes/adminAuthRoutes')
const adminRoutes = require('./routes/adminRoutes')
const systemRoutes = require('./routes/systemRoutes')

// Mount System Routes (Handles root '/' and '/health')
app.use('/', systemRoutes)

// Mount Feature & API Routes
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Mount Admin Routes
app.use('/api/admin/auth', adminAuthRoutes)
app.use('/api/admin', adminRoutes)

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
})
