// // src/controllers/scholarship/scholarshipAdminController.js
// const crypto = require('crypto')
// const bcrypt = require('bcryptjs')
// const db = require('../../config/db')
// const { Resend } = require('resend')
// require('dotenv').config()

// const senderEmail = process.env.EMAIL_FROM || 'D Enskill Academy <onboarding@denskill.com>'
// const scholarshipApprovalEmail = require('../../templates/scholarshipApprovalEmail')

// // Helper to get initialized Resend client safely at runtime
// const getResendClient = () => {
//   const apiKey = process.env.RESEND_API_KEY
//   if (!apiKey) {
//     throw new Error('Missing RESEND_API_KEY in environment variables. Please check your .env file.')
//   }
//   return new Resend(apiKey)
// }

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
//  * Helper utility to normalize application database fields from snake_case
//  * to camelCase and include full details for safe consumption by the frontend admin dashboard.
//  */
// const formatApplicationResponse = (row) => {
//   if (!row) return null
//   return {
//     id: row.id,
//     cohortId: row.cohort_id,
//     firstName: row.first_name,
//     middleName: row.middle_name || null,
//     lastName: row.last_name,
//     fullName: `${row.first_name || ''} ${row.middle_name ? row.middle_name + ' ' : ''}${row.last_name || ''}`.trim(),
//     email: row.email,
//     phone: row.phone,
//     country: row.country,
//     course: row.course,
//     educationalBackground: row.educational_background,
//     technicalBackground: row.technical_background,
//     reasonForApplying: row.reason_for_applying,
//     motivation: row.motivation,
//     portfolioUrl: row.portfolio_url,
//     referredBy: row.referred_by || null,
//     adminNotes: row.admin_notes,
//     status: row.status,
//     paymentStatus: row.payment_status || 'PENDING',
//     originalAmount: row.original_amount || null,
//     studentContributionPercentage: row.student_contribution_percentage || 20,
//     amountPaid: row.student_amount || 0,
//     scholarshipAmount: row.scholarship_amount || null,
//     paymentReference: row.payment_reference || null,
//     expiresAt: row.expires_at || null,
//     paidAt: row.paid_at || null,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//     cohortName: row.cohort_name,
//     cohortCode: row.cohort_code,
//   }
// }

// const getScholarshipDashboardMetrics = async (req, res) => {
//   try {
//     const { cohortId } = req.query
//     let cohortFilter = ''
//     let awardCohortFilter = ''
//     let params = []

//     if (cohortId) {
//       cohortFilter = 'WHERE sa.cohort_id = $1'
//       awardCohortFilter = 'WHERE sa.cohort_id = $1'
//       params.push(cohortId)
//     }

//     const statsQuery = `
//       SELECT
//         COUNT(sa.*) as total_applications,
//         SUM(CASE WHEN sa.status = 'PENDING' THEN 1 ELSE 0 END) as pending_applications,
//         SUM(CASE WHEN sa.status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as under_review,
//         SUM(CASE WHEN sa.status = 'APPROVED' OR sa.status = 'AWAITING_PAYMENT' THEN 1 ELSE 0 END) as approved_awaiting_payment,
//         SUM(CASE WHEN sa.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
//         SUM(CASE WHEN sa.status = 'PAYMENT_COMPLETED' OR sa.status = 'ENROLLED' THEN 1 ELSE 0 END) as paid_enrolled
//       FROM scholarship_applications sa ${cohortFilter};
//     `

//     const revenueQuery = `
//       SELECT
//         COALESCE(SUM(saw.student_amount), 0) as total_revenue,
//         COUNT(CASE WHEN saw.payment_status = 'COMPLETED' OR saw.payment_status = 'SUCCESS' THEN 1 END) as paid_count
//       FROM scholarship_awards saw
//       JOIN scholarship_applications sa ON saw.application_id = sa.id
//       ${awardCohortFilter};
//     `

//     const statsResult = await db.query(statsQuery, params)
//     const revenueResult = await db.query(revenueQuery, params)
//     const cohortResult = await db.query(
//       `SELECT * FROM scholarship_cohorts WHERE UPPER(status) = 'ACTIVE' LIMIT 1`,
//     )

//     const metrics = {
//       ...statsResult.rows[0],
//       totalRevenue: Number(revenueResult.rows[0].total_revenue),
//       completedPaymentsCount: Number(revenueResult.rows[0].paid_count),
//     }

//     res.status(200).json({
//       success: true,
//       metrics,
//       activeCohort: formatCohortResponse(cohortResult.rows[0]) || null,
//     })
//   } catch (error) {
//     console.error('Error fetching scholarship metrics:', error)
//     res.status(500).json({ success: false, message: 'Server error loading scholarship metrics' })
//   }
// }

