// // src/controllers/scholarship/scholarshipEnrollmentController.js
// const db = require('../../config/db')
// const bcrypt = require('bcryptjs')
// const axios = require('axios')

// // Universal scholarship pricing constants per the technical design
// const SCHOLARSHIP_ORIGINAL_FEE = 80000;
// const SCHOLARSHIP_STUDENT_CONTRIBUTION = 16000;
// const SCHOLARSHIP_DISCOUNT_AMOUNT = 64000;

// // Helper to get Flutterwave secret key dynamically
// const getFlwSecretKey = () => process.env.FLW_SECRET_KEY || 'FLWSECK-a1e';

// /**
//  * Helper utility to normalize cohort database fields from snake_case
//  * to camelCase for safe consumption by frontend date parsers.
//  */
// const formatCohortResponse = (row) => {
//   if (!row) return null
//   return {
//     id: row.id,
//     name: row.name,
//     code: row.code,
//     status: row.status,
//     startDate: row.start_date,
//     endDate: row.end_date,
//     applicationOpenDate: row.application_open_date,
//     applicationCloseDate: row.application_close_date,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/enrollment/cohorts/active:
//  *  get:
//  *    summary: Get active scholarship cohorts
//  *    tags: [Scholarship Enrollment]
//  *    responses:
//  *      200:
//  *        description: List of open cohorts retrieved successfully
//  *      500:
//  *        description: Server error fetching cohorts
//  */
// exports.getActiveCohorts = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT * FROM scholarship_cohorts WHERE UPPER(status) = 'ACTIVE' ORDER BY start_date ASC`,
//     )
//     const formattedCohorts = result.rows.map(formatCohortResponse)
//     res.status(200).json({ success: true, cohorts: formattedCohorts })
//   } catch (error) {
//     console.error('Error fetching cohorts:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching cohorts' })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/enrollment/apply:
//  *  post:
//  *    summary: Submit a new scholarship application
//  *    tags: [Scholarship Enrollment]
//  *    requestBody:
//  *      required: true
//  *      content:
//  *        application/json:
//  *          schema:
//  *            type: object
//  *            required:
//  *              - cohortId
//  *              - firstName
//  *              - lastName
//  *              - email
//  *              - phone
//  *              - country
//  *              - course
//  *            properties:
//  *              cohortId:
//  *                type: integer
//  *              firstName:
//  *                type: string
//  *              lastName:
//  *                type: string
//  *              email:
//  *                type: string
//  *              phone:
//  *                type: string
//  *              country:
//  *                type: string
//  *              course:
//  *                type: string
//  *              educationalBackground:
//  *                type: string
//  *              technicalBackground:
//  *                type: string
//  *              reasonForApplying:
//  *                type: string
//  *              motivation:
//  *                type: string
//  *              portfolioUrl:
//  *                type: string
//  *    responses:
//  *      201:
//  *        description: Scholarship application submitted successfully
//  *      400:
//  *        description: Invalid input or duplicate application
//  *      500:
//  *        description: Server error processing scholarship application
//  */
// exports.submitApplication = async (req, res) => {
//   const {
//     cohortId,
//     firstName,
//     lastName,
//     email,
//     phone,
//     country,
//     course,
//     educationalBackground,
//     technicalBackground,
//     reasonForApplying,
//     motivation,
//     portfolioUrl,
//   } = req.body

//   try {
//     const cohortCheck = await db.query(
//       `SELECT * FROM scholarship_cohorts WHERE id = $1 AND UPPER(status) = 'ACTIVE'`,
//       [cohortId],
//     )

//     if (cohortCheck.rows.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Selected cohort is not open for applications.',
//       })
//     }

//     const existingApp = await db.query(
//       `SELECT * FROM scholarship_applications WHERE email = $1 AND cohort_id = $2`,
//       [email, cohortId],
//     )

