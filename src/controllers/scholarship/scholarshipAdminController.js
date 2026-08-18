// const db = require('../../config/db')
// const crypto = require('crypto')
// const { sendApprovalEmail } = require('../../services/emailService')

// /**
//  * @swagger
//  * /api/scholarship/admin/metrics:
//  *   get:
//  *     summary: Get scholarship dashboard metrics and statistics
//  *     tags: [Scholarship Admin]
//  *     parameters:
//  *       - in: query
//  *         name: cohortId
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Metrics retrieved successfully
//  *       500:
//  *         description: Server error loading metrics
//  */
// exports.getScholarshipDashboardMetrics = async (req, res) => {
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

//     // Get Active Cohort Info
//     const cohortResult = await db.query(
//       `SELECT * FROM scholarship_cohorts WHERE status = 'ACTIVE' LIMIT 1`,
//     )

//     res.status(200).json({
//       success: true,
//       metrics: statsResult.rows[0],
//       activeCohort: cohortResult.rows[0] || null,
//     })
//   } catch (error) {
//     console.error('Error fetching scholarship metrics:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Server error loading scholarship metrics',
//     })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/admin/applications:
//  *   get:
//  *     summary: Get all scholarship applications
//  *     tags: [Scholarship Admin]
//  *     parameters:
//  *       - in: query
//  *         name: cohortId
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: status
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Applications retrieved successfully
//  *       500:
//  *         description: Server error loading applications
//  */
// exports.getAllApplications = async (req, res) => {
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
//     res.status(200).json({
//       success: true,
//       count: result.rows.length,
//       applications: result.rows,
//     })
//   } catch (error) {
//     console.error('Error fetching applications:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error loading applications' })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/admin/applications/{id}/approve:
//  *   patch:
//  *     summary: Approve scholarship application and generate award/payment reference
//  *     tags: [Scholarship Admin]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               adminNotes:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Application approved and reference generated successfully
//  *       400:
//  *         description: Application is already approved
//  *       404:
//  *         description: Scholarship application not found
//  *       500:
//  *         description: Server error processing approval
//  */
// exports.approveApplication = async (req, res) => {
//   const { id } = req.params
//   const { adminNotes } = req.body

//   try {
//     // Check if application exists
//     const appResult = await db.query(
//       `SELECT * FROM scholarship_applications WHERE id = $1`,
//       [id],
//     )
//     if (appResult.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Scholarship application not found' })
//     }

//     const app = appResult.rows[0]

//     if (app.status === 'APPROVED' || app.status === 'AWAITING_PAYMENT') {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Application is already approved.' })
//     }

//     // Update application status
//     await db.query(
//       `UPDATE scholarship_applications SET status = 'AWAITING_PAYMENT', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
//       [
//         adminNotes || 'Application approved. Proceed to contribution payment.',
//         id,
//       ],
//     )

//     // Generate Unique Payment Reference
//     const randomHex = crypto.bytesToHex
//       ? crypto.bytesToHex(crypto.randomBytes(4))
//       : crypto.randomBytes(4).toString('hex')
//     const paymentReference = `SCH-${app.cohort_id}-${randomHex.toUpperCase()}`

//     // Create Scholarship Award record (80000 original, 20% = 16000 student contribution)
//     const awardResult = await db.query(
//       `INSERT INTO scholarship_awards 
//        (application_id, original_amount, student_contribution_percentage, student_amount, scholarship_amount, currency, payment_reference, payment_status, expires_at)
//        VALUES ($1, 80000.00, 20, 16000.00, 64000.00, 'NGN', $2, 'PENDING', CURRENT_TIMESTAMP + INTERVAL '7 days')
//        RETURNING *;`,
//       [id, paymentReference],
//     )

//     // Trigger Approval Email notification to student with payment link & reference
//     const paymentLink = `https://denskill.com/scholarship/pay?ref=${paymentReference}`
//     await sendApprovalEmail(app.email, app.first_name, paymentLink)

