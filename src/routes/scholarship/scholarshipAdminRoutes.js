// // src/routes/scholarship/scholarshipAdminRoutes.js
// const express = require('express')
// const router = express.Router()

// const { protect } = require('../../middleware/authMiddleware')
// const { isAdmin } = require('../../middleware/adminMiddleware')

// const {
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
// } = require('../../controllers/scholarship/scholarshipAdminController')

// /**
//  * @swagger
//  * tags:
//  *   name: Scholarship Admin
//  *   description: Platform management, scholarship cohort creation, application reviews, and manual onboarding
//  */

// // ==========================================
// // PROTECTED SCHOLARSHIP ADMIN ROUTES
// // ==========================================
// router.use(protect, isAdmin)

// /**
//  * @swagger
//  * /api/admin/scholarships/metrics:
//  *   get:
//  *     summary: Get scholarship dashboard metrics and active cohort
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: cohortId
//  *         required: false
//  *         schema:
//  *           type: string
//  *         description: Filter metrics by a specific cohort ID
//  *     responses:
//  *       200:
//  *         description: Scholarship metrics retrieved successfully
//  */
// router.get('/metrics', getScholarshipDashboardMetrics)

// /**
//  * @swagger
//  * /api/admin/scholarships/applications:
//  *   get:
//  *     summary: View all filtered scholarship applications
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: cohortId
//  *         required: false
//  *         schema:
//  *           type: string
//  *         description: Filter applications by cohort ID
//  *       - in: query
//  *         name: status
//  *         required: false
//  *         schema:
//  *           type: string
//  *         description: Filter applications by status (PENDING, APPROVED, REJECTED, etc.)
//  *     responses:
//  *       200:
//  *         description: Applications retrieved successfully
//  */
// router.get('/applications', getAllApplications)

// /**
//  * @swagger
//  * /api/admin/scholarships/applications/{id}/approve:
//  *   put:
//  *     summary: Approve a scholarship application and generate payment reference
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Scholarship application ID
//  *     requestBody:
//  *       required: false
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               adminNotes:
//  *                 type: string
//  *                 example: "Application approved. Proceed to contribution payment."
//  *     responses:
//  *       200:
//  *         description: Application approved successfully
//  */
// router.put('/applications/:id/approve', approveApplication)

// /**
//  * @swagger
//  * /api/admin/scholarships/applications/{id}/reject:
//  *   put:
//  *     summary: Reject a scholarship application
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Scholarship application ID
//  *     requestBody:
//  *       required: false
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               adminNotes:
//  *                 type: string
//  *                 example: "Does not meet criteria."
//  *     responses:
//  *       200:
//  *         description: Application rejected successfully
//  */
// router.put('/applications/:id/reject', rejectApplication)

// /**
//  * @swagger
//  * /api/admin/scholarships/students/manual-onboard:
//  *   post:
//  *     summary: Manually onboard a scholarship student with credentials
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - firstName
//  *               - lastName
//  *               - email
//  *               - cohortId
//  *             properties:
//  *               firstName:
//  *                 type: string
//  *                 example: "Hilosthone"
//  *               middleName:
//  *                 type: string
//  *                 example: "Sulyman"
//  *               lastName:
//  *                 type: string
//  *                 example: "Dev"
//  *               email:
//  *                 type: string
//  *                 example: "student@denskill.com"
//  *               phone:
//  *                 type: string
//  *                 example: "+2348012345678"
//  *               cohortId:
//  *                 type: string
//  *                 example: "1"
//  *               course:
//  *                 type: string
//  *                 example: "Full-Stack Development"
//  *               password:
//  *                 type: string
//  *                 example: "denskill123"
//  *     responses:
//  *       201:
//  *         description: Scholarship student manually onboarded successfully
//  */
// router.post('/students/manual-onboard', manualOnboardScholarshipStudent)

// /**
//  * @swagger
//  * /api/admin/scholarships/cohorts:
//  *   get:
//  *     summary: List all scholarship cohorts
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Cohorts retrieved successfully
//  */
// router.get('/cohorts', getAllCohorts)

// /**
//  * @swagger
//  * /api/admin/scholarships/cohorts:
//  *   post:
//  *     summary: Create a new scholarship cohort
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
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
//  *                 example: "2026 Batch A Scholarship"
//  *               code:
//  *                 type: string
//  *                 example: "COH-2026-A"
//  *               startDate:
//  *                 type: string
//  *                 format: date
//  *                 example: "2026-05-01"
//  *               endDate:
//  *                 type: string
//  *                 format: date
//  *                 example: "2026-10-31"
//  *               applicationOpenDate:
//  *                 type: string
//  *                 format: date
//  *                 example: "2026-04-01"
//  *               applicationCloseDate:
//  *                 type: string
//  *                 format: date
//  *                 example: "2026-04-25"
//  *     responses:
//  *       201:
//  *         description: Cohort created successfully
//  */
// router.post('/cohorts', createCohort)