//     if (existingApp.rows.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'An application with this email already exists for this cohort.',
//       })
//     }

//     const insertQuery = `
//       INSERT INTO scholarship_applications
//       (cohort_id, first_name, last_name, email, phone, country, course, educational_background, technical_background, reason_for_applying, motivation, portfolio_url, status)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING')
//       RETURNING *;
//     `

//     const values = [
//       cohortId,
//       firstName,
//       lastName,
//       email,
//       phone,
//       country,
//       course,
//       educationalBackground,
//       technicalBackground,
//       reasonForApplying,
//       motivation,
//       portfolioUrl,
//     ]

//     const newApp = await db.query(insertQuery, values)

//     res.status(201).json({
//       success: true,
//       message: 'Scholarship application submitted successfully! Our team will review your details.',
//       application: newApp.rows[0],
//     })
//   } catch (error) {
//     console.error('Error submitting scholarship application:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Server error processing scholarship application',
//     })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/enrollment/status:
//  *  get:
//  *    summary: Check scholarship application status
//  *    tags: [Scholarship Enrollment]
//  *    parameters:
//  *      - in: query
//  *        name: email
//  *        required: true
//  *        schema:
//  *          type: string
//  *    responses:
//  *      200:
//  *        description: Application status retrieved successfully
//  *      400:
//  *        description: Email query parameter is required
//  *      404:
//  *        description: No scholarship applications found for this email
//  *      500:
//  *        description: Server error retrieving status
//  */
// exports.getApplicationStatus = async (req, res) => {
//   const { email } = req.query

//   if (!email) {
//     return res
//       .status(400)
//       .json({ success: false, message: 'Email query parameter is required' })
//   }

//   try {
//     const result = await db.query(
//       `SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code
//        FROM scholarship_applications sa
//        JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//        WHERE sa.email = $1 ORDER BY sa.created_at DESC`,
//       [email],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No scholarship applications found for this email.',
//       })
//     }

//     const enrichedApplications = result.rows.map(app => ({
//       ...app,
//       fee_details: {
//         originalAmount: SCHOLARSHIP_ORIGINAL_FEE,
//         discountAmount: SCHOLARSHIP_DISCOUNT_AMOUNT,
//         studentContribution: SCHOLARSHIP_STUDENT_CONTRIBUTION,
//       }
//     }))

//     res.status(200).json({ success: true, applications: enrichedApplications })
//   } catch (error) {
//     console.error('Error fetching application status:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error retrieving status' })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/enrollment/payment/initialize:
//  *  post:
//  *    summary: Initialize Flutterwave payment for scholarship student contribution (₦16,000)
//  *    tags: [Scholarship Enrollment]
//  */
// exports.initializeScholarshipPayment = async (req, res) => {
//   const { email, cohortId } = req.body

//   try {
//     const appResult = await db.query(
//       `SELECT * FROM scholarship_applications WHERE email = $1 AND cohort_id = $2 AND status = 'ACCEPTED'`,
//       [email, cohortId]
//     )

//     if (appResult.rows.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No accepted scholarship application found for this email and cohort.',
//       })
//     }

//     const application = appResult.rows[0]
//     const txRef = `DEN-SCH-PAY-${cohortId}-${Date.now()}`

//     // Call Flutterwave v3 Standard Payment API
//     const flwResponse = await axios.post(
//       'https://api.flutterwave.com/v3/payments',
//       {
//         tx_ref: txRef,
//         amount: SCHOLARSHIP_STUDENT_CONTRIBUTION,
//         currency: 'NGN',
//         redirect_url: `${process.env.FRONTEND_URL || 'https://denskill.com'}/scholarship/verify?email=${email}&cohortId=${cohortId}`,
//         customer: {
//           email: application.email,
//           name: `${application.first_name} ${application.last_name}`,
//           phonenumber: application.phone,
//         },
//         customizations: {
//           title: 'DenSkill Scholarship Contribution',
//           description: `Acceptance fee / Contribution for ${application.course}`,
//           logo: 'https://denskill.com/logo.png',
//         },
//         meta: {
//           cohortId,
//           applicationId: application.id,
//           paymentType: 'SCHOLARSHIP_CONTRIBUTION'
//         }
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${getFlwSecretKey()}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     )

