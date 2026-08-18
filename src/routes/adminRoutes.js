// // src/routes/adminRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect } = require('../middleware/authMiddleware')
// const { isAdmin } = require('../middleware/adminMiddleware')
// const {
//   adminLogin, // <--- Make sure adminLogin is imported from adminController
//   getAdminOverview,
//   getAllStudents,
//   getAllPayments,
//   getAllCourses,
//   getAdminAnnouncements,
//   createAnnouncement,
//   getInstructors,
//   createInstructor,
//   updateInstructor,
//   deleteInstructor,
//   toggleFreezeStudent,
//   deleteStudentAccount,
//   assignTutorToCourse,
//   getReports,
//   getSettings,
//   executeGradeOverride,
//   getAttendanceOverview,
// } = require('../controllers/adminController')
// const {
//   manualOnboardStudent,
// } = require('../controllers/adminEnrollmentController')

// // ==========================================
// // 1. PUBLIC ADMIN ROUTES (No Auth Required)
// // ==========================================

// /**
//  * @swagger
//  * /api/admin/auth/login:
//  *   post:
//  *     summary: Admin login
//  *     tags: [Admin Auth]
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
//  *         description: Admin logged in successfully
//  *       401:
//  *         description: Invalid credentials
//  */
// router.post('/auth/login', adminLogin)

// // ==========================================
// // 2. PROTECTED ADMIN ROUTES (Auth & Admin Check)
// // ==========================================
// router.use(protect, isAdmin)

// /**
//  * @swagger
//  * /api/admin/dashboard:
//  *   get:
//  *     summary: Get admin metrics and recent enrollments
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Admin overview retrieved successfully
//  *       403:
//  *         description: Admin privileges required
//  */
// router.get('/dashboard', getAdminOverview)

// /**
//  * @swagger
//  * /api/admin/students:
//  *   get:
//  *     summary: Get all registered students
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Students list retrieved successfully
//  */
// router.get('/students', getAllStudents)

// /**
//  * @swagger
//  * /api/admin/students/{id}/status:
//  *   put:
//  *     summary: Freeze or unfreeze a student account
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
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
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [active, frozen]
//  *     responses:
//  *       200:
//  *         description: Account status updated successfully
//  */
// router.put('/students/:id/status', toggleFreezeStudent)

// /**
//  * @swagger
//  * /api/admin/students/{id}:
//  *   delete:
//  *     summary: Delete a student account
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Student account deleted successfully
//  */
// router.delete('/students/:id', deleteStudentAccount)

// /**
//  * @swagger
//  * /api/admin/payments:
//  *   get:
//  *     summary: Get all system payment logs
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Payments list retrieved successfully
//  */
// router.get('/payments', getAllPayments)

// /**
//  * @swagger
//  * /api/admin/courses:
//  *   get:
//  *     summary: Get all courses with enrollment counts
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Courses retrieved successfully
//  */
// router.get('/courses', getAllCourses)

// /**
//  * @swagger
//  * /api/admin/courses/{courseId}/assign-tutor:
//  *   patch:
//  *     summary: Assign a tutor to a course
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               tutorId:
//  *                 type: integer
//  *     responses:
//  *       200:
//  *         description: Tutor assigned successfully
//  */
// router.patch('/courses/:courseId/assign-tutor', assignTutorToCourse)

// /**
//  * @swagger
//  * /api/admin/announcements:
//  *   get:
//  *     summary: Get all system announcements
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Announcements retrieved successfully
//  *   post:
//  *     summary: Create a new announcement
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               title:
//  *                 type: string
//  *               content:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Announcement created successfully
//  */
// router.get('/announcements', getAdminAnnouncements)
// router.post('/announcements', createAnnouncement)

// /**
//  * @swagger
//  * /api/admin/instructors:
//  *   get:
//  *     summary: Get system instructors
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Instructors retrieved successfully
//  *   post:
//  *     summary: Create a new instructor
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               specialty:
//  *                 type: string
//  *               role:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Instructor created successfully
//  */
// router.get('/instructors', getInstructors)
// router.post('/instructors', createInstructor)