// const getAllApplications = async (req, res) => {
//   try {
//     const { cohortId, status } = req.query
//     let query = `
//       SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code,
//              saw.payment_status, saw.original_amount, saw.student_contribution_percentage,
//              saw.student_amount, saw.scholarship_amount, saw.payment_reference, saw.expires_at, saw.updated_at as paid_at
//       FROM scholarship_applications sa
//       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//       LEFT JOIN scholarship_awards saw ON sa.id = saw.application_id
//     `
//     let conditions = []
//     let params = []

//     if (cohortId) {
//       params.push(cohortId)
//       conditions.push(`sa.cohort_id = $${params.length}`)
//     }
//     if (status) {
//       params.push(status)
//       conditions.push(`sa.status = $${params.length}`)
//     }

//     if (conditions.length > 0) {
//       query += ` WHERE ` + conditions.join(' AND ')
//     }

//     query += ` ORDER BY sa.created_at DESC`

//     const result = await db.query(query, params)
//     const formattedApplications = result.rows.map(formatApplicationResponse)

//     res.status(200).json({
//       success: true,
//       count: formattedApplications.length,
//       applications: formattedApplications
//     })
//   } catch (error) {
//     console.error('Error fetching applications:', error)
//     res.status(500).json({ success: false, message: 'Server error loading applications' })
//   }
// }

// const getPendingApplications = async (req, res) => {
//   try {
//     const { cohortId } = req.query
//     let query = `
//       SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code,
//              saw.payment_status, saw.original_amount, saw.student_contribution_percentage,
//              saw.student_amount, saw.scholarship_amount, saw.payment_reference, saw.expires_at
//       FROM scholarship_applications sa
//       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//       LEFT JOIN scholarship_awards saw ON sa.id = saw.application_id
//       WHERE sa.status = 'PENDING'
//     `
//     let params = []
//     if (cohortId) {
//       params.push(cohortId)
//       query += ` AND sa.cohort_id = $1`
//     }
//     query += ` ORDER BY sa.created_at DESC`

//     const result = await db.query(query, params)
//     const applications = result.rows.map(formatApplicationResponse)

//     res.status(200).json({ success: true, count: applications.length, applications })
//   } catch (error) {
//     console.error('Error fetching pending applications:', error)
//     res.status(500).json({ success: false, message: 'Server error loading pending applications' })
//   }
// }

// const getAwaitingPaymentApplications = async (req, res) => {
//   try {
//     const { cohortId } = req.query
//     let query = `
//       SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code,
//              saw.payment_status, saw.original_amount, saw.student_contribution_percentage,
//              saw.student_amount, saw.scholarship_amount, saw.payment_reference, saw.expires_at
//       FROM scholarship_applications sa
//       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//       LEFT JOIN scholarship_awards saw ON sa.id = saw.application_id
//       WHERE sa.status IN ('APPROVED', 'AWAITING_PAYMENT') AND (saw.payment_status = 'PENDING' OR saw.payment_status IS NULL)
//     `
//     let params = []
//     if (cohortId) {
//       params.push(cohortId)
//       query += ` AND sa.cohort_id = $1`
//     }
//     query += ` ORDER BY sa.created_at DESC`

//     const result = await db.query(query, params)
//     const applications = result.rows.map(formatApplicationResponse)

//     res.status(200).json({ success: true, count: applications.length, applications })
//   } catch (error) {
//     console.error('Error fetching awaiting payment applications:', error)
//     res.status(500).json({ success: false, message: 'Server error loading awaiting payment applications' })
//   }
// }

// const getPaidAndEnrolledStudents = async (req, res) => {
//   try {
//     const { cohortId } = req.query
//     let query = `
//       SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code,
//              saw.payment_status, saw.original_amount, saw.student_contribution_percentage,
//              saw.student_amount, saw.scholarship_amount, saw.payment_reference, saw.expires_at, saw.updated_at as paid_at
//       FROM scholarship_applications sa
//       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//       JOIN scholarship_awards saw ON sa.id = saw.application_id
//       WHERE (sa.status = 'PAYMENT_COMPLETED' OR sa.status = 'ENROLLED' OR saw.payment_status = 'COMPLETED' OR saw.payment_status = 'SUCCESS')
//     `
//     let params = []
//     if (cohortId) {
//       params.push(cohortId)
//       query += ` AND sa.cohort_id = $1`
//     }
//     query += ` ORDER BY saw.updated_at DESC`

//     const result = await db.query(query, params)
//     const students = result.rows.map(formatApplicationResponse)

//     const totalRevenue = students.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0)

//     res.status(200).json({
//       success: true,
//       count: students.length,
//       totalRevenue,
//       students
//     })
//   } catch (error) {
//     console.error('Error fetching paid students:', error)
//     res.status(500).json({ success: false, message: 'Server error loading paid students' })
//   }
// }

