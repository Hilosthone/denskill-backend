// // src/controllers/scholarship/scholarshipAuthController.js
// const db = require('../../config/db')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')

// /**
//  * @swagger
//  * /api/scholarship/auth/login:
//  *   post:
//  *     summary: Scholarship student login
//  *     tags: [Scholarship Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - password
//  *             properties:
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Login successful
//  *       400:
//  *         description: Please provide both email and password
//  *       401:
//  *         description: Invalid scholarship credentials or account not found
//  *       500:
//  *         description: Server error during login
//  */
// exports.scholarshipLogin = async (req, res) => {
//   const { email, password } = req.body

//   if (!email || !password) {
//     return res.status(400).json({
//       success: false,
//       message: 'Please provide both email and password.',
//     })
//   }

//   try {
//     const result = await db.query(
//       `SELECT u.*, sc.name as cohort_name, sc.code as cohort_code, sc.status as cohort_status
//        FROM users u
//        LEFT JOIN scholarship_cohorts sc ON u.cohort_id = sc.id
//        WHERE u.email = $1 AND u.student_type = 'SCHOLARSHIP'`,
//       [email],
//     )

//     if (result.rows.length === 0) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid scholarship credentials or account not found.',
//       })
//     }

//     const user = result.rows[0]

//     const isMatch = await bcrypt.compare(password, user.password)
//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'Invalid scholarship credentials.' })
//     }

//     const token = jwt.sign(
//       {
//         id: user.id,
//         email: user.email,
//         role: user.role || 'student',
//         studentType: 'SCHOLARSHIP',
//         cohortId: user.cohort_id,
//       },
//       process.env.JWT_SECRET || 'fallback_secret',
//       { expiresIn: '7d' },
//     )

//     res.status(200).json({
//       success: true,
//       message: 'Login successful!',
//       token,
//       user: {
//         id: user.id,
//         firstName: user.first_name,
//         lastName: user.last_name,
//         email: user.email,
//         studentType: user.student_type,
//         scholarshipStatus: user.scholarship_status,
//         cohort: {
//           id: user.cohort_id,
//           name: user.cohort_name,
//           code: user.cohort_code,
//         },
//       },
//     })
//   } catch (error) {
//     console.error('Error during scholarship login:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error during login' })
//   }
// }


// src/controllers/scholarship/scholarshipAuthController.js
const db = require('../../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Helper: Generate Custom Scholarship Student ID (e.g., DEN-SCH-C1-001)
const generateScholarshipStudentId = async (cohortId) => {
  // 1. Fetch cohort code (e.g., 'C1', 'C2') from database
  const cohortResult = await db.query(
    'SELECT code FROM scholarship_cohorts WHERE id = $1',
    [cohortId],
  )
  const cohortCode =
    cohortResult.rows.length > 0 ? cohortResult.rows[0].code : 'C1'

  // 2. Count existing scholarship students in this specific cohort
  const countResult = await db.query(
    `SELECT COUNT(*) FROM users WHERE student_type = 'SCHOLARSHIP' AND cohort_id = $1`,
    [cohortId],
  )
  const count = parseInt(countResult.rows[0].count, 10) + 1
  const paddedNumber = String(count).padStart(3, '0')

  return `DEN-SCH-${cohortCode}-${paddedNumber}`
}

/**
 * @swagger
 * /api/scholarship/auth/signup:
 *   post:
 *     summary: Register a new scholarship student
 *     tags: [Scholarship Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - cohort_id
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               cohort_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Scholarship student registered successfully
 *       400:
 *         description: Missing fields or user already exists
 *       500:
 *         description: Server error during registration
 */
exports.scholarshipSignup = async (req, res) => {
  try {
    const { name, email, password, cohort_id } = req.body

    // Validate required fields
    if (!name || !email || !password || !cohort_id) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, password, and cohort_id.',
      })
    }

    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: 'User already exists with this email.' })
    }

    // Verify cohort exists
    const cohortCheck = await db.query(
      'SELECT * FROM scholarship_cohorts WHERE id = $1',
      [cohort_id],
    )
    if (cohortCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: 'Invalid scholarship cohort ID.' })
    }

    // Generate dynamic cohort-specific student ID (e.g., DEN-SCH-C1-001)
    const studentIdNumber = await generateScholarshipStudentId(cohort_id)

    // Hash password securely
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert scholarship user into database
    const newUser = await db.query(
      `INSERT INTO users (name, email, password, student_type, cohort_id, student_id_number, scholarship_status) 
       VALUES ($1, $2, $3, 'SCHOLARSHIP', $4, $5, 'ACTIVE') 
       RETURNING id, name, email, student_type, cohort_id, student_id_number, created_at`,
      [name, email, hashedPassword, cohort_id, studentIdNumber],
    )

    res.status(201).json({
      success: true,
      message: 'Scholarship student registered successfully!',
      user: newUser.rows[0],
    })
  } catch (err) {
    console.error('Scholarship Signup Error:', err.message)
    res
      .status(500)
      .json({ success: false, error: 'Server error during registration.' })
  }
}

/**
 * @swagger
 * /api/scholarship/auth/login:
 *   post:
 *     summary: Scholarship student login
 *     tags: [Scholarship Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Please provide both email and password
 *       401:
 *         description: Invalid scholarship credentials or account not found
 *       500:
 *         description: Server error during login
 */
exports.scholarshipLogin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    })
  }

  try {
    const result = await db.query(
      `SELECT u.*, sc.name as cohort_name, sc.code as cohort_code, sc.status as cohort_status 
       FROM users u
       LEFT JOIN scholarship_cohorts sc ON u.cohort_id = sc.id
       WHERE u.email = $1 AND u.student_type = 'SCHOLARSHIP'`,
      [email],
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid scholarship credentials or account not found.',
      })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid scholarship credentials.' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role || 'student',
        studentType: 'SCHOLARSHIP',
        cohortId: user.cohort_id,
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' },
    )

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studentType: user.student_type,
        studentIdNumber: user.student_id_number,
        scholarshipStatus: user.scholarship_status,
        cohort: {
          id: user.cohort_id,
          name: user.cohort_name,
          code: user.cohort_code,
        },
      },
    })
  } catch (error) {
    console.error('Error during scholarship login:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error during login' })
  }
}