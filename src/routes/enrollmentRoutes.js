// // enrollmentRoutes.js
// const express = require('express')
// const router = express.Router()
// const {
//   initializeEnrollment,
//   initializeInstallmentPayment,
//   verifyEnrollmentPayment,
//   setPassword,
// } = require('../controllers/enrollmentController')
// const { protect } = require('../middleware/authMiddleware')

// /**
//  * @swagger
//  * /api/enrollments/initialize:
//  *   post:
//  *     summary: Register student details and initialize Paystack payment
//  *     tags: [Enrollments]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - firstName
//  *               - lastName
//  *               - country
//  *               - phone
//  *               - email
//  *               - course
//  *             properties:
//  *               firstName:
//  *                 type: string
//  *               middleName:
//  *                 type: string
//  *               lastName:
//  *                 type: string
//  *               country:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               course:
//  *                 type: string
//  *               reason:
//  *                 type: string
//  *               referredBy:
//  *                 type: string
//  *               amountPaid:
//  *                 type: number
//  *               callback_url:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Paystack checkout authorization URL generated successfully.
//  *       400:
//  *         description: Validation error or missing fields.
//  */
// router.post('/initialize', initializeEnrollment)

// /**
//  * @swagger
//  * /api/enrollments/pay-installment:
//  *   post:
//  *     summary: Initialize subsequent installment payment for a logged-in student
//  *     tags: [Enrollments]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - course
//  *               - amountPayable
//  *             properties:
//  *               course:
//  *                 type: string
//  *               amountPayable:
//  *                 type: number
//  *               callback_url:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Installment Paystack checkout link generated successfully.
//  *       400:
//  *         description: Validation error or amount exceeds remaining balance.
//  */
// router.post('/pay-installment', protect, initializeInstallmentPayment)

// /**
//  * @swagger
//  * /api/enrollments/verify/{reference}:
//  *   get:
//  *     summary: Verify Paystack transaction and finalize enrollment tracking
//  *     tags: [Enrollments]
//  *     parameters:
//  *       - in: path
//  *         name: reference
//  *         required: false
//  *         schema:
//  *           type: string
//  *         description: Paystack payment transaction reference
//  *     responses:
//  *       200:
//  *         description: Payment verified successfully.
//  *       400:
//  *         description: Payment verification failed.
//  */
// router.get('/verify', verifyEnrollmentPayment)
// router.get('/verify/:reference', verifyEnrollmentPayment)

// /**
//  * @swagger
//  * /api/enrollments/set-password:
//  *   post:
//  *     summary: Set password after successful enrollment payment
//  *     tags: [Enrollments]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - password
//  *               - confirmPassword
//  *             properties:
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *               confirmPassword:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password set successfully.
//  *       400:
//  *         description: Passwords do not match or missing fields.
//  */
// router.post('/set-password', setPassword)

// module.exports = router


// enrollmentRoutes.js
const express = require('express')
const router = express.Router()
const {
  initializeEnrollment,
  initializeInstallmentPayment,
  verifyEnrollmentPayment,
  setPassword,
  getInstallmentStatus,
} = require('../controllers/enrollmentController')
const { protect } = require('../middleware/authMiddleware') 

/**
 * @swagger
 * /api/enrollments/initialize:
 *   post:
 *     summary: Register student details and initialize Paystack payment
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - country
 *               - phone
 *               - email
 *               - course
 *             properties:
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               course:
 *                 type: string
 *               reason:
 *                 type: string
 *               referredBy:
 *                 type: string
 *               amountPaid:
 *                 type: number
 *               callback_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paystack checkout authorization URL generated successfully.
 *       400:
 *         description: Validation error or missing fields.
 */
router.post('/initialize', initializeEnrollment)

/**
 * @swagger
 * /api/enrollments/pay-installment:
 *   post:
 *     summary: Initialize subsequent installment payment for a logged-in student
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course
 *               - amountPayable
 *             properties:
 *               course:
 *                 type: string
 *               amountPayable:
 *                 type: number
 *               callback_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Installment Paystack checkout link generated successfully.
 *       400:
 *         description: Validation error or amount exceeds remaining balance.
 */
router.post('/pay-installment', protect, initializeInstallmentPayment)

/**
 * @swagger
 * /api/enrollments/installment-status/{course}:
 *   get:
 *     summary: Get student installment breakdown status and timeline health
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the course
 *     responses:
 *       200:
 *         description: Installment breakdown fetched successfully.
 *       404:
 *         description: Enrollment record not found.
 */
router.get('/installment-status/:course', protect, getInstallmentStatus) // <-- 2. Add the route here

/**
 * @swagger
 * /api/enrollments/verify/{reference}:
 *   get:
 *     summary: Verify Paystack transaction and finalize enrollment tracking
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: false
 *         schema:
 *           type: string
 *         description: Paystack payment transaction reference
 *     responses:
 *       200:
 *         description: Payment verified successfully.
 *       400:
 *         description: Payment verification failed.
 */
router.get('/verify', verifyEnrollmentPayment)
router.get('/verify/:reference', verifyEnrollmentPayment)

/**
 * @swagger
 * /api/enrollments/set-password:
 *   post:
 *     summary: Set password after successful enrollment payment
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password set successfully.
 *       400:
 *         description: Passwords do not match or missing fields.
 */
router.post('/set-password', setPassword)

module.exports = router