// const approveApplication = async (req, res) => {
//   const { id } = req.params
//   const { adminNotes } = req.body

//   try {
//     const appResult = await db.query(`SELECT * FROM scholarship_applications WHERE id = $1`, [id])
//     if (appResult.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Scholarship application not found' })
//     }

//     const app = appResult.rows[0]
//     if (app.status === 'APPROVED' || app.status === 'AWAITING_PAYMENT') {
//       return res.status(400).json({ success: false, message: 'Application is already approved.' })
//     }

//     // Dynamic pricing lookup based on the student's selected course
//     const pricingMap = {
//       'frontend development': 80000.00,
//       'backend development': 80000.00,
//       'full stack development': 200000.00,
//       'mobile development': 100000.00,
//       'cybersecurity': 100000.00,
//       'data science': 80000.00,
//       'data analysis': 80000.00,
//       'product design (ui/ux)': 80000.00,
//       'product management': 80000.00,
//       'web3 and blockchain development': 200000.00,
//       'ai / machine learning': 200000.00,
//       'graphics design': 0.00
//     }

//     const courseKey = (app.course || '').trim().toLowerCase()
//     const originalAmount = pricingMap[courseKey] !== undefined ? pricingMap[courseKey] : 80000.00
//     const studentAmount = originalAmount * 0.20 // 20% student contribution
//     const scholarshipAmount = originalAmount - studentAmount

//     await db.query(
//       `UPDATE scholarship_applications SET status = 'AWAITING_PAYMENT', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
//       [adminNotes || 'Application approved. Proceed to contribution payment.', id],
//     )

//     const randomHex = crypto.randomBytes(4).toString('hex')
//     const paymentReference = `SCH-${app.cohort_id}-${randomHex.toUpperCase()}`

//     const awardResult = await db.query(
//       `INSERT INTO scholarship_awards
//        (application_id, original_amount, student_contribution_percentage, student_amount, scholarship_amount, currency, payment_reference, payment_status, expires_at)
//        VALUES ($1, $2, 20, $3, $4, 'NGN', $5, 'PENDING', CURRENT_TIMESTAMP + INTERVAL '7 days')
//        RETURNING *;`,
//       [id, originalAmount, studentAmount, scholarshipAmount, paymentReference],
//     )

//     const frontendUrl = process.env.FRONTEND_URL || 'https://denskill.com'
//     const paymentLink = `${frontendUrl}/scholarship/pay?reference=${paymentReference}&email=${encodeURIComponent(app.email)}`

//     try {
//       const resend = getResendClient()
//       await resend.emails.send({
//         from: senderEmail,
//         to: [app.email],
//         subject: '🎉 Congratulations! Your Scholarship Has Been Approved',
//         html: scholarshipApprovalEmail(app.first_name, paymentLink),
//       })
//       console.log(`✅ Approval email sent to ${app.email}`)
//     } catch (emailError) {
//       console.error('Failed to send scholarship acceptance email:', emailError.message)
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Scholarship application approved, payment reference generated, and email sent successfully!',
//       award: awardResult.rows[0],
//     })
//   } catch (error) {
//     console.error('Error approving application:', error)
//     res.status(500).json({ success: false, message: 'Server error processing approval' })
//   }
// }

// const rejectApplication = async (req, res) => {
//   const { id } = req.params
//   const { adminNotes } = req.body

//   try {
//     const appResult = await db.query(`SELECT * FROM scholarship_applications WHERE id = $1`, [id])
//     if (appResult.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Scholarship application not found' })
//     }

//     const app = appResult.rows[0]

//     await db.query(
//       `UPDATE scholarship_applications SET status = 'REJECTED', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
//       [adminNotes || 'Application rejected.', id],
//     )

//     try {
//       const resend = getResendClient()
//       await resend.emails.send({
//         from: senderEmail,
//         to: [app.email],
//         subject: 'Update on Your Scholarship Application - D Enskill Academy',
//         html: `
//           <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
//             <h2 style="color: #4F46E5;">Hello ${app.first_name},</h2>
//             <p>Thank you for applying to the D Enskill Academy Scholarship Program. We received a high volume of applications for this cohort.</p>
//             <p>Regrettably, we are unable to offer you a scholarship slot at this time.</p>
//             ${adminNotes ? `<p><strong>Feedback:</strong> ${adminNotes}</p>` : ''}
//             <p>We encourage you to apply again in future cohorts.</p>
//             <p>Best regards,<br/><strong>D Enskill Academy Team</strong></p>
//           </div>
//         `,
//       })
//       console.log(`✅ Rejection email sent to ${app.email}`)
//     } catch (emailError) {
//       console.error('Failed to send rejection email:', emailError.message)
//     }

