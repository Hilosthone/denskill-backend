// // src/controllers/scholarship/scholarshipAdminController.js
// const crypto = require('crypto')
// const bcrypt = require('bcryptjs')
// const db = require('../../config/db')

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
//  * to camelCase for safe consumption by the frontend admin dashboard.
//  */
// const formatApplicationResponse = (row) => {
//   if (!row) return null
//   return {
//     id: row.id,
//     cohortId: row.cohort_id,
//     firstName: row.first_name,
//     lastName: row.last_name,
//     fullName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
//     email: row.email,
//     phone: row.phone,
//     country: row.country,
//     course: row.course,
//     educationalBackground: row.educational_background,
//     technicalBackground: row.technical_background,
//     reasonForApplying: row.reason_for_applying,
//     motivation: row.motivation,
//     portfolioUrl: row.portfolio_url,
//     adminNotes: row.admin_notes,
//     status: row.status,
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
//     let params = []

//     if (cohortId) {
//       cohortFilter = 'WHERE cohort_id = $1'
//       params.push(cohortId)
//     }

//     const statsQuery = `
//       SELECT
//         COUNT(*) as total_applications,
//         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_applications,
//         SUM(CASE WHEN status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as under_review,
//         SUM(CASE WHEN status = 'APPROVED' OR status = 'AWAITING_PAYMENT' THEN 1 ELSE 0 END) as approved,
//         SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
//         SUM(CASE WHEN status = 'PAYMENT_COMPLETED' OR status = 'ENROLLED' THEN 1 ELSE 0 END) as paid_enrolled
//       FROM scholarship_applications ${cohortFilter};
//     `

//     const statsResult = await db.query(statsQuery, params)
//     const cohortResult = await db.query(
//       `SELECT * FROM scholarship_cohorts WHERE UPPER(status) = 'ACTIVE' LIMIT 1`,
//     )

//     res.status(200).json({
//       success: true,
//       metrics: statsResult.rows[0],
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
//       SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code
//       FROM scholarship_applications sa
//       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
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

//     await db.query(
//       `UPDATE scholarship_applications SET status = 'AWAITING_PAYMENT', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
//       [adminNotes || 'Application approved. Proceed to contribution payment.', id],
//     )

//     const randomHex = crypto.bytesToHex
//       ? crypto.bytesToHex(crypto.randomBytes(4))
//       : crypto.randomBytes(4).toString('hex')
//     const paymentReference = `SCH-${app.cohort_id}-${randomHex.toUpperCase()}`

//     const awardResult = await db.query(
//       `INSERT INTO scholarship_awards
//        (application_id, original_amount, student_contribution_percentage, student_amount, scholarship_amount, currency, payment_reference, payment_status, expires_at)
//        VALUES ($1, 80000.00, 20, 16000.00, 64000.00, 'NGN', $2, 'PENDING', CURRENT_TIMESTAMP + INTERVAL '7 days')
//        RETURNING *;`,
//       [id, paymentReference],
//     )

//     res.status(200).json({
//       success: true,
//       message: 'Scholarship application approved successfully! Payment reference generated.',
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

//     await db.query(
//       `UPDATE scholarship_applications SET status = 'REJECTED', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
//       [adminNotes || 'Application rejected.', id],
//     )

//     res.status(200).json({ success: true, message: 'Scholarship application rejected.' })
//   } catch (error) {
//     console.error('Error rejecting application:', error)
//     res.status(500).json({ success: false, message: 'Server error processing rejection' })
//   }
// }

// const manualOnboardScholarshipStudent = async (req, res) => {
//   try {
//     const { firstName, middleName, lastName, email, phone, cohortId, course, password } = req.body

//     if (!firstName || !lastName || !email || !cohortId) {
//       return res.status(400).json({ success: false, message: 'First name, last name, email, and cohort ID are required.' })
//     }

//     const cohortCheck = await db.query('SELECT * FROM scholarship_cohorts WHERE id = $1', [cohortId])
//     if (cohortCheck.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Scholarship cohort not found.' })
//     }

//     const cohort = cohortCheck.rows[0]
//     const rawPassword = password || 'denskill123'
//     const hashedPassword = await bcrypt.hash(rawPassword, 10)

