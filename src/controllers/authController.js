// //src/controllers/authController.js
// const db = require('../config/db')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')
// const sendEmail = require('../utils/sendEmail')

// // @desc    Register a new user
// // @route   POST /api/auth/signup
// // @access  Public
// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body

//     // Validate required fields
//     if (!name || !email || !password) {
//       return res
//         .status(400)
//         .json({ error: 'Please provide name, email, and password.' })
//     }

//     // Check if user already exists
//     const userExists = await db.query('SELECT * FROM users WHERE email = $1', [
//       email,
//     ])
//     if (userExists.rows.length > 0) {
//       return res
//         .status(400)
//         .json({ error: 'User already exists with this email.' })
//     }

//     // Hash password securely
//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(password, salt)

//     // Insert user into database
//     const newUser = await db.query(
//       'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
//       [name, email, hashedPassword],
//     )

//     res.status(201).json({
//       message: 'User registered successfully!',
//       user: newUser.rows[0],
//     })
//   } catch (err) {
//     console.error('Signup Error:', err.message)
//     res.status(500).json({ error: 'Server error during registration.' })
//   }
// }

// // @desc    Authenticate user & get token
// // @route   POST /api/auth/signin
// // @access  Public
// exports.signin = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     // Validate required fields
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ error: 'Please provide email and password.' })
//     }

//     // Find user by email
//     const user = await db.query('SELECT * FROM users WHERE email = $1', [email])
//     if (user.rows.length === 0) {
//       return res.status(400).json({ error: 'Invalid email or password.' })
//     }

//     // Compare submitted password with hashed password
//     const isMatch = await bcrypt.compare(password, user.rows[0].password)
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid email or password.' })
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user.rows[0].id, email: user.rows[0].email },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
//     )

//     res.status(200).json({
//       message: 'Logged in successfully!',
//       token,
//       user: {
//         id: user.rows[0].id,
//         name: user.rows[0].name,
//         email: user.rows[0].email,
//       },
//     })
//   } catch (err) {
//     console.error('Signin Error:', err.message)
//     res.status(500).json({ error: 'Server error during login.' })
//   }
// }

// // @desc    Logout user
// // @route   POST /api/auth/logout
// // @access  Private
// exports.logout = async (req, res) => {
//   try {
//     return res.status(200).json({ message: 'Logged out successfully.' })
//   } catch (error) {
//     return res.status(500).json({ error: error.message })
//   }
// }

// // @desc    Request password reset OTP (must be a registered email)
// // @route   POST /api/auth/forgot-password
// // @access  Public
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body

//     if (!email) {
//       return res
//         .status(400)
//         .json({ error: 'Please provide your registered email address.' })
//     }

//     // 1. Verify user exists with this registered email
//     const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
//       email,
//     ])
//     if (userResult.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ error: 'No account found with this registered email address.' })
//     }

//     // 2. Generate 6-digit OTP and set 10-minute expiration
//     const otp = Math.floor(100000 + Math.random() * 900000).toString()
//     const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

//     // 3. Save OTP and expiration to database
//     await db.query(
//       'UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE email = $3',
//       [otp, otpExpires, email],
//     )

//     // 4. Send email with OTP via transporter
//     await sendEmail({
//       to: email,
//       subject: 'Password Reset OTP - Denskill',
//       text: `Hello,\n\nYour password reset OTP is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nDenskill Team`,
//     })

//     res.status(200).json({
//       status: 'success',
//       message: 'Password reset OTP has been sent to your registered email.',
//     })
//   } catch (err) {
//     console.error('Forgot Password Error:', err.message)
//     res
//       .status(500)
//       .json({ error: 'Server error while processing password reset request.' })
//   }
// }

// // @desc    Reset password using OTP and new password confirmation
// // @route   POST /api/auth/reset-password
// // @access  Public
// exports.resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword, confirmPassword } = req.body

//     if (!email || !otp || !newPassword || !confirmPassword) {
//       return res
//         .status(400)
//         .json({
//           error: 'Please provide email, OTP, new password, and confirmation.',
//         })
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ error: 'New passwords do not match.' })
//     }

//     // 1. Find user by email
//     const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
//       email,
//     ])
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: 'User account not found.' })
//     }

//     const user = userResult.rows[0]

//     // 2. Validate OTP correctness and expiration
//     if (
//       user.reset_otp !== otp ||
//       new Date() > new Date(user.reset_otp_expires)
//     ) {
//       return res
//         .status(400)
//         .json({ error: 'Invalid or expired password reset OTP.' })
//     }

//     // 3. Hash the new password securely
//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(newPassword, salt)

//     // 4. Update password and clear OTP fields
//     await db.query(
//       'UPDATE users SET password = $1, reset_otp = NULL, reset_otp_expires = NULL WHERE email = $2',
//       [hashedPassword, email],
//     )