//     if (flwResponse.data && flwResponse.data.status === 'success') {
//       return res.status(200).json({
//         success: true,
//         message: 'Scholarship payment initialized successfully',
//         data: {
//           authorization_url: flwResponse.data.data.link,
//           reference: txRef,
//           amount: SCHOLARSHIP_STUDENT_CONTRIBUTION,
//         }
//       })
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Failed to generate Flutterwave payment link',
//       })
//     }
//   } catch (error) {
//     console.error('Error initializing Flutterwave payment:', error.response?.data || error.message)
//     res.status(500).json({
//       success: false,
//       message: 'Server error initializing scholarship payment',
//     })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/enrollment/payment/verify:
//  *  post:
//  *    summary: Verify Flutterwave transaction and update payment status
//  *    tags: [Scholarship Enrollment]
//  */
// exports.verifyScholarshipPayment = async (req, res) => {
//   const { transactionId, email, cohortId } = req.body

//   if (!transactionId || !email || !cohortId) {
//     return res.status(400).json({
//       success: false,
//       message: 'Transaction ID, email, and cohortId are required for verification.',
//     })
//   }

//   try {
//     // Verify transaction against Flutterwave API
//     const verifyResponse = await axios.get(
//       `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
//       {
//         headers: {
//           Authorization: `Bearer ${getFlwSecretKey()}`,
//         }
//       }
//     )

//     const transactionData = verifyResponse.data?.data

//     if (
//       verifyResponse.data.status === 'success' &&
//       transactionData &&
//       transactionData.status === 'successful' &&
//       Number(transactionData.amount) >= SCHOLARSHIP_STUDENT_CONTRIBUTION &&
//       transactionData.currency === 'NGN'
//     ) {
//       // Update status to payment complete / ready to claim
//       await db.query(
//         `UPDATE scholarship_applications
//          SET status = 'PAYMENT_COMPLETED', updated_at = NOW()
//          WHERE email = $1 AND cohort_id = $2`,
//         [email, cohortId]
//       )

//       return res.status(200).json({
//         success: true,
//         message: 'Payment verified successfully! You can now complete your account setup.',
//         data: {
//           tx_ref: transactionData.tx_ref,
//           amount: transactionData.amount,
//         }
//       })
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment verification failed or transaction was not successful.',
//       })
//     }
//   } catch (error) {
//     console.error('Error verifying Flutterwave payment:', error.response?.data || error.message)
//     res.status(500).json({
//       success: false,
//       message: 'Server error verifying scholarship payment',
//     })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/enrollment/claim:
//  *  post:
//  *    summary: Claim scholarship offer and activate student account with password
//  *    tags: [Scholarship Enrollment]
//  */
// exports.claimScholarship = async (req, res) => {
//   const client = await db.getClient()
//   try {
//     await client.query('BEGIN')
//     const { email, cohortId, password, confirmPassword } = req.body

//     if (!email || !cohortId || !password || !confirmPassword) {
//       await client.query('ROLLBACK')
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide email, cohortId, password, and confirmation.',
//       })
//     }

//     if (password !== confirmPassword) {
//       await client.query('ROLLBACK')
//       return res.status(400).json({ success: false, message: 'Passwords do not match.' })
//     }

//     // 1. Verify that the application payment is completed
//     const appResult = await client.query(
//       `SELECT sa.*, sc.code as cohort_code
//        FROM scholarship_applications sa
//        JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//        WHERE sa.email = $1 AND sa.cohort_id = $2 AND (sa.status = 'PAYMENT_COMPLETED' OR sa.status = 'ACCEPTED')`,
//       [email, cohortId]
//     )