// /**
//  * @swagger
//  * /api/admin/instructors/{id}:
//  *   put:
//  *     summary: Update an existing instructor
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
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
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               specialty:
//  *                 type: string
//  *               role:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Instructor updated successfully
//  *   delete:
//  *     summary: Delete an instructor
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Instructor deleted successfully
//  */
// router.put('/instructors/:id', updateInstructor)
// router.delete('/instructors/:id', deleteInstructor)

// /**
//  * @swagger
//  * /api/admin/reports:
//  *   get:
//  *     summary: Get system performance reports and grading metrics
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Reports retrieved successfully
//  */
// router.get('/reports', getReports)

// /**
//  * @swagger
//  * /api/admin/grading/override/{gradeId}:
//  *   put:
//  *     summary: Execute an administrative override for any disputed score or academic adjustment
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: gradeId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Grade override executed successfully
//  */
// router.put('/grading/override/:gradeId', executeGradeOverride)

// /**
//  * @swagger
//  * /api/admin/attendance/overview/{courseId}:
//  *   get:
//  *     summary: Monitor cohort-wide attendance trends and flag chronically absent students
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Attendance overview retrieved successfully
//  */
// router.get('/attendance/overview/:courseId', getAttendanceOverview)

// /**
//  * @swagger
//  * /api/admin/settings:
//  *   get:
//  *     summary: Get platform settings
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Settings retrieved successfully
//  */
// router.get('/settings', getSettings)

// /**
//  * @swagger
//  * /api/admin/enrollments/manual-onboard:
//  *   post:
//  *     summary: Manually onboard a pre-paid/offline student with login credentials
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
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
//  *               - phone
//  *               - course
//  *               - amountPaid
//  *               - password
//  *             properties:
//  *               firstName:
//  *                 type: string
//  *               middleName:
//  *                 type: string
//  *               lastName:
//  *                 type: string
//  *               country:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               course:
//  *                 type: string
//  *               amountPaid:
//  *                 type: number
//  *               password:
//  *                 type: string
//  *               referredBy:
//  *                 type: string
//  *               reason:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Student successfully onboarded with login credentials.
//  *       400:
//  *         description: Validation error or student already exists.
//  */
// router.post('/enrollments/manual-onboard', manualOnboardStudent)

// module.exports = router


// src/routes/adminRoutes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/adminMiddleware')
const {
  adminLogin,
  getAdminOverview,
  getAllStudents,
  getAllPayments,
  getAllCourses,
  getAdminAnnouncements,
  createAnnouncement,
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  toggleFreezeStudent,
  deleteStudentAccount,
  assignTutorToCourse,
  getReports,
  getSettings,
  executeGradeOverride,
  getAttendanceOverview,
  getScholarshipDashboardMetrics,
  getAllApplications,
  approveApplication,
  rejectApplication,
  getAllCohorts,
  createCohort,
  updateCohortStatus,
} = require('../controllers/adminController')
const {
  manualOnboardStudent,
} = require('../controllers/adminEnrollmentController')

// ==========================================
// 1. PUBLIC ADMIN ROUTES (No Auth Required)
// ==========================================

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
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
 *         description: Admin logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', adminLogin)

// ==========================================
// 2. PROTECTED ADMIN ROUTES (Auth & Admin Check)
// ==========================================
router.use(protect, isAdmin)

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin metrics and recent enrollments
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin overview retrieved successfully
 *       403:
 *         description: Admin privileges required
 */
router.get('/dashboard', getAdminOverview)

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all registered students
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Students list retrieved successfully
 */
router.get('/students', getAllStudents)

/**
 * @swagger
 * /api/admin/students/{id}/status:
 *   put:
 *     summary: Freeze or unfreeze a student account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, frozen]
 *     responses:
 *       200:
 *         description: Account status updated successfully
 */
router.put('/students/:id/status', toggleFreezeStudent)

/**
 * @swagger
 * /api/admin/students/{id}:
 *   delete:
 *     summary: Delete a student account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student account deleted successfully
 */
router.delete('/students/:id', deleteStudentAccount)

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all system payment logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments list retrieved successfully
 */
router.get('/payments', getAllPayments)

/**
 * @swagger
 * /api/admin/courses:
 *   get:
 *     summary: Get all courses with enrollment counts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 */
router.get('/courses', getAllCourses)

/**
 * @swagger
 * /api/admin/courses/{courseId}/assign-tutor:
 *   patch:
 *     summary: Assign a tutor to a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tutorId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tutor assigned successfully
 */
