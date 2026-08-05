// src/services/flutterwaveService.js
const axios = require('axios')

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY

/**
 * Initialize a Flutterwave payment link (Standard Hosted Checkout)
 * @param {Object} paymentData - Contains amount, currency, tx_ref, customer details, redirect_url, etc.
 */
const initializeFlutterwavePayment = async (paymentData) => {
  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error(
      'Flutterwave Initialization Error:',
      error.response?.data || error.message,
    )
    throw new Error(
      error.response?.data?.message ||
        'Failed to initialize Flutterwave payment',
    )
  }
}

/**
 * Verify a Flutterwave transaction by its unique Transaction ID
 * @param {String|Number} transactionId - The ID returned by Flutterwave upon completion
 */
const verifyFlutterwavePayment = async (transactionId) => {
  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      },
    )
    return response.data
  } catch (error) {
    console.error(
      'Flutterwave Verification Error:',
      error.response?.data || error.message,
    )
    throw new Error(
      error.response?.data?.message || 'Failed to verify Flutterwave payment',
    )
  }
}

module.exports = {
  initializeFlutterwavePayment,
  verifyFlutterwavePayment,
}