//     res.status(200).json({
//       status: 'success',
//       message:
//         'Password reset successfully! You can now sign in with your new password.',
//     })
//   } catch (err) {
//     console.error('Reset Password Error:', err.message)
//     res.status(500).json({ error: 'Server error while resetting password.' })
//   }
// }


//src/controllers/authController.js
const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')

// Helper: Generate Short-lived Access Token (15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'student' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '15m' }
  )
}

// Helper: Generate Long-lived Refresh Token (7 days) & Store in DB
const generateRefreshToken = async (user) => {
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'student' },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' }
  )

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) 
     VALUES ($1, $2, $3)`,
    [user.id, refreshToken, expiresAt]
  )

  return refreshToken
}

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide name, email, and password.' })
    }

    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'User already exists with this email.' })
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user into database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword],
    )

    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0],
    })
  } catch (err) {
    console.error('Signup Error:', err.message)
    res.status(500).json({ error: 'Server error during registration.' })
  }
}

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/signin
// @access  Public
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide email and password.' })
    }

    // Find user by email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' })
    }

    const user = userResult.rows[0]

    // Compare submitted password with hashed password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' })
    }

    // Generate Access & Refresh tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = await generateRefreshToken(user)

    res.status(200).json({
      message: 'Logged in successfully!',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'student',
      },
    })
  } catch (err) {
    console.error('Signin Error:', err.message)
    res.status(500).json({ error: 'Server error during login.' })
  }
}

// @desc    Exchange refresh token for a new access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Refresh token required' })
    }

    // 1. Check if token exists in database
    const dbResult = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    )

    if (dbResult.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'Invalid or expired refresh token' })
    }

    const tokenRecord = dbResult.rows[0]

    // 2. Check if token has expired in DB
    if (new Date() > new Date(tokenRecord.expires_at)) {
      await db.query('DELETE FROM refresh_tokens WHERE id = $1', [tokenRecord.id])
      return res.status(403).json({ success: false, error: 'Refresh token has expired' })
    }

    // 3. Verify JWT signature of the refresh token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ success: false, error: 'Invalid refresh token signature' })
        }

        // 4. Issue a new Access Token
        const newAccessToken = generateAccessToken({
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        })

        return res.status(200).json({
          success: true,
          accessToken: newAccessToken,
        })
      }
    )
  } catch (err) {
    console.error('Refresh Token Error:', err)
    return res.status(500).json({ success: false, error: 'Server error during token refresh' })
  }
}

// @desc    Logout user & revoke refresh token session
// @route   POST /api/auth/logout
// @access  Public / Private
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    }

    return res.status(200).json({ message: 'Logged out successfully.' })
  } catch (error) {
    console.error('Logout Error:', error.message)
    return res.status(500).json({ error: error.message })
  }
}

// @desc    Request password reset OTP (must be a registered email)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res
        .status(400)
        .json({ error: 'Please provide your registered email address.' })
    }

    // 1. Verify user exists with this registered email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No account found with this registered email address.' })
    }

    // 2. Generate 6-digit OTP and set 10-minute expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

    // 3. Save OTP and expiration to database
    await db.query(
      'UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE email = $3',
      [otp, otpExpires, email],
    )

    // 4. Send email with OTP via transporter
    await sendEmail({
      to: email,
      subject: 'Password Reset OTP - Denskill',
      text: `Hello,\n\nYour password reset OTP is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.\n\nBest regards,\nDenskill Team`,
    })

    res.status(200).json({
      status: 'success',
      message: 'Password reset OTP has been sent to your registered email.',
    })
  } catch (err) {
    console.error('Forgot Password Error:', err.message)
    res
      .status(500)
      .json({ error: 'Server error while processing password reset request.' })
  }
}

// @desc    Reset password using OTP and new password confirmation
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({
          error: 'Please provide email, OTP, new password, and confirmation.',
        })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match.' })
    }

    // 1. Find user by email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' })
    }

    const user = userResult.rows[0]

    // 2. Validate OTP correctness and expiration
    if (
      user.reset_otp !== otp ||
      new Date() > new Date(user.reset_otp_expires)
    ) {
      return res
        .status(400)
        .json({ error: 'Invalid or expired password reset OTP.' })
    }

    // 3. Hash the new password securely
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // 4. Update password and clear OTP fields
    await db.query(
      'UPDATE users SET password = $1, reset_otp = NULL, reset_otp_expires = NULL WHERE email = $2',
      [hashedPassword, email],
    )

    res.status(200).json({
      status: 'success',
      message:
        'Password reset successfully! You can now sign in with your new password.',
    })
  } catch (err) {
    console.error('Reset Password Error:', err.message)
    res.status(500).json({ error: 'Server error while resetting password.' })
  }
}