//     res.status(200).json({ success: true, message: 'Scholarship application rejected and email notification sent.' })
//   } catch (error) {
//     console.error('Error rejecting application:', error)
//     res.status(500).json({ success: false, message: 'Server error processing rejection' })
//   }
// }

// const manualOnboardScholarshipStudent = async (req, res) => {
//   const client = await db.getClient()
//   try {
//     const {
//       firstName,
//       middleName,
//       lastName,
//       email,
//       phone,
//       cohortId,
//       course,
//       password,
//     } = req.body

//     if (!firstName || !lastName || !email || !cohortId) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: 'First name, last name, email, and cohort ID are required.',
//         })
//     }

//     await client.query('BEGIN')

//     const cohortCheck = await client.query(
//       'SELECT * FROM scholarship_cohorts WHERE id = $1',
//       [cohortId],
//     )
//     if (cohortCheck.rows.length === 0) {
//       await client.query('ROLLBACK')
//       return res
//         .status(404)
//         .json({ success: false, message: 'Scholarship cohort not found.' })
//     }

//     const cohort = cohortCheck.rows[0]
//     const rawPassword = password || 'denskill123'
//     const hashedPassword = await bcrypt.hash(rawPassword, 10)

//     const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase()
//     const studentIdCode = `DEN-SCH-${cohort.code || 'COH'}-${randomHex}`

//     const existingUser = await client.query(
//       'SELECT id FROM users WHERE email = $1',
//       [email],
//     )
//     let userId

//     if (existingUser.rows.length > 0) {
//       userId = existingUser.rows[0].id
//       await client.query(
//         `UPDATE users
//          SET student_type = 'SCHOLARSHIP',
//              scholarship_status = 'ACTIVE',
//              cohort_id = $1,
//              course = COALESCE($2, course),
//              password = $3,
//              student_id_code = COALESCE(student_id_code, $4)
//          WHERE id = $5`,
//         [cohortId, course || null, hashedPassword, studentIdCode, userId],
//       )
//     } else {
//       const userResult = await client.query(
//         `INSERT INTO users (first_name, middle_name, last_name, email, phone, student_type, scholarship_status, cohort_id, student_id_code, course, password, role, is_verified)
//          VALUES ($1, $2, $3, $4, $5, 'SCHOLARSHIP', 'ACTIVE', $6, $7, $8, $9, 'student', true) RETURNING id, email, student_id_code`,
//         [
//           firstName,
//           middleName || null,
//           lastName,
//           email,
//           phone || null,
//           cohortId,
//           studentIdCode,
//           course || null,
//           hashedPassword,
//         ],
//       )
//       userId = userResult.rows[0].id
//     }

//     // Keep dashboard metrics and reports synchronized by inserting an enrollment record
//     await client.query(
//       `INSERT INTO enrollments (
//          user_id, first_name, last_name, phone, email,
//          course, total_amount, amount_paid, payment_status, reference
//        ) VALUES ($1, $2, $3, $4, $5, $6, 0, 0, 'completed', $7)
//        ON CONFLICT (reference) DO NOTHING`,
//       [
//         userId,
//         firstName,
//         lastName,
//         phone || null,
//         email,
//         course || 'General',
//         `MANUAL_ONBOARD_${cohortId}_${Date.now()}`,
//       ],
//     )

//     await client.query('COMMIT')

//     return res.status(201).json({
//       success: true,
//       message: 'Scholarship student manually onboarded successfully.',
//       userId,
//       studentIdCode,
//     })
//   } catch (error) {
//     await client.query('ROLLBACK')
//     console.error('Scholarship Manual Onboard Error:', error)
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error during scholarship manual onboarding.',
//       })
//   } finally {
//     client.release()
//   }
// }

// const createCohort = async (req, res) => {
//   const { name, code, startDate, endDate, applicationOpenDate, applicationCloseDate } = req.body

//   try {
//     const result = await db.query(
//       `INSERT INTO scholarship_cohorts
//        (name, code, start_date, end_date, application_open_date, application_close_date, status)
//        VALUES ($1, $2, $3, $4, $5, $6, 'UPCOMING')
//        RETURNING *;`,
//       [name, code, startDate, endDate, applicationOpenDate, applicationCloseDate],
//     )

//     res.status(201).json({
//       success: true,
//       message: 'Scholarship cohort created successfully',
//       cohort: formatCohortResponse(result.rows[0]),
//     })
//   } catch (error) {
//     console.error('Error creating cohort:', error)
//     res.status(500).json({ success: false, message: 'Server error creating cohort' })
//   }
// }

// const updateCohortStatus = async (req, res) => {
//   const { id } = req.params
//   const { status } = req.body