//     if (appResult.rows.length === 0) {
//       await client.query('ROLLBACK')
//       return res.status(400).json({
//         success: false,
//         message: 'No eligible scholarship application found or payment has not been completed.',
//       })
//     }

//     const application = appResult.rows[0]
//     const cohortCode = application.cohort_code || 'C1'

//     // 2. Generate cohort-bound Student ID (e.g., DEN-SCH-C1-001)
//     const countResult = await client.query(
//       `SELECT COUNT(*) FROM users WHERE student_type = 'SCHOLARSHIP' AND cohort_id = $1`,
//       [cohortId]
//     )
//     const count = parseInt(countResult.rows[0].count, 10) + 1
//     const studentIdNumber = `DEN-SCH-${cohortCode}-${String(count).padStart(3, '0')}`

//     // 3. Hash password
//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(password, salt)
//     const fullName = `${application.first_name} ${application.last_name}`

//     // 4. Check if user already exists
//     let userResult = await client.query('SELECT * FROM users WHERE email = $1', [email])
//     let userId

//     if (userResult.rows.length === 0) {
//       const newUser = await client.query(
//         `INSERT INTO users (name, email, password, student_type, cohort_id, student_id_number, role, status, is_verified)
//          VALUES ($1, $2, $3, 'SCHOLARSHIP', $4, $5, 'student', 'active', TRUE)
//          RETURNING id`,
//         [fullName, email, hashedPassword, cohortId, studentIdNumber]
//       )
//       userId = newUser.rows[0].id
//     } else {
//       userId = userResult.rows[0].id
//       await client.query(
//         `UPDATE users
//          SET password = $1, student_type = 'SCHOLARSHIP', cohort_id = $2, student_id_number = $3, is_verified = TRUE
//          WHERE id = $4`,
//         [hashedPassword, cohortId, studentIdNumber, userId]
//       )
//     }

//     // 5. Create enrollment tracking record with ₦16,000 student contribution amount
//     await client.query(
//       `INSERT INTO enrollments (
//          user_id, first_name, last_name, country, phone, email,
//          course, total_amount, amount_paid, payment_status, reference
//        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed', $10)
//        ON CONFLICT DO NOTHING`,
//       [
//         userId,
//         application.first_name,
//         application.last_name,
//         application.country,
//         application.phone,
//         application.email,
//         application.course,
//         SCHOLARSHIP_ORIGINAL_FEE,
//         SCHOLARSHIP_STUDENT_CONTRIBUTION,
//         `SCHOLARSHIP_CLAIM_${cohortId}_${Date.now()}`
//       ]
//     )

//     // 6. Update application status to ENROLLED
//     await client.query(
//       `UPDATE scholarship_applications SET status = 'ENROLLED', updated_at = NOW() WHERE id = $1`,
//       [application.id]
//     )

//     await client.query('COMMIT')

//     res.status(200).json({
//       success: true,
//       message: 'Scholarship claimed successfully! You can now log in to your dashboard.',
//       data: {
//         userId,
//         email,
//         studentIdNumber,
//         course: application.course,
//       },
//     })
//   } catch (error) {
//     await client.query('ROLLBACK')
//     console.error('Error claiming scholarship:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Server error processing scholarship claim.',
//     })
//   } finally {
//     client.release()
//   }
// }

// src/controllers/scholarship/scholarshipEnrollmentController.js
const db = require('../../config/db')
const bcrypt = require('bcryptjs')
const axios = require('axios')

// Universal scholarship pricing constants per the technical design
const SCHOLARSHIP_ORIGINAL_FEE = 80000;
const SCHOLARSHIP_STUDENT_CONTRIBUTION = 16000;
const SCHOLARSHIP_DISCOUNT_AMOUNT = 64000;