//     const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase()
//     const studentIdCode = `DEN-SCH-${cohort.code || 'COH'}-${randomHex}`

//     const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
//     let userId

//     if (existingUser.rows.length > 0) {
//       userId = existingUser.rows[0].id
//       await db.query(
//         `UPDATE users SET student_type = 'SCHOLARSHIP', scholarship_status = 'ACTIVE', cohort_id = $1, student_id_code = COALESCE(student_id_code, $2) WHERE id = $3`,
//         [cohortId, studentIdCode, userId]
//       )
//     } else {
//       const userResult = await db.query(
//         `INSERT INTO users (first_name, middle_name, last_name, email, phone, student_type, scholarship_status, cohort_id, student_id_code, password, role, is_verified)
//          VALUES ($1, $2, $3, $4, $5, 'SCHOLARSHIP', 'ACTIVE', $6, $7, $8, 'student', true) RETURNING id, email, student_id_code`,
//         [firstName, middleName || null, lastName, email, phone || null, cohortId, studentIdCode, hashedPassword]
//       )
//       userId = userResult.rows[0].id
//     }

//     return res.status(201).json({
//       success: true,
//       message: 'Scholarship student manually onboarded successfully.',
//       userId,
//       studentIdCode,
//     })
//   } catch (error) {
//     console.error('Scholarship Manual Onboard Error:', error)
//     return res.status(500).json({ success: false, message: 'Server error during scholarship manual onboarding.' })
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
//       return res.status(404).json({ success: false, message: 'Cohort not found' })
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





// // src/controllers/scholarship/scholarshipAdminController.js
// const crypto = require('crypto')
// const bcrypt = require('bcryptjs')
// const db = require('../../config/db')
// const sendEmail = require('../../utils/sendEmail')
// const scholarshipApprovalEmail = require('../../templates/scholarshipApprovalEmail')

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
//  * to camelCase for safe consumption by the frontend admin dashboard.
//  */
// const formatApplicationResponse = (row) => {
//   if (!row) return null
//   return {
//     id: row.id,
//     cohortId: row.cohort_id,
//     firstName: row.first_name,
//     lastName: row.last_name,
//     fullName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
//     email: row.email,
//     phone: row.phone,
//     country: row.country,
//     course: row.course,
//     educationalBackground: row.educational_background,
//     technicalBackground: row.technical_background,
//     reasonForApplying: row.reason_for_applying,
//     motivation: row.motivation,
//     portfolioUrl: row.portfolio_url,
//     referredBy: row.referred_by || null, // Added referral mapping here
//     adminNotes: row.admin_notes,
//     status: row.status,
//     paymentStatus: row.payment_status || 'PENDING',
//     amountPaid: row.student_amount || 0,
//     paymentReference: row.payment_reference || null,
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
//              saw.payment_status, saw.student_amount, saw.payment_reference
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

// /**
//  * Dedicated Endpoint: Get Pending Applications
//  */
// const getPendingApplications = async (req, res) => {
//   try {
//     const { cohortId } = req.query
//     let query = `
//       SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code
//       FROM scholarship_applications sa
//       JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
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

// /**
//  * Dedicated Endpoint: Get Accepted & Awaiting Payment (Not yet paid)
//  */
// const getAwaitingPaymentApplications = async (req, res) => {
//   try {
//     const { cohortId } = req.query
//     let query = `
//       SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code,
//              saw.payment_status, saw.student_amount, saw.payment_reference, saw.expires_at
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

// /**
//  * Dedicated Endpoint: Get Paid & Enrolled Students (Accepted + Claimed/Paid) + Revenue Summary
//  */
// const getPaidAndEnrolledStudents = async (req, res) => {
//   try {
//     const { cohortId } = req.query
//     let query = `
//       SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code,
//              saw.payment_status, saw.student_amount, saw.payment_reference, saw.updated_at as paid_at
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

//     await db.query(
//       `UPDATE scholarship_applications SET status = 'AWAITING_PAYMENT', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
//       [adminNotes || 'Application approved. Proceed to contribution payment.', id],
//     )