//   try {
//     const result = await db.query(
//       `UPDATE scholarship_cohorts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
//       [status, id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Cohort not found' })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Cohort status updated successfully',
//       cohort: formatCohortResponse(result.rows[0]),
//     })
//   } catch (error) {
//     console.error('Error updating cohort status:', error)
//     res.status(500).json({ success: false, message: 'Server error updating cohort' })
//   }
// }

// const updateCohort = async (req, res) => {
//   const { id } = req.params
//   const { name, code, startDate, endDate, applicationOpenDate, applicationCloseDate, status } = req.body

//   try {
//     const result = await db.query(
//       `UPDATE scholarship_cohorts
//        SET name = COALESCE($1, name),
//            code = COALESCE($2, code),
//            start_date = COALESCE($3, start_date),
//            end_date = COALESCE($4, end_date),
//            application_open_date = COALESCE($5, application_open_date),
//            application_close_date = COALESCE($6, application_close_date),
//            status = COALESCE($7, status),
//            updated_at = CURRENT_TIMESTAMP
//        WHERE id = $8
//        RETURNING *;`,
//       [name, code, startDate, endDate, applicationOpenDate, applicationCloseDate, status, id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Cohort not found' })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Cohort updated successfully',
//       cohort: formatCohortResponse(result.rows[0]),
//     })
//   } catch (error) {
//     console.error('Error updating cohort:', error)
//     res.status(500).json({ success: false, message: 'Server error updating cohort' })
//   }
// }

// const activateCohort = async (req, res) => {
//   const { id } = req.params

//   try {
//     const result = await db.query(
//       `UPDATE scholarship_cohorts
//        SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
//        WHERE id = $1
//        RETURNING *;`,
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Cohort not found' })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Cohort activated successfully',
//       cohort: formatCohortResponse(result.rows[0]),
//     })
//   } catch (error) {
//     console.error('Error activating cohort:', error)
//     res.status(500).json({ success: false, message: 'Server error activating cohort' })
//   }
// }

// const deactivateCohort = async (req, res) => {
//   const { id } = req.params

//   try {
//     const result = await db.query(
//       `UPDATE scholarship_cohorts
//        SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP
//        WHERE id = $1
//        RETURNING *;`,
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Cohort not found' })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Cohort deactivated successfully',
//       cohort: formatCohortResponse(result.rows[0]),
//     })
//   } catch (error) {
//     console.error('Error deactivating cohort:', error)
//     res.status(500).json({ success: false, message: 'Server error deactivating cohort' })
//   }
// }

// const deleteCohort = async (req, res) => {
//   const { id } = req.params

//   try {
//     const result = await db.query(
//       `DELETE FROM scholarship_cohorts WHERE id = $1 RETURNING *;`,
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Cohort not found' })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Cohort deleted successfully',
//     })
//   } catch (error) {
//     console.error('Error deleting cohort:', error)
//     res.status(500).json({ success: false, message: 'Server error deleting cohort' })
//   }
// }

// const getAllCohorts = async (req, res) => {
//   try {
//     const result = await db.query(`SELECT * FROM scholarship_cohorts ORDER BY start_date DESC`)
//     const formattedCohorts = result.rows.map(formatCohortResponse)
    
//     res.status(200).json({ success: true, cohorts: formattedCohorts })
//   } catch (error) {
//     console.error('Error fetching cohorts:', error)
//     res.status(500).json({ success: false, message: 'Server error fetching cohorts' })
//   }
// }

// module.exports = {
//   getScholarshipDashboardMetrics,
//   getAllApplications,
//   getPendingApplications,
//   getAwaitingPaymentApplications,
//   getPaidAndEnrolledStudents,
//   approveApplication,
//   rejectApplication,
//   manualOnboardScholarshipStudent,
//   createCohort,
//   updateCohortStatus,
//   updateCohort,
//   activateCohort,
//   deactivateCohort,
//   deleteCohort,
//   getAllCohorts,
// }



// src/controllers/scholarship/scholarshipAdminController.js
const db = require('../../config/db')
const crypto = require('crypto')

/**
 * @desc    Get scholarship dashboard metrics and active cohort summary
 * @route   GET /api/admin/scholarships/metrics
 * @access  Private/Admin
 */