// Helper to get Flutterwave secret key dynamically
const getFlwSecretKey = () => process.env.FLW_SECRET_KEY || 'FLWSECK-a1e';

/**
 * Helper utility to normalize cohort database fields from snake_case 
 * to camelCase for safe consumption by frontend date parsers.
 */
const formatCohortResponse = (row) => {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    applicationOpenDate: row.application_open_date,
    applicationCloseDate: row.application_close_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * @swagger
 * /api/scholarship/enrollment/cohorts/active:
 *  get:
 *    summary: Get active scholarship cohorts
 *    tags: [Scholarship Enrollment]
 *    responses:
 *      200:
 *        description: List of open cohorts retrieved successfully
 *      500:
 *        description: Server error fetching cohorts
 */
exports.getActiveCohorts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM scholarship_cohorts WHERE UPPER(status) = 'ACTIVE' ORDER BY start_date ASC`,
    )
    const formattedCohorts = result.rows.map(formatCohortResponse)
    res.status(200).json({ success: true, cohorts: formattedCohorts })
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
 *  post:
 *    summary: Submit a new scholarship application
 *    tags: [Scholarship Enrollment]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - cohortId
 *              - firstName
 *              - lastName
 *              - email
 *              - phone
 *              - country
 *              - course
 *            properties:
 *              cohortId:
 *                type: integer
 *              firstName:
 *                type: string
 *              lastName:
 *                type: string
 *              email:
 *                type: string
 *              phone:
 *                type: string
 *              country:
 *                type: string
 *              course:
 *                type: string
 *              educationalBackground:
 *                type: string
 *              technicalBackground:
 *                type: string
 *              reasonForApplying:
 *                type: string
 *              motivation:
 *                type: string
 *              portfolioUrl:
 *                type: string
 *              referredBy:
 *                type: string
 *    responses:
 *      201:
 *        description: Scholarship application submitted successfully
 *      400:
 *        description: Invalid input or duplicate application
 *      500:
 *        description: Server error processing scholarship application
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
    referredBy,
  } = req.body

  try {
    const cohortCheck = await db.query(
      `SELECT * FROM scholarship_cohorts WHERE id = $1 AND UPPER(status) = 'ACTIVE'`,
      [cohortId],
    )

    if (cohortCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected cohort is not open for applications.',
      })
    }

    const existingApp = await db.query(
      `SELECT * FROM scholarship_applications WHERE email = $1 AND cohort_id = $2`,
      [email, cohortId],
    )

    if (existingApp.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An application with this email already exists for this cohort.',
      })
    }

    const insertQuery = `
      INSERT INTO scholarship_applications 
      (cohort_id, first_name, last_name, email, phone, country, course, educational_background, technical_background, reason_for_applying, motivation, portfolio_url, referred_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING')
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
      referredBy || null,
    ]

    const newApp = await db.query(insertQuery, values)

    res.status(201).json({
      success: true,
      message: 'Scholarship application submitted successfully! Our team will review your details.',
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
 *  get:
 *    summary: Check scholarship application status
 *    tags: [Scholarship Enrollment]
 *    parameters:
 *      - in: query
 *        name: email
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: Application status retrieved successfully
 *      400:
 *        description: Email query parameter is required
 *      404:
 *        description: No scholarship applications found for this email
 *      500:
 *        description: Server error retrieving status
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

    const enrichedApplications = result.rows.map(app => ({
      ...app,
      fee_details: {
        originalAmount: SCHOLARSHIP_ORIGINAL_FEE,
        discountAmount: SCHOLARSHIP_DISCOUNT_AMOUNT,
        studentContribution: SCHOLARSHIP_STUDENT_CONTRIBUTION,
      }
    }))

    res.status(200).json({ success: true, applications: enrichedApplications })
  } catch (error) {
    console.error('Error fetching application status:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error retrieving status' })
  }
}

