// const express = require('express')
// const router = express.Router()
// const {
//   initializePayment,
//   verifyPayment,
// } = require('../controllers/paymentController')

// // POST /api/payments/initialize
// router.post('/initialize', initializePayment)

// // GET /api/payments/verify/:reference
// router.get('/verify/:reference', verifyPayment)

// module.exports = router

// src/routes/paymentRoutes.js
const express = require('express')
const router = express.Router()
const {
  initiateFlutterwave,
  verifyFlutterwave,
} = require('../controllers/paymentController')

// ==========================================
// FLUTTERWAVE ROUTES
// ==========================================

// POST /api/payments/flutterwave/initialize
router.post('/flutterwave/initialize', initiateFlutterwave)

// GET /api/payments/flutterwave/verify
router.get('/flutterwave/verify', verifyFlutterwave)

module.exports = router