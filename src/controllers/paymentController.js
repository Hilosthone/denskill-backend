// const axios = require('axios')

// // @desc    Initialize Paystack Transaction
// // @route   POST /api/payments/initialize
// // @access  Private / Public
// exports.initializePayment = async (req, res) => {
//   try {
//     const { email, amount, callback_url } = req.body

//     if (!email || !amount) {
//       return res.status(400).json({ error: 'Please provide email and amount.' })
//     }

//     // Paystack expects amount in kobo (e.g., ₦1,000 = 100000 kobo)
//     const response = await axios.post(
//       'https://api.paystack.co/transaction/initialize',
//       {
//         email,
//         amount,
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

// @desc    Initialize Paystack Transaction
// @route   POST /api/payments/initialize
// @access  Private / Public
exports.initializePayment = async (req, res) => {
  try {
    const { email, amount, callback_url, convertToKobo = true } = req.body

    if (!email || !amount) {
      return res.status(400).json({ error: 'Please provide email and amount.' })
    }

    // Paystack expects amount in kobo. 
    // If your frontend passes standard Naira (e.g., 5000), this converts it to kobo (500000).
    // Set convertToKobo: false in your request body if your frontend already sends kobo directly.
    const finalAmount = convertToKobo ? Math.round(Number(amount) * 100) : Number(amount)

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: finalAmount,
        callback_url,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    res.status(200).json({
      status: 'success',
      data: response.data.data, // Contains authorization_url and reference
    })
  } catch (err) {
    console.error('Paystack Init Error:', err.response?.data || err.message)
    res
      .status(500)
      .json({ error: 'Failed to initialize payment with Paystack.' })
  }
}

// @desc    Verify Paystack Transaction
// @route   GET /api/payments/verify/:reference
// @access  Private / Public
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params

    if (!reference) {
      return res
        .status(400)
        .json({ error: 'Transaction reference is required.' })
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    )

    const paymentData = response.data.data

    if (paymentData.status === 'success') {
      return res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully!',
        data: paymentData,
      })
    } else {
      return res.status(400).json({
        status: 'failed',
        message: 'Payment verification failed.',
        data: paymentData,
      })
    }
  } catch (err) {
    console.error('Paystack Verify Error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Error verifying payment.' })
  }
}