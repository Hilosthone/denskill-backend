// const express = require('express')
// const router = express.Router()
// const {
//   signup,
//   signin,
//   logout,
//   forgotPassword,
//   resetPassword,
// } = require('../controllers/authController')
// const { verifyToken, protect } = require('../middleware/authMiddleware')

// // POST /api/auth/signup
// router.post('/signup', signup)

// // POST /api/auth/signin
// router.post('/signin', signin)

// // POST /api/auth/logout
// router.post('/logout', protect, logout)

// // POST /api/auth/forgot-password
// router.post('/forgot-password', forgotPassword)

// // POST /api/auth/reset-password
// router.post('/reset-password', resetPassword)

// module.exports = router

// /**
//  * @swagger
//  * /api/auth/signup:
//  *   post:
//  *     summary: Register a new user
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: User registered successfully
//  */

// /**
//  * @swagger
//  * /api/auth/signin:
//  *   post:
//  *     summary: Log in a user
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Logged in successfully
//  */

// /**
//  * @swagger
//  * /api/auth/logout:
//  *   post:
//  *     summary: Log out a user
//  *     tags: [Auth]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Logged out successfully
//  */

// /**
//  * @swagger
//  * /api/auth/forgot-password:
//  *   post:
//  *     summary: Request password reset OTP
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password reset OTP sent to registered email
//  */

// /**
//  * @swagger
//  * /api/auth/reset-password:
//  *   post:
//  *     summary: Reset password using OTP
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               email:
//  *                 type: string
//  *               otp:
//  *                 type: string
//  *               newPassword:
//  *                 type: string
//  *               confirmPassword:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password reset successfully
//  */



//src/routes/authRoutes.js
const express = require('express')
const router = express.Router()
const {
  signup,
  signin,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// POST /api/auth/signup
router.post('/signup', signup)

// POST /api/auth/signin
router.post('/signin', signin)

// POST /api/auth/refresh
router.post('/refresh', refreshToken)

// POST /api/auth/logout
router.post('/logout', logout)

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword)

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword)

module.exports = router

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Log in a user and return access/refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange a valid refresh token for a new access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       403:
 *         description: Invalid or expired refresh token
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user and revoke refresh token session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset OTP sent to registered email
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */