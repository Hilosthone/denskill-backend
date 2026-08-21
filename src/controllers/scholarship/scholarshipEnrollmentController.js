// // src/controllers/scholarship/scholarshipEnrollmentController.js
// const db = require('../../config/db')
// const bcrypt = require('bcryptjs')
// const axios = require('axios')

// // Program pricing reference list matching your frontend constants
// const PROGRAMMES = [
//   { title: 'Frontend Development', price: '₦80,000' },
//   { title: 'Backend Development', price: '₦80,000' },
//   { title: 'Full Stack Development', price: '₦200,000' },
//   { title: 'Mobile Development', price: '₦100,000' },
//   { title: 'Cybersecurity', price: '₦100,000' },
//   { title: 'Data Science', price: '₦80,000' },
//   { title: 'Data Analysis', price: '₦80,000' },
//   { title: 'Product Design (UI/UX)', price: '₦80,000' },
//   { title: 'Product Management', price: '₦80,000' },
//   { title: 'Web3 and Blockchain Development', price: '₦200,000' },
//   { title: 'AI / Machine Learning', price: '₦200,000' },
//   { title: 'Graphics Design', price: 'free' },
// ]

// /**
//  * Helper to calculate dynamic scholarship pricing based on the course title.
//  */
// const calculateScholarshipFees = (courseTitle) => {
//   const match = PROGRAMMES.find(
//     (p) => p.title.toLowerCase() === (courseTitle || '').trim().toLowerCase()
//   )

//   if (!match || match.price.toLowerCase() === 'free') {
//     return { originalAmount: 0, discountAmount: 0, studentContribution: 0 }
//   }

//   const originalAmount = parseInt(match.price.replace(/[^0-9]/g, ''), 10) || 80000
//   const discountAmount = originalAmount * 0.80
//   const studentContribution = originalAmount - discountAmount

//   return { originalAmount, discountAmount, studentContribution }
// }

// const getFlwSecretKey = () => process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK-a1e'

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

// exports.getActiveCohorts = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT * FROM scholarship_cohorts WHERE UPPER(status) = 'ACTIVE' ORDER BY start_date ASC`,
//     )
//     const formattedCohorts = result.rows.map(formatCohortResponse)
//     res.status(200).json({ success: true, cohorts: formattedCohorts })
//   } catch (error) {
//     console.error('Error fetching cohorts:', error)
//     res.status(500).json({ success: false, message: 'Server error fetching cohorts' })
//   }
// }

// exports.submitApplication = async (req, res) => {
//   const {
//     cohortId,
//     firstName,
//     lastName,
//     email,
//     phone,
//     country,
//     course,
//     statement,
//     motivation,
//     reasonForApplying,
//     referredBy,
//   } = req.body

//   // Gracefully fallback to whichever text field the frontend form populated
//   const finalStatement = statement || motivation || reasonForApplying || ''

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
//       (cohort_id, first_name, last_name, email, phone, country, course, motivation, referred_by, status)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
//       RETURNING *;
//     `

//     const values = [
//       cohortId,
//       firstName,
//       lastName,
//       email,
//       phone,
//       country || 'Nigeria',
//       course,
//       finalStatement,
//       referredBy || null,
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

// exports.getApplicationStatus = async (req, res) => {
//   const { email } = req.query

//   if (!email) {
//     return res.status(400).json({ success: false, message: 'Email query parameter is required' })
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

//     const enrichedApplications = result.rows.map(app => {
//       const fees = calculateScholarshipFees(app.course)
//       return {
//         ...app,
//         fee_details: {
//           originalAmount: fees.originalAmount,
//           discountAmount: fees.discountAmount,
//           studentContribution: fees.studentContribution,
//         }
//       }
//     })

//     res.status(200).json({ success: true, applications: enrichedApplications })
//   } catch (error) {
//     console.error('Error fetching application status:', error)
//     res.status(500).json({ success: false, message: 'Server error retrieving status' })
//   }
// }

// exports.initializeScholarshipPayment = async (req, res) => {
//   const { applicationId } = req.body

//   if (!applicationId) {
//     return res.status(400).json({ success: false, message: 'applicationId is required.' })
//   }

//   try {
//     const appResult = await db.query(
//       `SELECT sa.*, sc.id as cohort_id FROM scholarship_applications sa
//        JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//        WHERE sa.id = $1`,
//       [applicationId]
//     )

//     if (appResult.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Scholarship application not found.' })
//     }

//     const application = appResult.rows[0]
//     const fees = calculateScholarshipFees(application.course)
//     const txRef = `DEN-SCH-PAY-${application.cohort_id}-${Date.now()}`

//     const flwResponse = await axios.post(
//       'https://api.flutterwave.com/v3/payments',
//       {
//         tx_ref: txRef,
//         amount: fees.studentContribution,
//         currency: 'NGN',
//         redirect_url: `${process.env.FRONTEND_URL || 'https://denskill.com'}/scholarship/verify?applicationId=${applicationId}`,
//         customer: {
//           email: application.email,
//           name: `${application.first_name} ${application.last_name}`,
//           phonenumber: application.phone,
//         },
//         customizations: {
//           title: 'DenSkill Scholarship Contribution',
//           description: `Acceptance fee / Contribution for ${application.course} (80% Off)`,
//           logo: 'https://denskill.com/logo.png',
//         },
//         meta: {
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
//           amount: fees.studentContribution,
//         }
//       })
//     } else {
//       return res.status(400).json({ success: false, message: 'Failed to generate Flutterwave payment link' })
//     }
//   } catch (error) {
//     console.error('Error initializing Flutterwave payment:', error.response?.data || error.message)
//     res.status(500).json({ success: false, message: 'Server error initializing scholarship payment' })
//   }
// }

// exports.verifyScholarshipPayment = async (req, res) => {
//   console.log(
//     '🔥 verifyScholarshipPayment controller triggered with reference:',
//     req.body.reference,
//   )
//   const { reference } = req.body

//   if (!reference) {
//     return res.status(400).json({ success: false, message: 'Transaction reference is required.' })
//   }

//   try {
//     const verifyResponse = await axios.get(
//       `https://api.flutterwave.com/v3/transactions?tx_ref=${reference}`,
//       {
//         headers: { Authorization: `Bearer ${getFlwSecretKey()}` }
//       }
//     )

//     const transactions = verifyResponse.data?.data
//     if (!transactions || transactions.length === 0) {
//       return res.status(404).json({ success: false, message: 'Transaction not found on Flutterwave.' })
//     }

//     const transactionData = transactions[0]
//     const applicationId = transactionData.meta?.applicationId

//     if (!applicationId) {
//       return res.status(400).json({ success: false, message: 'Application metadata missing from transaction.' })
//     }

//     const appResult = await db.query(
//       `SELECT * FROM scholarship_applications WHERE id = $1`,
//       [applicationId]
//     )

//     if (appResult.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Application not found.' })
//     }

//     const application = appResult.rows[0]
//     const fees = calculateScholarshipFees(application.course)

//     if (
//       transactionData.status === 'successful' &&
//       Number(transactionData.amount) >= fees.studentContribution &&
//       transactionData.currency === 'NGN'
//     ) {
//       await db.query(
//         `UPDATE scholarship_applications
//          SET status = 'PAYMENT_COMPLETED', updated_at = NOW()
//          WHERE id = $1`,
//         [applicationId]
//       )

//       return res.status(200).json({
//         success: true,
//         message: 'Payment verified successfully! You can now complete your account setup.',
//         data: {
//           applicationId,
//           tx_ref: transactionData.tx_ref,
//           amount: transactionData.amount,
//         }
//       })
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment verification failed or amount mismatch.',
//       })
//     }
//   } catch (error) {
//     console.error('Error verifying Flutterwave payment:', error.response?.data || error.message)
//     res.status(500).json({ success: false, message: 'Server error verifying scholarship payment' })
//   }
// }

// exports.claimScholarship = async (req, res) => {
//   const client = await db.getClient()
//   try {
//     await client.query('BEGIN')
//     const { applicationId, password } = req.body

//     if (!applicationId || !password) {
//       await client.query('ROLLBACK')
//       return res.status(400).json({ success: false, message: 'applicationId and password are required.' })
//     }

//     const appResult = await client.query(
//       `SELECT sa.*, sc.code as cohort_code, sc.id as cohort_id
//        FROM scholarship_applications sa
//        JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//        WHERE sa.id = $1`,
//       [applicationId]
//     )

//     if (appResult.rows.length === 0) {
//       await client.query('ROLLBACK')
//       return res.status(400).json({ success: false, message: 'Scholarship application not found.' })
//     }