/**
 * @swagger
 * /api/scholarship/enrollment/payment/initialize:
 *  post:
 *    summary: Initialize Flutterwave payment for scholarship student contribution (₦16,000)
 *    tags: [Scholarship Enrollment]
 */
exports.initializeScholarshipPayment = async (req, res) => {
  const { email, cohortId } = req.body

  try {
    const appResult = await db.query(
      `SELECT * FROM scholarship_applications WHERE email = $1 AND cohort_id = $2 AND status IN ('ACCEPTED', 'APPROVED', 'AWAITING_PAYMENT')`,
      [email, cohortId]
    )

    if (appResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No eligible scholarship application found for this email and cohort.',
      })
    }

    const application = appResult.rows[0]
    const txRef = `DEN-SCH-PAY-${cohortId}-${Date.now()}`

    // Call Flutterwave v3 Standard Payment API
    const flwResponse = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: txRef,
        amount: SCHOLARSHIP_STUDENT_CONTRIBUTION,
        currency: 'NGN',
        redirect_url: `${process.env.FRONTEND_URL || 'https://denskill.com'}/scholarship/verify?email=${email}&cohortId=${cohortId}`,
        customer: {
          email: application.email,
          name: `${application.first_name} ${application.last_name}`,
          phonenumber: application.phone,
        },
        customizations: {
          title: 'DenSkill Scholarship Contribution',
          description: `Acceptance fee / Contribution for ${application.course}`,
          logo: 'https://denskill.com/logo.png',
        },
        meta: {
          cohortId,
          applicationId: application.id,
          paymentType: 'SCHOLARSHIP_CONTRIBUTION'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${getFlwSecretKey()}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (flwResponse.data && flwResponse.data.status === 'success') {
      return res.status(200).json({
        success: true,
        message: 'Scholarship payment initialized successfully',
        data: {
          authorization_url: flwResponse.data.data.link,
          reference: txRef,
          amount: SCHOLARSHIP_STUDENT_CONTRIBUTION,
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate Flutterwave payment link',
      })
    }
  } catch (error) {
    console.error('Error initializing Flutterwave payment:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      message: 'Server error initializing scholarship payment',
    })
  }
}

/**
 * @swagger
 * /api/scholarship/enrollment/payment/verify:
 *  post:
 *    summary: Verify Flutterwave transaction and update payment status
 *    tags: [Scholarship Enrollment]
 */