//     const randomHex = crypto.bytesToHex
//       ? crypto.bytesToHex(crypto.randomBytes(4))
//       : crypto.randomBytes(4).toString('hex')
//     const paymentReference = `SCH-${app.cohort_id}-${randomHex.toUpperCase()}`

//     const awardResult = await db.query(
//       `INSERT INTO scholarship_awards
//        (application_id, original_amount, student_contribution_percentage, student_amount, scholarship_amount, currency, payment_reference, payment_status, expires_at)
//        VALUES ($1, 80000.00, 20, 16000.00, 64000.00, 'NGN', $2, 'PENDING', CURRENT_TIMESTAMP + INTERVAL '7 days')
//        RETURNING *;`,
//       [id, paymentReference],
//     )

//     const frontendUrl = process.env.FRONTEND_URL || 'https://denskill.com'
//     const paymentLink = `${frontendUrl}/scholarship/pay?reference=${paymentReference}&email=${encodeURIComponent(app.email)}`

//     try {
//       await sendEmail({
//         to: app.email,
//         subject: '🎉 Congratulations! Your Scholarship Application Has Been Approved',
//         html: scholarshipApprovalEmail(app.first_name, paymentLink),
//       })
//     } catch (emailError) {
//       console.error('Failed to send scholarship acceptance email:', emailError)
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
//       await sendEmail({
//         to: app.email,
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
//     } catch (emailError) {
//       console.error('Failed to send rejection email:', emailError)
//     }

//     res.status(200).json({ success: true, message: 'Scholarship application rejected and email notification sent.' })
//   } catch (error) {
//     console.error('Error rejecting application:', error)
//     res.status(500).json({ success: false, message: 'Server error processing rejection' })
//   }
// }

// const manualOnboardScholarshipStudent = async (req, res) => {
//   try {
//     const { firstName, middleName, lastName, email, phone, cohortId, course, password } = req.body

//     if (!firstName || !lastName || !email || !cohortId) {
//       return res.status(400).json({ success: false, message: 'First name, last name, email, and cohort ID are required.' })
//     }

//     const cohortCheck = await db.query('SELECT * FROM scholarship_cohorts WHERE id = $1', [cohortId])
//     if (cohortCheck.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Scholarship cohort not found.' })
//     }

//     const cohort = cohortCheck.rows[0]
//     const rawPassword = password || 'denskill123'
//     const hashedPassword = await bcrypt.hash(rawPassword, 10)

//     const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase()
//     const studentIdCode = `DEN-SCH-${cohort.code || 'COH'}-${randomHex}`

//     const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
//     let userId

//     if (existingUser.rows.length > 0) {
//       userId = existingUser.rows[0].id
//       await db.query(
//         `UPDATE users SET student_type = 'SCHOLARSHIP', scholarship_status = 'ACTIVE', cohort_id = $1, student_id_code = COALESCE(student_id_code, $2) WHERE id = $3`,
//         [cohortId, studentIdCode, userId]
//       )
//     } else {
//       const userResult = await db.query(
//         `INSERT INTO users (first_name, middle_name, last_name, email, phone, student_type, scholarship_status, cohort_id, student_id_code, password, role, is_verified)
//          VALUES ($1, $2, $3, $4, $5, 'SCHOLARSHIP', 'ACTIVE', $6, $7, $8, 'student', true) RETURNING id, email, student_id_code`,
//         [firstName, middleName || null, lastName, email, phone || null, cohortId, studentIdCode, hashedPassword]
//       )
//       userId = userResult.rows[0].id
//     }

//     return res.status(201).json({
//       success: true,
//       message: 'Scholarship student manually onboarded successfully.',
//       userId,
//       studentIdCode,
//     })
//   } catch (error) {
//     console.error('Scholarship Manual Onboard Error:', error)
//     return res.status(500).json({ success: false, message: 'Server error during scholarship manual onboarding.' })
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
//       return res.status(404).json({ success: false, message: 'Cohort not found' })
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
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const db = require('../../config/db')
const { Resend } = require('resend')
require('dotenv').config()

const senderEmail = process.env.EMAIL_FROM || 'D Enskill Academy <onboarding@denskill.com>'
const scholarshipApprovalEmail = require('../../templates/scholarshipApprovalEmail')

// Helper to get initialized Resend client safely at runtime
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY in environment variables. Please check your .env file.')
  }
  return new Resend(apiKey)
}

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
 * Helper utility to normalize application database fields from snake_case 
 * to camelCase for safe consumption by the frontend admin dashboard.
 */
const formatApplicationResponse = (row) => {
  if (!row) return null
  return {
    id: row.id,
    cohortId: row.cohort_id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    email: row.email,
    phone: row.phone,
    country: row.country,
    course: row.course,
    educationalBackground: row.educational_background,
    technicalBackground: row.technical_background,
    reasonForApplying: row.reason_for_applying,
    motivation: row.motivation,
    portfolioUrl: row.portfolio_url,
    referredBy: row.referred_by || null,
    adminNotes: row.admin_notes,
    status: row.status,
    paymentStatus: row.payment_status || 'PENDING',
    amountPaid: row.student_amount || 0,
    paymentReference: row.payment_reference || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    cohortName: row.cohort_name,
    cohortCode: row.cohort_code,
  }
}

const getScholarshipDashboardMetrics = async (req, res) => {
  try {
    const { cohortId } = req.query
    let cohortFilter = ''
    let awardCohortFilter = ''
    let params = []

    if (cohortId) {
      cohortFilter = 'WHERE sa.cohort_id = $1'
      awardCohortFilter = 'WHERE sa.cohort_id = $1'
      params.push(cohortId)
    }

    const statsQuery = `
      SELECT 
        COUNT(sa.*) as total_applications,
        SUM(CASE WHEN sa.status = 'PENDING' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN sa.status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as under_review,
        SUM(CASE WHEN sa.status = 'APPROVED' OR sa.status = 'AWAITING_PAYMENT' THEN 1 ELSE 0 END) as approved_awaiting_payment,
        SUM(CASE WHEN sa.status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN sa.status = 'PAYMENT_COMPLETED' OR sa.status = 'ENROLLED' THEN 1 ELSE 0 END) as paid_enrolled
      FROM scholarship_applications sa ${cohortFilter};
    `

    const revenueQuery = `
      SELECT 
        COALESCE(SUM(saw.student_amount), 0) as total_revenue,
        COUNT(CASE WHEN saw.payment_status = 'COMPLETED' OR saw.payment_status = 'SUCCESS' THEN 1 END) as paid_count
      FROM scholarship_awards saw
      JOIN scholarship_applications sa ON saw.application_id = sa.id
      ${awardCohortFilter};
    `

    const statsResult = await db.query(statsQuery, params)
    const revenueResult = await db.query(revenueQuery, params)
    const cohortResult = await db.query(
      `SELECT * FROM scholarship_cohorts WHERE UPPER(status) = 'ACTIVE' LIMIT 1`,
    )

    const metrics = {
      ...statsResult.rows[0],
      totalRevenue: Number(revenueResult.rows[0].total_revenue),
      completedPaymentsCount: Number(revenueResult.rows[0].paid_count),
    }

    res.status(200).json({
      success: true,
      metrics,
      activeCohort: formatCohortResponse(cohortResult.rows[0]) || null,
    })
  } catch (error) {
    console.error('Error fetching scholarship metrics:', error)
    res.status(500).json({ success: false, message: 'Server error loading scholarship metrics' })
  }
}