//     const application = appResult.rows[0]
//     const cohortCode = application.cohort_code || 'C1'
//     const fees = calculateScholarshipFees(application.course)

//     const countResult = await client.query(
//       `SELECT COUNT(*) FROM users WHERE student_type = 'SCHOLARSHIP' AND cohort_id = $1`,
//       [application.cohort_id]
//     )
//     const count = parseInt(countResult.rows[0].count, 10) + 1
//     const studentIdNumber = `DEN-SCH-${cohortCode}-${String(count).padStart(3, '0')}`

//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(password, salt)
//     const fullName = `${application.first_name} ${application.last_name}`

//     let userResult = await client.query('SELECT * FROM users WHERE email = $1', [application.email])
//     let userId

//     if (userResult.rows.length === 0) {
//       const newUser = await client.query(
//         `INSERT INTO users (name, email, password, student_type, cohort_id, student_id_number, role, status, is_verified)
//          VALUES ($1, $2, $3, 'SCHOLARSHIP', $4, $5, 'student', 'active', TRUE)
//          RETURNING id`,
//         [fullName, application.email, hashedPassword, application.cohort_id, studentIdNumber]
//       )
//       userId = newUser.rows[0].id
//     } else {
//       userId = userResult.rows[0].id
//       await client.query(
//         `UPDATE users
//          SET password = $1, student_type = 'SCHOLARSHIP', cohort_id = $2, student_id_number = $3, is_verified = TRUE
//          WHERE id = $4`,
//         [hashedPassword, application.cohort_id, studentIdNumber, userId]
//       )
//     }

//     await client.query(
//       `INSERT INTO enrollments (
//          user_id, first_name, last_name, country, phone, email,
//          course, total_amount, amount_paid, payment_status, reference
//        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed', $10)
//        ON CONFLICT (reference) DO NOTHING`,
//       [
//         userId,
//         application.first_name,
//         application.last_name,
//         application.country,
//         application.phone,
//         application.email,
//         application.course,
//         fees.originalAmount,
//         fees.studentContribution,
//         `SCHOLARSHIP_CLAIM_${application.cohort_id}_${Date.now()}`
//       ]
//     )

//     await client.query(
//       `UPDATE scholarship_applications SET status = 'ENROLLED', updated_at = NOW() WHERE id = $1`,
//       [applicationId]
//     )

//     await client.query('COMMIT')

//     res.status(200).json({
//       success: true,
//       message: 'Scholarship claimed successfully! You can now log in to your dashboard.',
//       data: {
//         userId,
//         email: application.email,
//         studentIdNumber,
//         course: application.course,
//         feeDetails: fees,
//       },
//     })
//   } catch (error) {
//     await client.query('ROLLBACK')
//     console.error('Error claiming scholarship:', error)
//     res.status(500).json({ success: false, message: 'Server error processing scholarship claim.' })
//   } finally {
//     client.release()
//   }
// }



// src/controllers/scholarship/scholarshipEnrollmentController.js
const db = require('../../config/db')
const bcrypt = require('bcryptjs')
const axios = require('axios')

// Program pricing reference list matching your frontend constants
const PROGRAMMES = [
  { title: 'Frontend Development', price: '₦80,000' },
  { title: 'Backend Development', price: '₦80,000' },
  { title: 'Full Stack Development', price: '₦200,000' },
  { title: 'Mobile Development', price: '₦100,000' },
  { title: 'Cybersecurity', price: '₦100,000' },
  { title: 'Data Science', price: '₦80,000' },
  { title: 'Data Analysis', price: '₦80,000' },
  { title: 'Product Design (UI/UX)', price: '₦80,000' },
  { title: 'Product Management', price: '₦80,000' },
  { title: 'Web3 and Blockchain Development', price: '₦200,000' },
  { title: 'AI / Machine Learning', price: '₦200,000' },
  { title: 'Graphics Design', price: 'free' },
]

/**
 * Helper to calculate dynamic scholarship pricing based on the course title.
 */
const calculateScholarshipFees = (courseTitle) => {
  const match = PROGRAMMES.find(
    (p) => p.title.toLowerCase() === (courseTitle || '').trim().toLowerCase()
  )

  if (!match || match.price.toLowerCase() === 'free') {
    return { originalAmount: 0, discountAmount: 0, studentContribution: 0 }
  }

  const originalAmount = parseInt(match.price.replace(/[^0-9]/g, ''), 10) || 80000
  const discountAmount = originalAmount * 0.80
  const studentContribution = originalAmount - discountAmount

  return { originalAmount, discountAmount, studentContribution }
}

const getFlwSecretKey = () => process.env.FLW_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK-a1e'

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

exports.getActiveCohorts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM scholarship_cohorts WHERE UPPER(status) = 'ACTIVE' ORDER BY start_date ASC`,
    )
    const formattedCohorts = result.rows.map(formatCohortResponse)
    res.status(200).json({ success: true, cohorts: formattedCohorts })
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    res.status(500).json({ success: false, message: 'Server error fetching cohorts' })
  }
}

exports.submitApplication = async (req, res) => {
  const {
    cohortId,
    firstName,
    lastName,
    email,
    phone,
    country,
    course,
    statement, 
    motivation,
    reasonForApplying,
    referredBy,
  } = req.body

  // Gracefully fallback to whichever text field the frontend form populated
  const finalStatement = statement || motivation || reasonForApplying || ''

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
      (cohort_id, first_name, last_name, email, phone, country, course, motivation, referred_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
      RETURNING *;
    `

    const values = [
      cohortId,
      firstName,
      lastName,
      email,
      phone,
      country || 'Nigeria',
      course,
      finalStatement,
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

exports.getApplicationStatus = async (req, res) => {
  const { email } = req.query

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email query parameter is required' })
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

    const enrichedApplications = result.rows.map(app => {
      const fees = calculateScholarshipFees(app.course)
      return {
        ...app,
        fee_details: {
          originalAmount: fees.originalAmount,
          discountAmount: fees.discountAmount,
          studentContribution: fees.studentContribution,
        }
      }
    })

    res.status(200).json({ success: true, applications: enrichedApplications })
  } catch (error) {
    console.error('Error fetching application status:', error)
    res.status(500).json({ success: false, message: 'Server error retrieving status' })
  }
}

exports.initializeScholarshipPayment = async (req, res) => {
  const { applicationId } = req.body

  if (!applicationId) {
    return res.status(400).json({ success: false, message: 'applicationId is required.' })
  }

  try {
    const appResult = await db.query(
      `SELECT sa.*, sc.id as cohort_id FROM scholarship_applications sa 
       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id 
       WHERE sa.id = $1`,
      [applicationId]
    )

    if (appResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship application not found.' })
    }

    const application = appResult.rows[0]
    const fees = calculateScholarshipFees(application.course)
    const txRef = `DEN-SCH-PAY-${application.cohort_id}-${Date.now()}`

    const flwResponse = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: txRef,
        amount: fees.studentContribution,
        currency: 'NGN',
        redirect_url: `${process.env.FRONTEND_URL || 'https://denskill.com'}/scholarship/verify?applicationId=${applicationId}`,
        customer: {
          email: application.email,
          name: `${application.first_name} ${application.last_name}`,
          phonenumber: application.phone,
        },
        customizations: {
          title: 'DenSkill Scholarship Contribution',
          description: `Acceptance fee / Contribution for ${application.course} (80% Off)`,
          logo: 'https://denskill.com/logo.png',
        },
        meta: {
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
          amount: fees.studentContribution,
        }
      })
    } else {
      return res.status(400).json({ success: false, message: 'Failed to generate Flutterwave payment link' })
    }
  } catch (error) {
    console.error('Error initializing Flutterwave payment:', error.response?.data || error.message)
    res.status(500).json({ success: false, message: 'Server error initializing scholarship payment' })
  }
}

