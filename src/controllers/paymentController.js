// // src/controllers/paymentController.js
// const axios = require('axios')

// // @desc    Initialize Paystack Transaction
// // @route   POST /api/payments/initialize
// // @access  Private / Public
// exports.initializePayment = async (req, res) => {
//   try {
//     const { email, amount, callback_url, convertToKobo = true } = req.body

//     if (!email || !amount) {
//       return res.status(400).json({ error: 'Please provide email and amount.' })
//     }

//     // Paystack expects amount in kobo.
//     // If your frontend passes standard Naira (e.g., 5000), this converts it to kobo (500000).
//     // Set convertToKobo: false in your request body if your frontend already sends kobo directly.
//     const finalAmount = convertToKobo ? Math.round(Number(amount) * 100) : Number(amount)

//     const response = await axios.post(
//       'https://api.paystack.co/transaction/initialize',
//       {
//         email,
//         amount: finalAmount,
//         callback_url,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       },
//     )

//     res.status(200).json({
//       status: 'success',
//       data: response.data.data, // Contains authorization_url and reference
//     })
//   } catch (err) {
//     console.error('Paystack Init Error:', err.response?.data || err.message)
//     res
//       .status(500)
//       .json({ error: 'Failed to initialize payment with Paystack.' })
//   }
// }

// // @desc    Verify Paystack Transaction
// // @route   GET /api/payments/verify/:reference
// // @access  Private / Public
// exports.verifyPayment = async (req, res) => {
//   try {
//     const { reference } = req.params

//     if (!reference) {
//       return res
//         .status(400)
//         .json({ error: 'Transaction reference is required.' })
//     }

//     const response = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       },
//     )

//     const paymentData = response.data.data

//     if (paymentData.status === 'success') {
//       return res.status(200).json({
//         status: 'success',
//         message: 'Payment verified successfully!',
//         data: paymentData,
//       })
//     } else {
//       return res.status(400).json({
//         status: 'failed',
//         message: 'Payment verification failed.',
//         data: paymentData,
//       })
//     }
//   } catch (err) {
//     console.error('Paystack Verify Error:', err.response?.data || err.message)
//     res.status(500).json({ error: 'Error verifying payment.' })
//   }
// }

// src/controllers/paymentController.js
const axios = require('axios')
const { initializeFlutterwavePayment, verifyFlutterwavePayment } = require('../services/flutterwaveService')

// ==========================================
// FLUTTERWAVE METHODS
// ==========================================

// @desc    Initialize Flutterwave Transaction
// @route   POST /api/payments/flutterwave/initialize
// @access  Private / Public
exports.initiateFlutterwave = async (req, res) => {
  try {
    const { amount, email, name, phone, redirect_url } = req.body

    if (!email || !amount) {
      return res.status(400).json({ error: 'Please provide email and amount.' })
    }

    const tx_ref = `flw_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    const payload = {
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url:
        redirect_url || `${process.env.FRONTEND_URL}/payment/verify`,
      customer: {
        email,
        name: name || email,
        phonenumber: phone || '',
      },
      customizations: {
        title: 'D Enskill Academy',
        description: 'Course Enrollment Payment',
        logo: 'https://www.denskill.com/denskill.png',
      },
    }

    const response = await initializeFlutterwavePayment(payload)

    if (response.status === 'success') {
      return res.status(200).json({
        status: 'success',
        message: 'Flutterwave payment link generated successfully',
        paymentLink: response.data.link,
        tx_ref,
      })
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Could not generate payment link from Flutterwave',
        details: response.message,
      })
    }
  } catch (err) {
    console.error('Flutterwave Init Controller Error:', err.message)
    res.status(500).json({ error: 'Failed to initialize payment with Flutterwave.' })
  }
}

// @desc    Verify Flutterwave Transaction
// @route   GET /api/payments/flutterwave/verify
// @access  Private / Public
exports.verifyFlutterwave = async (req, res) => {
  try {
    const { transaction_id } = req.query

    if (!transaction_id) {
      return res.status(400).json({ error: 'Transaction ID is required.' })
    }

    const response = await verifyFlutterwavePayment(transaction_id)

    if (
      response.status === 'success' &&
      response.data.status === 'successful'
    ) {
      return res.status(200).json({
        status: 'success',
        message: 'Flutterwave payment verified successfully!',
        data: response.data,
      })
    } else {
      return res.status(400).json({
        status: 'failed',
        message: 'Flutterwave payment verification failed or was not successful.',
        data: response.data,
      })
    }
  } catch (err) {
    console.error('Flutterwave Verify Controller Error:', err.message)
    res.status(500).json({ error: 'Error verifying Flutterwave payment.' })
  }
}