const getAllApplications = async (req, res) => {
  try {
    const { cohortId, status } = req.query
    let query = `
      SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code, 
             saw.payment_status, saw.student_amount, saw.payment_reference
      FROM scholarship_applications sa
      JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
      LEFT JOIN scholarship_awards saw ON sa.id = saw.application_id
    `
    let conditions = []
    let params = []

    if (cohortId) {
      params.push(cohortId)
      conditions.push(`sa.cohort_id = $${params.length}`)
    }
    if (status) {
      params.push(status)
      conditions.push(`sa.status = $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ')
    }

    query += ` ORDER BY sa.created_at DESC`

    const result = await db.query(query, params)
    const formattedApplications = result.rows.map(formatApplicationResponse)

    res.status(200).json({ 
      success: true, 
      count: formattedApplications.length, 
      applications: formattedApplications 
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    res.status(500).json({ success: false, message: 'Server error loading applications' })
  }
}

const getPendingApplications = async (req, res) => {
  try {
    const { cohortId } = req.query
    let query = `
      SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code 
      FROM scholarship_applications sa
      JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
      WHERE sa.status = 'PENDING'
    `
    let params = []
    if (cohortId) {
      params.push(cohortId)
      query += ` AND sa.cohort_id = $1`
    }
    query += ` ORDER BY sa.created_at DESC`

    const result = await db.query(query, params)
    const applications = result.rows.map(formatApplicationResponse)

    res.status(200).json({ success: true, count: applications.length, applications })
  } catch (error) {
    console.error('Error fetching pending applications:', error)
    res.status(500).json({ success: false, message: 'Server error loading pending applications' })
  }
}

const getAwaitingPaymentApplications = async (req, res) => {
  try {
    const { cohortId } = req.query
    let query = `
      SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code, 
             saw.payment_status, saw.student_amount, saw.payment_reference, saw.expires_at
      FROM scholarship_applications sa
      JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
      LEFT JOIN scholarship_awards saw ON sa.id = saw.application_id
      WHERE sa.status IN ('APPROVED', 'AWAITING_PAYMENT') AND (saw.payment_status = 'PENDING' OR saw.payment_status IS NULL)
    `
    let params = []
    if (cohortId) {
      params.push(cohortId)
      query += ` AND sa.cohort_id = $1`
    }
    query += ` ORDER BY sa.created_at DESC`

    const result = await db.query(query, params)
    const applications = result.rows.map(formatApplicationResponse)

    res.status(200).json({ success: true, count: applications.length, applications })
  } catch (error) {
    console.error('Error fetching awaiting payment applications:', error)
    res.status(500).json({ success: false, message: 'Server error loading awaiting payment applications' })
  }
}

const getPaidAndEnrolledStudents = async (req, res) => {
  try {
    const { cohortId } = req.query
    let query = `
      SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code, 
             saw.payment_status, saw.student_amount, saw.payment_reference, saw.updated_at as paid_at
      FROM scholarship_applications sa
      JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
      JOIN scholarship_awards saw ON sa.id = saw.application_id
      WHERE (sa.status = 'PAYMENT_COMPLETED' OR sa.status = 'ENROLLED' OR saw.payment_status = 'COMPLETED' OR saw.payment_status = 'SUCCESS')
    `
    let params = []
    if (cohortId) {
      params.push(cohortId)
      query += ` AND sa.cohort_id = $1`
    }
    query += ` ORDER BY saw.updated_at DESC`

    const result = await db.query(query, params)
    const students = result.rows.map(formatApplicationResponse)

    const totalRevenue = students.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0)

    res.status(200).json({ 
      success: true, 
      count: students.length, 
      totalRevenue, 
      students 
    })
  } catch (error) {
    console.error('Error fetching paid students:', error)
    res.status(500).json({ success: false, message: 'Server error loading paid students' })
  }
}

const approveApplication = async (req, res) => {
  const { id } = req.params
  const { adminNotes } = req.body

  try {
    const appResult = await db.query(`SELECT * FROM scholarship_applications WHERE id = $1`, [id])
    if (appResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship application not found' })
    }

    const app = appResult.rows[0]
    if (app.status === 'APPROVED' || app.status === 'AWAITING_PAYMENT') {
      return res.status(400).json({ success: false, message: 'Application is already approved.' })
    }

    await db.query(
      `UPDATE scholarship_applications SET status = 'AWAITING_PAYMENT', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [adminNotes || 'Application approved. Proceed to contribution payment.', id],
    )

    const randomHex = crypto.bytesToHex
      ? crypto.bytesToHex(crypto.randomBytes(4))
      : crypto.randomBytes(4).toString('hex')
    const paymentReference = `SCH-${app.cohort_id}-${randomHex.toUpperCase()}`

    const awardResult = await db.query(
      `INSERT INTO scholarship_awards 
       (application_id, original_amount, student_contribution_percentage, student_amount, scholarship_amount, currency, payment_reference, payment_status, expires_at)
       VALUES ($1, 80000.00, 20, 16000.00, 64000.00, 'NGN', $2, 'PENDING', CURRENT_TIMESTAMP + INTERVAL '7 days')
       RETURNING *;`,
      [id, paymentReference],
    )

    const frontendUrl = process.env.FRONTEND_URL || 'https://denskill.com'
    const paymentLink = `${frontendUrl}/scholarship/pay?reference=${paymentReference}&email=${encodeURIComponent(app.email)}`

    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: senderEmail,
        to: [app.email],
        subject: '🎉 Congratulations! Your Scholarship Has Been Approved',
        html: scholarshipApprovalEmail(app.first_name, paymentLink),
      })
      console.log(`✅ Approval email sent to ${app.email}`)
    } catch (emailError) {
      console.error('Failed to send scholarship acceptance email:', emailError.message)
    }

    res.status(200).json({
      success: true,
      message: 'Scholarship application approved, payment reference generated, and email sent successfully!',
      award: awardResult.rows[0],
    })
  } catch (error) {
    console.error('Error approving application:', error)
    res.status(500).json({ success: false, message: 'Server error processing approval' })
  }
}