// // ==========================================
// // COHORT SUB-ROUTES (Specific first)
// // ==========================================

// /**
//  * @swagger
//  * /api/admin/scholarships/cohorts/{id}/status:
//  *   put:
//  *     summary: Update scholarship cohort status (e.g., ACTIVE, CLOSED)
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Cohort ID
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
//  *                 example: "ACTIVE"
//  *     responses:
//  *       200:
//  *         description: Cohort status updated successfully
//  */
// router.put('/cohorts/:id/status', updateCohortStatus)

// /**
//  * @swagger
//  * /api/admin/scholarships/cohorts/{id}/activate:
//  *   patch:
//  *     summary: Activate a scholarship cohort
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Cohort ID
//  *     responses:
//  *       200:
//  *         description: Cohort activated successfully
//  */
// router.patch('/cohorts/:id/activate', activateCohort)

// /**
//  * @swagger
//  * /api/admin/scholarships/cohorts/{id}/deactivate:
//  *   patch:
//  *     summary: Deactivate a scholarship cohort
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Cohort ID
//  *     responses:
//  *       200:
//  *         description: Cohort deactivated successfully
//  */
// router.patch('/cohorts/:id/deactivate', deactivateCohort)

// // ==========================================
// // COHORT GENERAL ROUTES (Parameterized last)
// // ==========================================

// /**
//  * @swagger
//  * /api/admin/scholarships/cohorts/{id}:
//  *   put:
//  *     summary: Edit or update scholarship cohort details
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Cohort ID
//  *     requestBody:
//  *       required: false
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
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
//  *               status:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Cohort updated successfully
//  */
// router.put('/cohorts/:id', updateCohort)

// /**
//  * @swagger
//  * /api/admin/scholarships/cohorts/{id}:
//  *   delete:
//  *     summary: Delete a scholarship cohort
//  *     tags: [Scholarship Admin]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Cohort ID
//  *     responses:
//  *       200:
//  *         description: Cohort deleted successfully
//  */
// router.delete('/cohorts/:id', deleteCohort)

// module.exports = router





// src/routes/scholarship/scholarshipAdminRoutes.js
const express = require('express')
const router = express.Router()