const getScholarshipDashboardMetrics = async (req, res) => {
  try {
    const { cohortId } = req.query

    let countQuery = `SELECT status, COUNT(*) as count FROM scholarship_applications`
    let countParams = []

    if (cohortId) {
      countQuery += ` WHERE cohort_id = $1`
      countParams.push(cohortId)
    }
    countQuery += ` GROUP BY status`

    const statusCountsResult = await db.query(countQuery, countParams)
    
    let totalApplications = 0
    let pendingCount = 0
    let awaitingPaymentCount = 0
    let enrolledCount = 0

    statusCountsResult.rows.forEach(row => {
      const cnt = parseInt(row.count, 10)
      totalApplications += cnt
      if (row.status === 'PENDING') pendingCount = cnt
      if (row.status === 'APPROVED_AWAITING_PAYMENT') awaitingPaymentCount = cnt
      if (row.status === 'ENROLLED') enrolledCount = cnt
    })

    // Calculate total revenue from scholarship payments for enrolled students
    let revQuery = `SELECT SUM(amount) as total_revenue FROM scholarship_payments WHERE status = 'SUCCESS'`
    let revParams = []
    if (cohortId) {
      revQuery += ` WHERE cohort_id = $1`
      revParams.push(cohortId)
    }
    const revenueResult = await db.query(revQuery, revParams)
    const totalRevenue = revenueResult.rows[0]?.total_revenue ? parseFloat(revenueResult.rows[0].total_revenue) : 0

    // Fetch active cohort details
    let cohortResult
    if (cohortId) {
      cohortResult = await db.query(`SELECT * FROM scholarship_cohorts WHERE id = $1`, [cohortId])
    } else {
      cohortResult = await db.query(`SELECT * FROM scholarship_cohorts WHERE status = 'ACTIVE' LIMIT 1`)
    }
    const activeCohort = cohortResult.rows[0] || null

    return res.status(200).json({
      success: true,
      metrics: {
        totalApplications,
        pendingCount,
        awaitingPaymentCount,
        enrolledCount,
        totalRevenue,
      },
      activeCohort,
    })
  } catch (error) {
    console.error('Error fetching scholarship metrics:', error)
    return res.status(500).json({ success: false, message: 'Server error while retrieving dashboard metrics.' })
  }
}

/**
 * @desc    View all filtered scholarship applications
 * @route   GET /api/admin/scholarships/applications
 * @access  Private/Admin
 */
const getAllApplications = async (req, res) => {
  try {
    const { cohortId, status } = req.query
    let queryStr = `
      SELECT a.*, c.name as cohort_name, c.code as cohort_code 
      FROM scholarship_applications a
      LEFT JOIN scholarship_cohorts c ON a.cohort_id = c.id
      WHERE 1=1
    `
    const params = []
    let paramIndex = 1

    if (cohortId) {
      queryStr += ` AND a.cohort_id = $${paramIndex++}`
      params.push(cohortId)
    }
    if (status) {
      queryStr += ` AND a.status = $${paramIndex++}`
      params.push(status.toUpperCase())
    }

    queryStr += ` ORDER BY a.created_at DESC`

    const { rows: applications } = await db.query(queryStr, params)

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return res.status(500).json({ success: false, message: 'Server error while retrieving applications.' })
  }
}

/**
 * @desc    Get all pending scholarship applications
 * @route   GET /api/admin/scholarships/applications/pending
 * @access  Private/Admin
 */
const getPendingApplications = async (req, res) => {
  try {
    const { cohortId } = req.query
    let queryStr = `
      SELECT a.*, c.name as cohort_name, c.code as cohort_code 
      FROM scholarship_applications a
      LEFT JOIN scholarship_cohorts c ON a.cohort_id = c.id
      WHERE a.status = 'PENDING'
    `
    const params = []
    if (cohortId) {
      queryStr += ` AND a.cohort_id = $1`
      params.push(cohortId)
    }
    queryStr += ` ORDER BY a.created_at ASC`

    const { rows: applications } = await db.query(queryStr, params)

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    })
  } catch (error) {
    console.error('Error fetching pending applications:', error)
    return res.status(500).json({ success: false, message: 'Server error while retrieving pending applications.' })
  }
}

/**
 * @desc    Get applications approved and awaiting student contribution payment
 * @route   GET /api/admin/scholarships/applications/awaiting-payment
 * @access  Private/Admin
 */