exports.verifyScholarshipPayment = async (req, res) => {
  console.log(
    '🔥 verifyScholarshipPayment controller triggered with reference:',
    req.body.reference,
  )
  const { reference } = req.body

  if (!reference) {
    return res.status(400).json({ success: false, message: 'Transaction reference is required.' })
  }

  try {
    // Updated to use the dedicated Flutterwave verify_by_reference endpoint
    const verifyResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
      {
        headers: { Authorization: `Bearer ${getFlwSecretKey()}` }
      }
    )

    // verify_by_reference returns the transaction details object directly in data
    const transactionData = verifyResponse.data?.data
    if (!transactionData) {
      return res.status(404).json({ success: false, message: 'Transaction not found on Flutterwave.' })
    }

    const applicationId = transactionData.meta?.applicationId

    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'Application metadata missing from transaction.' })
    }

    const appResult = await db.query(
      `SELECT * FROM scholarship_applications WHERE id = $1`,
      [applicationId]
    )

    if (appResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' })
    }

    const application = appResult.rows[0]
    const fees = calculateScholarshipFees(application.course)

    if (
      transactionData.status === 'successful' &&
      Number(transactionData.amount) >= fees.studentContribution &&
      transactionData.currency === 'NGN'
    ) {
      await db.query(
        `UPDATE scholarship_applications 
         SET status = 'PAYMENT_COMPLETED', updated_at = NOW() 
         WHERE id = $1`,
        [applicationId]
      )

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully! You can now complete your account setup.',
        data: {
          applicationId,
          tx_ref: transactionData.tx_ref,
          amount: transactionData.amount,
        }
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed or amount mismatch.',
      })
    }
  } catch (error) {
    console.error('Error verifying Flutterwave payment:', error.response?.data || error.message)
    res.status(500).json({ success: false, message: 'Server error verifying scholarship payment' })
  }
}

exports.claimScholarship = async (req, res) => {
  const client = await db.getClient()
  try {
    await client.query('BEGIN')
    const { applicationId, password } = req.body

    if (!applicationId || !password) {
      await client.query('ROLLBACK')
      return res.status(400).json({ success: false, message: 'applicationId and password are required.' })
    }

    const appResult = await client.query(
      `SELECT sa.*, sc.code as cohort_code, sc.id as cohort_id 
       FROM scholarship_applications sa
       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
       WHERE sa.id = $1`,
      [applicationId]
    )

    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ success: false, message: 'Scholarship application not found.' })
    }

    const application = appResult.rows[0]
    const cohortCode = application.cohort_code || 'C1'
    const fees = calculateScholarshipFees(application.course)

    const countResult = await client.query(
      `SELECT COUNT(*) FROM users WHERE student_type = 'SCHOLARSHIP' AND cohort_id = $1`,
      [application.cohort_id]
    )
    const count = parseInt(countResult.rows[0].count, 10) + 1
    const studentIdNumber = `DEN-SCH-${cohortCode}-${String(count).padStart(3, '0')}`

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const fullName = `${application.first_name} ${application.last_name}`

    let userResult = await client.query('SELECT * FROM users WHERE email = $1', [application.email])
    let userId

    if (userResult.rows.length === 0) {
      const newUser = await client.query(
        `INSERT INTO users (name, email, password, student_type, cohort_id, student_id_number, role, status, is_verified) 
         VALUES ($1, $2, $3, 'SCHOLARSHIP', $4, $5, 'student', 'active', TRUE) 
         RETURNING id`,
        [fullName, application.email, hashedPassword, application.cohort_id, studentIdNumber]
      )
      userId = newUser.rows[0].id
    } else {
      userId = userResult.rows[0].id
      await client.query(
        `UPDATE users 
         SET password = $1, student_type = 'SCHOLARSHIP', cohort_id = $2, student_id_number = $3, is_verified = TRUE 
         WHERE id = $4`,
        [hashedPassword, application.cohort_id, studentIdNumber, userId]
      )
    }

    await client.query(
      `INSERT INTO enrollments (
         user_id, first_name, last_name, country, phone, email, 
         course, total_amount, amount_paid, payment_status, reference
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed', $10)
       ON CONFLICT (reference) DO NOTHING`,
      [
        userId,
        application.first_name,
        application.last_name,
        application.country,
        application.phone,
        application.email,
        application.course,
        fees.originalAmount,
        fees.studentContribution,
        `SCHOLARSHIP_CLAIM_${application.cohort_id}_${Date.now()}`
      ]
    )

    await client.query(
      `UPDATE scholarship_applications SET status = 'ENROLLED', updated_at = NOW() WHERE id = $1`,
      [applicationId]
    )

    await client.query('COMMIT')

    res.status(200).json({
      success: true,
      message: 'Scholarship claimed successfully! You can now log in to your dashboard.',
      data: {
        userId,
        email: application.email,
        studentIdNumber,
        course: application.course,
        feeDetails: fees,
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error claiming scholarship:', error)
    res.status(500).json({ success: false, message: 'Server error processing scholarship claim.' })
  } finally {
    client.release()
  }
}