router.patch('/courses/:courseId/assign-tutor', assignTutorToCourse)

/**
 * @swagger
 * /api/admin/announcements:
 *   get:
 *     summary: Get all system announcements
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
 *   post:
 *     summary: Create a new announcement
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Announcement created successfully
 */
router.get('/announcements', getAdminAnnouncements)
router.post('/announcements', createAnnouncement)

/**
 * @swagger
 * /api/admin/instructors:
 *   get:
 *     summary: Get system instructors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructors retrieved successfully
 *   post:
 *     summary: Create a new instructor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               specialty:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Instructor created successfully
 */
router.get('/instructors', getInstructors)
router.post('/instructors', createInstructor)

/**
 * @swagger
 * /api/admin/instructors/{id}:
 *   put:
 *     summary: Update an existing instructor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               specialty:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Instructor updated successfully
 *   delete:
 *     summary: Delete an instructor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Instructor deleted successfully
 */
router.put('/instructors/:id', updateInstructor)
router.delete('/instructors/:id', deleteInstructor)

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get system performance reports and grading metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 */
router.get('/reports', getReports)

/**
 * @swagger
 * /api/admin/grading/override/{gradeId}:
 *   put:
 *     summary: Execute an administrative override for any disputed score or academic adjustment
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Grade override executed successfully
 */
router.put('/grading/override/:gradeId', executeGradeOverride)

/**
 * @swagger
 * /api/admin/attendance/overview/{courseId}:
 *   get:
 *     summary: Monitor cohort-wide attendance trends and flag chronically absent students
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance overview retrieved successfully
 */
router.get('/attendance/overview/:courseId', getAttendanceOverview)

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get platform settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
router.get('/settings', getSettings)

/**
 * @swagger
 * /api/admin/enrollments/manual-onboard:
 *   post:
 *     summary: Manually onboard a pre-paid/offline student with login credentials
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *               - phone
 *               - course
 *               - amountPaid
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               course:
 *                 type: string
 *               amountPaid:
 *                 type: number
 *               password:
 *                 type: string
 *               referredBy:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student successfully onboarded with login credentials.
 *       400:
 *         description: Validation error or student already exists.
 */
router.post('/enrollments/manual-onboard', manualOnboardStudent)

// ==========================================
// 3. SCHOLARSHIP MANAGEMENT ROUTES
// ==========================================

/**
 * @swagger
 * /api/admin/scholarships/metrics:
 *   get:
 *     summary: Get scholarship dashboard metrics
 *     tags: [Admin - Scholarships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scholarship metrics retrieved successfully
 */
router.get('/scholarships/metrics', getScholarshipDashboardMetrics)

/**
 * @swagger
 * /api/admin/scholarships/applications:
 *   get:
 *     summary: Get all scholarship applications
 *     tags: [Admin - Scholarships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved successfully
 */
router.get('/scholarships/applications', getAllApplications)

/**
 * @swagger
 * /api/admin/scholarships/applications/{id}/approve:
 *   patch:
 *     summary: Approve a scholarship application
 *     tags: [Admin - Scholarships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application approved successfully
 */
router.patch('/scholarships/applications/:id/approve', approveApplication)

/**
 * @swagger
 * /api/admin/scholarships/applications/{id}/reject:
 *   patch:
 *     summary: Reject a scholarship application
 *     tags: [Admin - Scholarships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application rejected successfully
 */
router.patch('/scholarships/applications/:id/reject', rejectApplication)

/**
 * @swagger
 * /api/admin/scholarships/cohorts:
 *   get:
 *     summary: Get all scholarship cohorts
 *     tags: [Admin - Scholarships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cohorts retrieved successfully
 *   post:
 *     summary: Create a new scholarship cohort
 *     tags: [Admin - Scholarships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Cohort created successfully
 */
router.get('/scholarships/cohorts', getAllCohorts)
router.post('/scholarships/cohorts', createCohort)

/**
 * @swagger
 * /api/admin/scholarships/cohorts/{id}/status:
 *   patch:
 *     summary: Update a scholarship cohort's status
 *     tags: [Admin - Scholarships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cohort status updated successfully
 */
router.patch('/scholarships/cohorts/:id/status', updateCohortStatus)

module.exports = router