exports.verifyScholarshipPayment = async (req, res) => {
  const { transactionId, email, cohortId } = req.body

  if (!transactionId || !email || !cohortId) {
    return res.status(400).json({
      success: false,
      message: 'Transaction ID, email, and cohortId are required for verification.',
    })
  }

  try {
    // Verify transaction against Flutterwave API
    const verifyResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${getFlwSecretKey()}`,
        }
      }
    )

    const transactionData = verifyResponse.data?.data

    if (
      verifyResponse.data.status === 'success' &&
      transactionData &&
      transactionData.status === 'successful' &&
      Number(transactionData.amount) >= SCHOLARSHIP_STUDENT_CONTRIBUTION &&
      transactionData.currency === 'NGN'
    ) {
      // Update status to payment complete / ready to claim
      await db.query(
        `UPDATE scholarship_applications 
         SET status = 'PAYMENT_COMPLETED', updated_at = NOW() 
         WHERE email = $1 AND cohort_id = $2`,
        [email, cohortId]
      )

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully! You can now complete your account setup.',
        data: {
          tx_ref: transactionData.tx_ref,
          amount: transactionData.amount,
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed or transaction was not successful.',
      })
    }
  } catch (error) {
    console.error('Error verifying Flutterwave payment:', error.response?.data || error.message)
    res.status(500).json({
      success: false,
      message: 'Server error verifying scholarship payment',
    })
  }
}

/**
 * @swagger
 * /api/scholarship/enrollment/claim:
 *  post:
 *    summary: Claim scholarship offer and activate student account with password
 *    tags: [Scholarship Enrollment]
 */
exports.claimScholarship = async (req, res) => {
  const client = await db.getClient()
  try {
    await client.query('BEGIN')
    const { email, cohortId, password, confirmPassword } = req.body

    if (!email || !cohortId || !password || !confirmPassword) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        message: 'Please provide email, cohortId, password, and confirmation.',
      })
    }

    if (password !== confirmPassword) {
      await client.query('ROLLBACK')
      return res.status(400).json({ success: false, message: 'Passwords do not match.' })
    }

    // 1. Verify that the application payment is completed
    const appResult = await client.query(
      `SELECT sa.*, sc.code as cohort_code 
       FROM scholarship_applications sa
       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
       WHERE sa.email = $1 AND sa.cohort_id = $2 AND (sa.status = 'PAYMENT_COMPLETED' OR sa.status = 'ACCEPTED' OR sa.status = 'APPROVED')`,
      [email, cohortId]
    )

    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        message: 'No eligible scholarship application found or payment has not been completed.',
      })
    }

    const application = appResult.rows[0]
    const cohortCode = application.cohort_code || 'C1'

    // 2. Generate cohort-bound Student ID (e.g., DEN-SCH-C1-001)
    const countResult = await client.query(
      `SELECT COUNT(*) FROM users WHERE student_type = 'SCHOLARSHIP' AND cohort_id = $1`,
      [cohortId]
    )
    const count = parseInt(countResult.rows[0].count, 10) + 1
    const studentIdNumber = `DEN-SCH-${cohortCode}-${String(count).padStart(3, '0')}`

    // 3. Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const fullName = `${application.first_name} ${application.last_name}`

    // 4. Check if user already exists
    let userResult = await client.query('SELECT * FROM users WHERE email = $1', [email])
    let userId

    if (userResult.rows.length === 0) {
      const newUser = await client.query(
        `INSERT INTO users (name, email, password, student_type, cohort_id, student_id_number, role, status, is_verified) 
         VALUES ($1, $2, $3, 'SCHOLARSHIP', $4, $5, 'student', 'active', TRUE) 
         RETURNING id`,
        [fullName, email, hashedPassword, cohortId, studentIdNumber]
      )
      userId = newUser.rows[0].id
    } else {
      userId = userResult.rows[0].id
      await client.query(
        `UPDATE users 
         SET password = $1, student_type = 'SCHOLARSHIP', cohort_id = $2, student_id_number = $3, is_verified = TRUE 
         WHERE id = $4`,
        [hashedPassword, cohortId, studentIdNumber, userId]
      )
    }

    // 5. Create enrollment tracking record with ₦16,000 student contribution amount
    await client.query(
      `INSERT INTO enrollments (
         user_id, first_name, last_name, country, phone, email, 
         course, total_amount, amount_paid, payment_status, reference
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed', $10)
       ON CONFLICT DO NOTHING`,
      [
        userId,
        application.first_name,
        application.last_name,
        application.country,
        application.phone,
        application.email,
        application.course,
        SCHOLARSHIP_ORIGINAL_FEE,
        SCHOLARSHIP_STUDENT_CONTRIBUTION,
        `SCHOLARSHIP_CLAIM_${cohortId}_${Date.now()}`
      ]
    )

    // 6. Update application status to ENROLLED
    await client.query(
      `UPDATE scholarship_applications SET status = 'ENROLLED', updated_at = NOW() WHERE id = $1`,
      [application.id]
    )

    await client.query('COMMIT')

    res.status(200).json({
      success: true,
      message: 'Scholarship claimed successfully! You can now log in to your dashboard.',
      data: {
        userId,
        email,
        studentIdNumber,
        course: application.course,
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error claiming scholarship:', error)
    res.status(500).json({
      success: false,
      message: 'Server error processing scholarship claim.',
    })
  } finally {
    client.release()
  }
}