const rejectApplication = async (req, res) => {
  const { id } = req.params
  const { adminNotes } = req.body

  try {
    const appResult = await db.query(`SELECT * FROM scholarship_applications WHERE id = $1`, [id])
    if (appResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship application not found' })
    }

    const app = appResult.rows[0]

    await db.query(
      `UPDATE scholarship_applications SET status = 'REJECTED', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [adminNotes || 'Application rejected.', id],
    )

    try {
      const resend = getResendClient()
      await resend.emails.send({
        from: senderEmail,
        to: [app.email],
        subject: 'Update on Your Scholarship Application - D Enskill Academy',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #4F46E5;">Hello ${app.first_name},</h2>
            <p>Thank you for applying to the D Enskill Academy Scholarship Program. We received a high volume of applications for this cohort.</p>
            <p>Regrettably, we are unable to offer you a scholarship slot at this time.</p>
            ${adminNotes ? `<p><strong>Feedback:</strong> ${adminNotes}</p>` : ''}
            <p>We encourage you to apply again in future cohorts.</p>
            <p>Best regards,<br/><strong>D Enskill Academy Team</strong></p>
          </div>
        `,
      })
      console.log(`✅ Rejection email sent to ${app.email}`)
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError.message)
    }

    res.status(200).json({ success: true, message: 'Scholarship application rejected and email notification sent.' })
  } catch (error) {
    console.error('Error rejecting application:', error)
    res.status(500).json({ success: false, message: 'Server error processing rejection' })
  }
}

const manualOnboardScholarshipStudent = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, phone, cohortId, course, password } = req.body

    if (!firstName || !lastName || !email || !cohortId) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, and cohort ID are required.' })
    }

    const cohortCheck = await db.query('SELECT * FROM scholarship_cohorts WHERE id = $1', [cohortId])
    if (cohortCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scholarship cohort not found.' })
    }

    const cohort = cohortCheck.rows[0]
    const rawPassword = password || 'denskill123'
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase()
    const studentIdCode = `DEN-SCH-${cohort.code || 'COH'}-${randomHex}`

    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
    let userId

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id
      await db.query(
        `UPDATE users SET student_type = 'SCHOLARSHIP', scholarship_status = 'ACTIVE', cohort_id = $1, student_id_code = COALESCE(student_id_code, $2) WHERE id = $3`,
        [cohortId, studentIdCode, userId]
      )
    } else {
      const userResult = await db.query(
        `INSERT INTO users (first_name, middle_name, last_name, email, phone, student_type, scholarship_status, cohort_id, student_id_code, password, role, is_verified) 
         VALUES ($1, $2, $3, $4, $5, 'SCHOLARSHIP', 'ACTIVE', $6, $7, $8, 'student', true) RETURNING id, email, student_id_code`,
        [firstName, middleName || null, lastName, email, phone || null, cohortId, studentIdCode, hashedPassword]
      )
      userId = userResult.rows[0].id
    }

    return res.status(201).json({
      success: true,
      message: 'Scholarship student manually onboarded successfully.',
      userId,
      studentIdCode,
    })
  } catch (error) {
    console.error('Scholarship Manual Onboard Error:', error)
    return res.status(500).json({ success: false, message: 'Server error during scholarship manual onboarding.' })
  }
}

