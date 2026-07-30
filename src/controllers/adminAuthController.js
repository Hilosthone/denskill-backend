// // src/controllers/adminAuthController.js
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs') // Or use direct comparison if storing plaintext, but hashing is recommended

// // Hardcoded admin credentials as requested
// const ADMIN_CREDENTIALS = {
//   email: 'lluxury692@gmail.com',
//   // In a production app, you'd store a hashed password.
//   // For this direct setup, we verify against the provided password.
//   password: 'admin@deskill123',
//   role: 'admin',
//   name: 'System Admin',
// }

// // @desc    Admin login
// // @route   POST /api/admin/auth/login
// // @access  Public
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Please provide email and password' })
//     }

//     // Check credentials against hardcoded admin profile
//     if (
//       email !== ADMIN_CREDENTIALS.email ||
//       password !== ADMIN_CREDENTIALS.password
//     ) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'Invalid admin credentials' })
//     }

//     // Generate JWT token specifically for admin
//     const token = jwt.sign(
//       { email: ADMIN_CREDENTIALS.email, role: ADMIN_CREDENTIALS.role },
//       process.env.JWT_SECRET || 'fallback_secret',
//       { expiresIn: '7d' },
//     )

//     return res.status(200).json({
//       success: true,
//       message: 'Admin logged in successfully',
//       token,
//       admin: {
//         name: ADMIN_CREDENTIALS.name,
//         email: ADMIN_CREDENTIALS.email,
//         role: ADMIN_CREDENTIALS.role,
//       },
//     })
//   } catch (error) {
//     console.error('Admin login error:', error)
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error during admin login' })
//   }
// }

// module.exports = {
//   adminLogin,
// }
