const express = require('express')
const router = express.Router()
const {
  initializePayment,
  verifyPayment,
} = require('../controllers/paymentController')

// POST /api/payments/initialize
router.post('/initialize', initializePayment)

// GET /api/payments/verify/:reference
router.get('/verify/:reference', verifyPayment)

module.exports = router