//     res.status(200).json({
//       success: true,
//       message:
//         'Scholarship application approved successfully! Payment reference generated & email sent.',
//       award: awardResult.rows[0],
//     })
//   } catch (error) {
//     console.error('Error approving application:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error processing approval' })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/admin/applications/{id}/reject:
//  *   patch:
//  *     summary: Reject scholarship application
//  *     tags: [Scholarship Admin]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               adminNotes:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Scholarship application rejected
//  *       404:
//  *         description: Scholarship application not found
//  *       500:
//  *         description: Server error processing rejection
//  */
// exports.rejectApplication = async (req, res) => {
//   const { id } = req.params
//   const { adminNotes } = req.body

//   try {
//     const appResult = await db.query(
//       `SELECT * FROM scholarship_applications WHERE id = $1`,
//       [id],
//     )
//     if (appResult.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Scholarship application not found' })
//     }

//     await db.query(
//       `UPDATE scholarship_applications SET status = 'REJECTED', admin_notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
//       [adminNotes || 'Application rejected.', id],
//     )

//     res
//       .status(200)
//       .json({ success: true, message: 'Scholarship application rejected.' })
//   } catch (error) {
//     console.error('Error rejecting application:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error processing rejection' })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/admin/cohorts:
//  *   post:
//  *     summary: Create a new scholarship cohort
//  *     tags: [Scholarship Admin]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - name
//  *               - code
//  *               - startDate
//  *               - endDate
//  *               - applicationOpenDate
//  *               - applicationCloseDate
//  *             properties:
//  *               name:
//  *                 type: string
//  *               code:
//  *                 type: string
//  *               startDate:
//  *                 type: string
//  *                 format: date
//  *               endDate:
//  *                 type: string
//  *                 format: date
//  *               applicationOpenDate:
//  *                 type: string
//  *                 format: date
//  *               applicationCloseDate:
//  *                 type: string
//  *                 format: date
//  *     responses:
//  *       201:
//  *         description: Scholarship cohort created successfully
//  *       500:
//  *         description: Server error creating cohort
//  */
// exports.createCohort = async (req, res) => {
//   const {
//     name,
//     code,
//     startDate,
//     endDate,
//     applicationOpenDate,
//     applicationCloseDate,
//   } = req.body

//   try {
//     const result = await db.query(
//       `INSERT INTO scholarship_cohorts 
//        (name, code, start_date, end_date, application_open_date, application_close_date, status)
//        VALUES ($1, $2, $3, $4, $5, $6, 'UPCOMING')
//        RETURNING *;`,
//       [
//         name,
//         code,
//         startDate,
//         endDate,
//         applicationOpenDate,
//         applicationCloseDate,
//       ],
//     )

//     res.status(201).json({
//       success: true,
//       message: 'Scholarship cohort created successfully',
//       cohort: result.rows[0],
//     })
//   } catch (error) {
//     console.error('Error creating cohort:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error creating cohort' })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/admin/cohorts/{id}/status:
//  *   patch:
//  *     summary: Update cohort status
//  *     tags: [Scholarship Admin]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - status
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [UPCOMING, APPLICATION_OPEN, APPLICATION_CLOSED, ACTIVE, COMPLETED, CANCELLED]
//  *     responses:
//  *       200:
//  *         description: Cohort status updated successfully
//  *       404:
//  *         description: Cohort not found
//  *       500:
//  *         description: Server error updating cohort
//  */
// exports.updateCohortStatus = async (req, res) => {
//   const { id } = req.params
//   const { status } = req.body

//   try {
//     const result = await db.query(
//       `UPDATE scholarship_cohorts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
//       [status, id],
//     )

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Cohort not found' })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Cohort status updated successfully',
//       cohort: result.rows[0],
//     })
//   } catch (error) {
//     console.error('Error updating cohort status:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error updating cohort' })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/admin/cohorts:
//  *   get:
//  *     summary: Get all scholarship cohorts
//  *     tags: [Scholarship Admin]
//  *     responses:
//  *       200:
//  *         description: Cohorts fetched successfully
//  *       500:
//  *         description: Server error fetching cohorts
//  */
// exports.getAllCohorts = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT * FROM scholarship_cohorts ORDER BY start_date DESC`,
//     )
//     res.status(200).json({ success: true, cohorts: result.rows })
//   } catch (error) {
//     console.error('Error fetching cohorts:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching cohorts' })
//   }
// }