const createCohort = async (req, res) => {
  const { name, code, startDate, endDate, applicationOpenDate, applicationCloseDate } = req.body

  try {
    const result = await db.query(
      `INSERT INTO scholarship_cohorts 
       (name, code, start_date, end_date, application_open_date, application_close_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'UPCOMING')
       RETURNING *;`,
      [name, code, startDate, endDate, applicationOpenDate, applicationCloseDate],
    )

    res.status(201).json({
      success: true,
      message: 'Scholarship cohort created successfully',
      cohort: formatCohortResponse(result.rows[0]),
    })
  } catch (error) {
    console.error('Error creating cohort:', error)
    res.status(500).json({ success: false, message: 'Server error creating cohort' })
  }
}

const updateCohortStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    const result = await db.query(
      `UPDATE scholarship_cohorts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
      [status, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cohort not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Cohort status updated successfully',
      cohort: formatCohortResponse(result.rows[0]),
    })
  } catch (error) {
    console.error('Error updating cohort status:', error)
    res.status(500).json({ success: false, message: 'Server error updating cohort' })
  }
}

const updateCohort = async (req, res) => {
  const { id } = req.params
  const { name, code, startDate, endDate, applicationOpenDate, applicationCloseDate, status } = req.body

  try {
    const result = await db.query(
      `UPDATE scholarship_cohorts 
       SET name = COALESCE($1, name), 
           code = COALESCE($2, code), 
           start_date = COALESCE($3, start_date), 
           end_date = COALESCE($4, end_date), 
           application_open_date = COALESCE($5, application_open_date), 
           application_close_date = COALESCE($6, application_close_date), 
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 
       RETURNING *;`,
      [name, code, startDate, endDate, applicationOpenDate, applicationCloseDate, status, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cohort not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Cohort updated successfully',
      cohort: formatCohortResponse(result.rows[0]),
    })
  } catch (error) {
    console.error('Error updating cohort:', error)
    res.status(500).json({ success: false, message: 'Server error updating cohort' })
  }
}

const activateCohort = async (req, res) => {
  const { id } = req.params

  try {
    const result = await db.query(
      `UPDATE scholarship_cohorts 
       SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *;`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cohort not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Cohort activated successfully',
      cohort: formatCohortResponse(result.rows[0]),
    })
  } catch (error) {
    console.error('Error activating cohort:', error)
    res.status(500).json({ success: false, message: 'Server error activating cohort' })
  }
}

const deactivateCohort = async (req, res) => {
  const { id } = req.params

  try {
    const result = await db.query(
      `UPDATE scholarship_cohorts 
       SET status = 'INACTIVE', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *;`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cohort not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Cohort deactivated successfully',
      cohort: formatCohortResponse(result.rows[0]),
    })
  } catch (error) {
    console.error('Error deactivating cohort:', error)
    res.status(500).json({ success: false, message: 'Server error deactivating cohort' })
  }
}

const deleteCohort = async (req, res) => {
  const { id } = req.params

  try {
    const result = await db.query(
      `DELETE FROM scholarship_cohorts WHERE id = $1 RETURNING *;`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cohort not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Cohort deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting cohort:', error)
    res.status(500).json({ success: false, message: 'Server error deleting cohort' })
  }
}

const getAllCohorts = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM scholarship_cohorts ORDER BY start_date DESC`)
    const formattedCohorts = result.rows.map(formatCohortResponse)
    
    res.status(200).json({ success: true, cohorts: formattedCohorts })
  } catch (error) {
    console.error('Error fetching cohorts:', error)
    res.status(500).json({ success: false, message: 'Server error fetching cohorts' })
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
  createCohort,
  updateCohortStatus,
  updateCohort,
  activateCohort,
  deactivateCohort,
  deleteCohort,
  getAllCohorts,
}