router.get('/debug/all-applications', async (req, res) => {
  try {
    const db = require('../../config/db')
    const result = await db.query(
      'SELECT id, first_name, last_name, email, status, created_at FROM scholarship_applications ORDER BY created_at DESC',
    )
    res.json({
      totalCount: result.rows.length,
      applications: result.rows,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const { protect } = require('../../middleware/authMiddleware')
const { isAdmin } = require('../../middleware/adminMiddleware')

const {
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
} = require('../../controllers/scholarship/scholarshipAdminController')

/**
 * @swagger
 * tags:
 *   name: Scholarship Admin
 *   description: Platform management, scholarship cohort creation, application reviews, and manual onboarding
 */

// ==========================================
// PROTECTED SCHOLARSHIP ADMIN ROUTES
// ==========================================
router.use(protect, isAdmin)

/**
 * @swagger
 * /api/admin/scholarships/metrics:
 *   get:
 *     summary: Get scholarship dashboard metrics and active cohort
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter metrics by a specific cohort ID
 *     responses:
 *       200:
 *         description: Scholarship metrics retrieved successfully
 */
router.get('/metrics', getScholarshipDashboardMetrics)

/**
 * @swagger
 * /api/admin/scholarships/applications:
 *   get:
 *     summary: View all filtered scholarship applications
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter applications by cohort ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter applications by status (PENDING, APPROVED, REJECTED, etc.)
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get('/applications', getAllApplications)

/**
 * @swagger
 * /api/admin/scholarships/applications/pending:
 *   get:
 *     summary: Get all pending scholarship applications
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter pending applications by cohort ID
 *     responses:
 *       200:
 *         description: Pending applications retrieved successfully
 */
router.get('/applications/pending', getPendingApplications)

/**
 * @swagger
 * /api/admin/scholarships/applications/awaiting-payment:
 *   get:
 *     summary: Get applications approved and awaiting student contribution payment
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by cohort ID
 *     responses:
 *       200:
 *         description: Awaiting payment applications retrieved successfully
 */
router.get('/applications/awaiting-payment', getAwaitingPaymentApplications)

/**
 * @swagger
 * /api/admin/scholarships/applications/paid:
 *   get:
 *     summary: Get successfully paid and enrolled scholarship students + revenue total
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by cohort ID
 *     responses:
 *       200:
 *         description: Paid students and revenue retrieved successfully
 */
router.get('/applications/paid', getPaidAndEnrolledStudents)

/**
 * @swagger
 * /api/admin/scholarships/applications/{id}/approve:
 *   put:
 *     summary: Approve a scholarship application and generate payment reference
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scholarship application ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNotes:
 *                 type: string
 *                 example: "Application approved. Proceed to contribution payment."
 *     responses:
 *       200:
 *         description: Application approved successfully
 */
router.put('/applications/:id/approve', approveApplication)

/**
 * @swagger
 * /api/admin/scholarships/applications/{id}/reject:
 *   put:
 *     summary: Reject a scholarship application
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Scholarship application ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNotes:
 *                 type: string
 *                 example: "Does not meet criteria."
 *     responses:
 *       200:
 *         description: Application rejected successfully
 */
router.put('/applications/:id/reject', rejectApplication)

/**
 * @swagger
 * /api/admin/scholarships/students/manual-onboard:
 *   post:
 *     summary: Manually onboard a scholarship student with credentials
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - cohortId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Hilosthone"
 *               middleName:
 *                 type: string
 *                 example: "Sulyman"
 *               lastName:
 *                 type: string
 *                 example: "Dev"
 *               email:
 *                 type: string
 *                 example: "student@denskill.com"
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               cohortId:
 *                 type: string
 *                 example: "1"
 *               course:
 *                 type: string
 *                 example: "Full-Stack Development"
 *               password:
 *                 type: string
 *                 example: "denskill123"
 *     responses:
 *       201:
 *         description: Scholarship student manually onboarded successfully
 */
router.post('/students/manual-onboard', manualOnboardScholarshipStudent)

/**
 * @swagger
 * /api/admin/scholarships/cohorts:
 *   get:
 *     summary: List all scholarship cohorts
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cohorts retrieved successfully
 */
router.get('/cohorts', getAllCohorts)

/**
 * @swagger
 * /api/admin/scholarships/cohorts:
 *   post:
 *     summary: Create a new scholarship cohort
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - startDate
 *               - endDate
 *               - applicationOpenDate
 *               - applicationCloseDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: "2026 Batch A Scholarship"
 *               code:
 *                 type: string
 *                 example: "COH-2026-A"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-10-31"
 *               applicationOpenDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *               applicationCloseDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-25"
 *     responses:
 *       201:
 *         description: Cohort created successfully
 */
router.post('/cohorts', createCohort)

// ==========================================
// COHORT SUB-ROUTES (Specific first)
// ==========================================

/**
 * @swagger
 * /api/admin/scholarships/cohorts/{id}/status:
 *   put:
 *     summary: Update scholarship cohort status (e.g., ACTIVE, CLOSED)
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: "ACTIVE"
 *     responses:
 *       200:
 *         description: Cohort status updated successfully
 */
router.put('/cohorts/:id/status', updateCohortStatus)

/**
 * @swagger
 * /api/admin/scholarships/cohorts/{id}/activate:
 *   patch:
 *     summary: Activate a scholarship cohort
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     responses:
 *       200:
 *         description: Cohort activated successfully
 */
router.patch('/cohorts/:id/activate', activateCohort)

/**
 * @swagger
 * /api/admin/scholarships/cohorts/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a scholarship cohort
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     responses:
 *       200:
 *         description: Cohort deactivated successfully
 */
router.patch('/cohorts/:id/deactivate', deactivateCohort)

// ==========================================
// COHORT GENERAL ROUTES (Parameterized last)
// ==========================================

/**
 * @swagger
 * /api/admin/scholarships/cohorts/{id}:
 *   put:
 *     summary: Edit or update scholarship cohort details
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               applicationOpenDate:
 *                 type: string
 *                 format: date
 *               applicationCloseDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cohort updated successfully
 */
router.put('/cohorts/:id', updateCohort)

/**
 * @swagger
 * /api/admin/scholarships/cohorts/{id}:
 *   delete:
 *     summary: Delete a scholarship cohort
 *     tags: [Scholarship Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cohort ID
 *     responses:
 *       200:
 *         description: Cohort deleted successfully
 */
router.delete('/cohorts/:id', deleteCohort)


// ==========================================
// TEMPORARY DEBUG ROUTE
// ==========================================
// router.get('/debug/all-applications', async (req, res) => {
//   try {
//     const db = require('../../config/db');
//     const result = await db.query('SELECT * FROM scholarship_applications ORDER BY created_at DESC');
//     res.json({
//       totalCount: result.rows.length,
//       applications: result.rows
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router