// src/controllers/scholarship/scholarshipEnrollmentController.js
const db = require('../../config/db')

/**
 * @swagger
 * /api/scholarship/enrollment/cohorts/active:
 *   get:
 *     summary: Get active scholarship cohorts
 *     tags: [Scholarship Enrollment]
 *     responses:
 *       200:
 *         description: List of open cohorts retrieved successfully
 *       500:
 *         description: Server error fetching cohorts
 */
exports.getActiveCohorts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM scholarship_cohorts WHERE status = 'APPLICATION_OPEN' ORDER BY start_date ASC`,
    )
    res.status(200).json({ success: true, cohorts: result.rows })
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching cohorts' })
  }
}

/**
 * @swagger
 * /api/scholarship/enrollment/apply:
 *   post:
 *     summary: Submit a new scholarship application
 *     tags: [Scholarship Enrollment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cohortId
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - country
 *               - course
 *             properties:
 *               cohortId:
 *                 type: integer
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               country:
 *                 type: string
 *               course:
 *                 type: string
 *               educationalBackground:
 *                 type: string
 *               technicalBackground:
 *                 type: string
 *               reasonForApplying:
 *                 type: string
 *               motivation:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Scholarship application submitted successfully
 *       400:
 *         description: Invalid input or duplicate application
 *       500:
 *         description: Server error processing scholarship application
 */
exports.submitApplication = async (req, res) => {
  const {
    cohortId,
    firstName,
    lastName,
    email,
    phone,
    country,
    course,
    educationalBackground,
    technicalBackground,
    reasonForApplying,
    motivation,
    portfolioUrl,
  } = req.body

  try {
    // 1. Check if cohort exists and is open
    const cohortCheck = await db.query(
      `SELECT * FROM scholarship_cohorts WHERE id = $1 AND status = 'APPLICATION_OPEN'`,
      [cohortId],
    )

    if (cohortCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected cohort is not open for applications.',
      })
    }

    // 2. Check if email already applied for this cohort
    const existingApp = await db.query(
      `SELECT * FROM scholarship_applications WHERE email = $1 AND cohort_id = $2`,
      [email, cohortId],
    )

    if (existingApp.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          'An application with this email already exists for this cohort.',
      })
    }

    // 3. Insert application
    const insertQuery = `
      INSERT INTO scholarship_applications 
      (cohort_id, first_name, last_name, email, phone, country, course, educational_background, technical_background, reason_for_applying, motivation, portfolio_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING')
      RETURNING *;
    `

    const values = [
      cohortId,
      firstName,
      lastName,
      email,
      phone,
      country,
      course,
      educationalBackground,
      technicalBackground,
      reasonForApplying,
      motivation,
      portfolioUrl,
    ]

    const newApp = await db.query(insertQuery, values)

    res.status(201).json({
      success: true,
      message:
        'Scholarship application submitted successfully! Our team will review your details.',
      application: newApp.rows[0],
    })
  } catch (error) {
    console.error('Error submitting scholarship application:', error)
    res.status(500).json({
      success: false,
      message: 'Server error processing scholarship application',
    })
  }
}

/**
 * @swagger
 * /api/scholarship/enrollment/status:
 *   get:
 *     summary: Check scholarship application status
 *     tags: [Scholarship Enrollment]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application status retrieved successfully
 *       400:
 *         description: Email query parameter is required
 *       404:
 *         description: No scholarship applications found for this email
 *       500:
 *         description: Server error retrieving status
 */
exports.getApplicationStatus = async (req, res) => {
  const { email } = req.query

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: 'Email query parameter is required' })
  }

  try {
    const result = await db.query(
      `SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code 
       FROM scholarship_applications sa
       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
       WHERE sa.email = $1 ORDER BY sa.created_at DESC`,
      [email],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No scholarship applications found for this email.',
      })
    }

    res.status(200).json({ success: true, applications: result.rows })
  } catch (error) {
    console.error('Error fetching application status:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error retrieving status' })
  }
}