const getAwaitingPaymentApplications = async (req, res) => {
  try {
    const { cohortId } = req.query
    let queryStr = `
      SELECT a.*, c.name as cohort_name, c.code as cohort_code, ar.payment_reference, ar.student_amount
      FROM scholarship_applications a
      LEFT JOIN scholarship_cohorts c ON a.cohort_id = c.id
      LEFT JOIN scholarship_awards ar ON ar.application_id = a.id
      WHERE a.status = 'APPROVED_AWAITING_PAYMENT'
    `
    const params = []
    if (cohortId) {
      queryStr += ` AND a.cohort_id = $1`
      params.push(cohortId)
    }
    queryStr += ` ORDER BY a.updated_at DESC`

    const { rows: applications } = await db.query(queryStr, params)

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    })
  } catch (error) {
    console.error('Error fetching awaiting payment applications:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

/**
 * @desc    Get successfully paid and enrolled scholarship students + revenue total
 * @route   GET /api/admin/scholarships/applications/paid
 * @access  Private/Admin
 */
const getPaidAndEnrolledStudents = async (req, res) => {
  try {
    const { cohortId } = req.query
    let queryStr = `
      SELECT a.*, c.name as cohort_name, c.code as cohort_code, p.amount as amount_paid
      FROM scholarship_applications a
      LEFT JOIN scholarship_cohorts c ON a.cohort_id = c.id
      LEFT JOIN scholarship_payments p ON p.application_id = a.id AND p.status = 'SUCCESS'
      WHERE a.status = 'ENROLLED'
    `
    const params = []
    if (cohortId) {
      queryStr += ` AND a.cohort_id = $1`
      params.push(cohortId)
    }
    queryStr += ` ORDER BY a.updated_at DESC`

    const { rows: students } = await db.query(queryStr, params)
    const totalRevenue = students.reduce((acc, curr) => acc + (parseFloat(curr.amount_paid) || 0), 0)

    return res.status(200).json({
      success: true,
      count: students.length,
      totalRevenue,
      students,
    })
  } catch (error) {
    console.error('Error fetching paid students:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

/**
 * @desc    Approve a scholarship application and generate payment reference/award
 * @route   PUT /api/admin/scholarships/applications/:id/approve
 * @access  Private/Admin
 */
const approveApplication = async (req, res) => {
  const client = await db.getClient()
  try {
    const { id } = req.params
    const { adminNotes } = req.body

    await client.query('BEGIN')

    const appResult = await client.query(`SELECT * FROM scholarship_applications WHERE id = $1`, [id])
    if (appResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, message: 'Scholarship application not found.' })
    }

    const paymentReference = `SCH-PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    
    // Update application status
    const updateAppResult = await client.query(`
      UPDATE scholarship_applications 
      SET status = 'APPROVED_AWAITING_PAYMENT', admin_notes = COALESCE($1, admin_notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *
    `, [adminNotes, id])

    // Create or update scholarship award details (Defaulting contribution values)
    await client.query(`
      INSERT INTO scholarship_awards (application_id, payment_reference, payment_status)
      VALUES ($1, $2, 'PENDING')
      ON CONFLICT DO NOTHING
    `, [id, paymentReference])

    await client.query('COMMIT')

    return res.status(200).json({
      success: true,
      message: 'Application approved successfully. Payment reference generated.',
      application: { ...updateAppResult.rows[0], payment_reference: paymentReference },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error approving application:', error)
    return res.status(500).json({ success: false, message: 'Server error during approval.' })
  } finally {
    client.release()
  }
}

/**
 * @desc    Reject a scholarship application
 * @route   PUT /api/admin/scholarships/applications/:id/reject
 * @access  Private/Admin
 */
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params
    const { adminNotes } = req.body

    const { rows } = await db.query(`
      UPDATE scholarship_applications 
      SET status = 'REJECTED', admin_notes = COALESCE($1, admin_notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *
    `, [adminNotes, id])

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship application not found.' })
    }

    return res.status(200).json({
      success: true,
      message: 'Application rejected successfully.',
      application: rows[0],
    })
  } catch (error) {
    console.error('Error rejecting application:', error)
    return res.status(500).json({ success: false, message: 'Server error during rejection.' })
  }
}

/**
 * @desc    Manually onboard a scholarship student with credentials
 * @route   POST /api/admin/scholarships/students/manual-onboard
 * @access  Private/Admin
 */
const manualOnboardScholarshipStudent = async (req, res) => {
  const client = await db.getClient()
  try {
    const { firstName, middleName, lastName, email, phone, cohortId, course, password } = req.body

    if (!firstName || !lastName || !email || !cohortId) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' })
    }

    await client.query('BEGIN')

    const cohortRes = await client.query(`SELECT * FROM scholarship_cohorts WHERE id = $1`, [cohortId])
    if (cohortRes.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, message: 'Scholarship cohort not found.' })
    }
    const cohort = cohortRes.rows[0]

    // Check if user exists
    let userRes = await client.query(`SELECT * FROM users WHERE email = $1`, [email])
    let userId

    if (userRes.rows.length === 0) {
      const hashedPassword = password || 'defaultPassword123'
      const newUserRes = await client.query(`
        INSERT INTO users (first_name, middle_name, last_name, email, phone, password, role, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'student', 'active')
        RETURNING id
      `, [firstName, middleName, lastName, email, phone, hashedPassword])
      userId = newUserRes.rows[0].id
    } else {
      userId = userRes.rows[0].id
    }

    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase()
    const studentIdCode = `DEN-SCH-${cohort.code}-${randomSuffix}`

    const appRes = await client.query(`
      INSERT INTO scholarship_applications (cohort_id, first_name, last_name, email, phone, course, status, student_id_number, admin_notes)
      VALUES ($1, $2, $3, $4, $5, $6, 'ENROLLED', $7, 'Manually onboarded by administrator.')
      RETURNING id
    `, [cohortId, firstName, lastName, email, phone, course || 'Full-Stack Development', studentIdCode])

    await client.query('COMMIT')

    return res.status(201).json({
      success: true,
      message: 'Scholarship student manually onboarded successfully.',
      userId,
      studentIdCode,
      applicationId: appRes.rows[0].id,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error in manual onboarding:', error)
    return res.status(500).json({ success: false, message: 'Server error during manual onboarding.' })
  } finally {
    client.release()
  }
}

/**
 * @desc    List all scholarship cohorts
 * @route   GET /api/admin/scholarships/cohorts
 * @access  Private/Admin
 */
const getAllCohorts = async (req, res) => {
  try {
    const { rows: cohorts } = await db.query(`SELECT * FROM scholarship_cohorts ORDER BY created_at DESC`)
    return res.status(200).json({ success: true, count: cohorts.length, cohorts })
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

/**
 * @desc    Create a new scholarship cohort
 * @route   POST /api/admin/scholarships/cohorts
 * @access  Private/Admin
 */
const createCohort = async (req, res) => {
  try {
    const { name, code, startDate, endDate, applicationOpenDate, applicationCloseDate } = req.body

    if (!name || !code || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required cohort fields.' })
    }

    const { rows } = await db.query(`
      INSERT INTO scholarship_cohorts (name, code, start_date, end_date, application_open_date, application_close_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
      RETURNING *
    `, [name, code, startDate, endDate, applicationOpenDate || startDate, applicationCloseDate || endDate])

    return res.status(201).json({ success: true, message: 'Cohort created successfully', cohort: rows[0] })
  } catch (error) {
    console.error('Error creating cohort:', error)
    return res.status(500).json({ success: false, message: 'Server error during cohort creation.' })
  }
}

/**
 * @desc    Update scholarship cohort status
 * @route   PUT /api/admin/scholarships/cohorts/:id/status
 * @access  Private/Admin
 */
const updateCohortStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const { rows } = await db.query(`
      UPDATE scholarship_cohorts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
    `, [status.toUpperCase(), id])

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Cohort not found.' })

    return res.status(200).json({ success: true, message: 'Cohort status updated successfully.', cohort: rows[0] })
  } catch (error) {
    console.error('Error updating cohort status:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

const activateCohort = async (req, res) => {
  try {
    const { rows } = await db.query(`UPDATE scholarship_cohorts SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [req.params.id])
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Cohort not found.' })
    return res.status(200).json({ success: true, message: 'Cohort activated successfully.', cohort: rows[0] })
  } catch (error) {
    console.error('Error activating cohort:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

const deactivateCohort = async (req, res) => {
  try {
    const { rows } = await db.query(`UPDATE scholarship_cohorts SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [req.params.id])
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Cohort not found.' })
    return res.status(200).json({ success: true, message: 'Cohort deactivated successfully.', cohort: rows[0] })
  } catch (error) {
    console.error('Error deactivating cohort:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

const updateCohort = async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, startDate, endDate, applicationOpenDate, applicationCloseDate } = req.body

    const { rows } = await db.query(`
      UPDATE scholarship_cohorts 
      SET name = COALESCE($1, name), 
          code = COALESCE($2, code), 
          start_date = COALESCE($3, start_date), 
          end_date = COALESCE($4, end_date), 
          application_open_date = COALESCE($5, application_open_date), 
          application_close_date = COALESCE($6, application_close_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *
    `, [name, code, startDate, endDate, applicationOpenDate, applicationCloseDate, id])

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Cohort not found.' })
    return res.status(200).json({ success: true, message: 'Cohort updated successfully.', cohort: rows[0] })
  } catch (error) {
    console.error('Error updating cohort:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

const deleteCohort = async (req, res) => {
  try {
    const { rows } = await db.query(`DELETE FROM scholarship_cohorts WHERE id = $1 RETURNING *`, [req.params.id])
    if (rows.length ===0) return res.status(404).json({ success: false, message: 'Cohort not found.' })
    return res.status(200).json({ success: true, message: 'Cohort deleted successfully.' })
  } catch (error) {
    console.error('Error deleting cohort:', error)
    return res.status(500).json({ success: false, message: 'Server error.' })
  }
}

module.exports = {
  getScholarshipDashboardMetrics,
  getAllApplications,
  getPendingApplications,
  getAwaitingPaymentApplications,
  getPaidAndEnrolledStudents,
  approveApplication,
  rejectApplication,
  manualOnboardScholarshipStudent,
  getAllCohorts,
  createCohort,
  updateCohortStatus,
  activateCohort,
  deactivateCohort,
  updateCohort,
  deleteCohort,
}