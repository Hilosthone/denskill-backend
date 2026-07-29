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
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Import Routes
const authRoutes = require('./routes/authRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const adminRoutes = require('./routes/adminRoutes')

// Mount Routes
app.use('/api/auth', authRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/admin', adminRoutes)

// Initialize Swagger Documentation UI
swaggerDocs(app)

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'D Enskill Academy Backend is running live 🚀',
    timestamp: new Date().toISOString(),
  })
})

// Base route test
app.get('/', (req, res) => {
  res.send('Denskill Backend API is running...')
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
