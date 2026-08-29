// // src/routes/adminRoutes.js
// const express = require('express')
// const router = express.Router()

// const { protect } = require('../middleware/authMiddleware')
// const { isAdmin } = require('../middleware/adminMiddleware')

// const {
//   adminLogin,
//   getAdminOverview,
//   getAllStudents,
//   manualOnboardStudent,
//   getAllPayments,
//   getAllCourses,
//   getAdminAnnouncements,
//   createAnnouncement,
//   updateAnnouncement,
//   deleteAnnouncement,
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
//   sendDirectEmailToUsers,
// } = require('../controllers/adminController')

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
//  *     summary: Get all registered students (Regular and Scholarship)
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: studentType
//  *         schema:
//  *           type: string
//  *           enum: [REGULAR, SCHOLARSHIP]
//  *         description: Filter students by their student type
//  *       - in: query
//  *         name: cohortId
//  *         schema:
//  *           type: integer
//  *         description: Filter students by their scholarship cohort ID
//  *     responses:
//  *       200:
//  *         description: Students list retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 count:
//  *                   type: integer
//  *                   example: 10
//  *                 students:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       id:
//  *                         type: integer
//  *                       first_name:
//  *                         type: string
//  *                       middle_name:
//  *                         type: string
//  *                       last_name:
//  *                         type: string
//  *                       country:
//  *                         type: string
//  *                       password:
//  *                         type: string
//  *                       name:
//  *                         type: string
//  *                       email:
//  *                         type: string
//  *                       phone:
//  *                         type: string
//  *                       student_type:
//  *                         type: string
//  *                       scholarship_status:
//  *                         type: string
//  *                       cohort_id:
//  *                         type: integer
//  *                       cohort_name:
//  *                         type: string
//  *                       cohort_code:
//  *                         type: string
//  *                       is_verified:
//  *                         type: boolean
//  *                       created_at:
//  *                         type: string
//  *                       enrollment_id:
//  *                         type: integer
//  *                       course:
//  *                         type: string
//  *                       reason:
//  *                         type: string
//  *                       referred_by:
//  *                         type: string
//  *                       total_amount:
//  *                         type: number
//  *                       amount_paid:
//  *                         type: number
//  *                       payment_status:
//  *                         type: string
//  *                       reference:
//  *                         type: string
//  *       500:
//  *         description: Server error while fetching students
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
//  * /api/admin/courses/{courseId}/attendance:
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
// router.get('/courses/:courseId/attendance', getAttendanceOverview)

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
//  *     summary: Create a new announcement (broadcasted to all students)
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
//  *               - title
//  *               - content
//  *             properties:
//  *               title:
//  *                 type: string
//  *                 example: Mid-Term Break Notice
//  *               content:
//  *                 type: string
//  *                 example: All regular and scholarship students are to note...
//  *               target:
//  *                 type: string
//  *                 enum: [all, regular, scholarship]
//  *                 example: all
//  *               priority:
//  *                 type: string
//  *                 enum: [normal, high, urgent]
//  *                 example: normal
//  *     responses:
//  *       201:
//  *         description: Announcement created successfully
//  *
//  * /api/admin/announcements/{id}:
//  *   put:
//  *     summary: Update an existing announcement
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Announcement ID
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
//  *               target:
//  *                 type: string
//  *                 enum: [all, regular, scholarship]
//  *               priority:
//  *                 type: string
//  *                 enum: [normal, high, urgent]
//  *     responses:
//  *       200:
//  *         description: Announcement updated successfully
//  *       404:
//  *         description: Announcement not found
//  *   delete:
//  *     summary: Delete an announcement
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Announcement ID
//  *     responses:
//  *       200:
//  *         description: Announcement deleted successfully
//  *       404:
//  *         description: Announcement not found
//  */
// router.get('/announcements', getAdminAnnouncements)
// router.post('/announcements', createAnnouncement)
// router.put('/announcements/:id', updateAnnouncement)
// router.delete('/announcements/:id', deleteAnnouncement)

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
//  *     summary: Create a new instructor/tutor with login credentials
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
//  *               - name
//  *               - email
//  *               - specialty
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               specialty:
//  *                 type: string
//  *               role:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Instructor created successfully with login credentials
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
//  * /api/admin/grades/{gradeId}/override:
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
// router.put('/grades/:gradeId/override', executeGradeOverride)

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

// /**
//  * @swagger
//  * /api/admin/emails/send:
//  *   post:
//  *     summary: Send direct custom email messages to one or multiple users
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
//  *               - emails
//  *               - subject
//  *               - message
//  *             properties:
//  *               emails:
//  *                 type: string
//  *                 example: student1@gmail.com, student2@gmail.com
//  *               subject:
//  *                 type: string
//  *                 example: Important Update Regarding Your Portal Access
//  *               message:
//  *                 type: string
//  *                 example: Hello, please check your dashboard for recent updates.
//  *     responses:
//  *       200:
//  *         description: Message successfully sent to user inbox(es)
//  *       400:
//  *         description: Missing required fields
//  *       500:
//  *         description: Failed to deliver emails via Resend
//  */
// router.post('/emails/send', sendDirectEmailToUsers)

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
  manualOnboardStudent,
  getAllPayments,
  getAllCourses,
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement, 
  deleteAnnouncement, 
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
  sendDirectEmailToUsers,
} = require('../controllers/adminController')

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
 *                 example: admin@denskill.com
 *               password:
 *                 type: string
 *                 example: SecureAdminPassword123!
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Admin logged in successfully
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 admin:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: System Admin
 *                     email:
 *                       type: string
 *                       example: admin@denskill.com
 *                     role:
 *                       type: string
 *                       example: admin
 *       400:
 *         description: Please provide email and password
 *       401:
 *         description: Invalid admin credentials
 *       500:
 *         description: Server error during admin login
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                       example: 250
 *                     totalRevenue:
 *                       type: number
 *                       example: 1250000
 *                     activeCourses:
 *                       type: integer
 *                       example: 12
 *                 recentEnrollments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       first_name:
 *                         type: string
 *                         example: Hilosthone
 *                       middle_name:
 *                         type: string
 *                         example: Sulyman
 *                       last_name:
 *                         type: string
 *                         example: Developer
 *                       course:
 *                         type: string
 *                         example: Frontend Development
 *                       total_amount:
 *                         type: number
 *                         example: 80000
 *                       amount_paid:
 *                         type: number
 *                         example: 20000
 *                       payment_status:
 *                         type: string
 *                         example: PARTIAL
 *                       outstanding_balance:
 *                         type: number
 *                         example: 60000
 *                       created_at:
 *                         type: string
 *                         example: "2026-03-01T10:00:00.000Z"
 *       500:
 *         description: Server error while fetching admin overview
 */
router.get('/dashboard', getAdminOverview)

/**
 * @swagger
 * /api/admin/students:
 *   get:
 *     summary: Get all registered students (Regular and Scholarship)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentType
 *         schema:
 *           type: string
 *           enum: [REGULAR, SCHOLARSHIP]
 *         description: Filter students by their student type
 *       - in: query
 *         name: cohortId
 *         schema:
 *           type: integer
 *         description: Filter students by their scholarship cohort ID
 *     responses:
 *       200:
 *         description: Students list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 count:
 *                   type: integer
 *                   example: 10
 *                 students:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       first_name:
 *                         type: string
 *                         example: Hilosthone
 *                       middle_name:
 *                         type: string
 *                         example: Sulyman
 *                       last_name:
 *                         type: string
 *                         example: Developer
 *                       country:
 *                         type: string
 *                         example: Nigeria
 *                       email:
 *                         type: string
 *                         example: hilosthone@example.com
 *                       phone:
 *                         type: string
 *                         example: "+2348012345678"
 *                       student_type:
 *                         type: string
 *                         example: REGULAR
 *                       is_verified:
 *                         type: boolean
 *                         example: true
 *                       total_amount:
 *                         type: number
 *                         example: 80000
 *                       amount_paid:
 *                         type: number
 *                         example: 20000
 *                       payment_status:
 *                         type: string
 *                         example: PARTIAL
 *                       outstanding_balance:
 *                         type: number
 *                         example: 60000
 *                       created_at:
 *                         type: string
 *                         example: "2026-03-01T10:00:00.000Z"
 *       500:
 *         description: Server error while fetching students
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
 *         description: Student ID
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
 *                 enum: [active, frozen]
 *                 example: frozen
 *     responses:
 *       200:
 *         description: Account status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User account status updated to frozen
 *                 user:
 *                   type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
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
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student account deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       reference:
 *                         type: string
 *                         example: TXN_987654321
 *                       amount_paid:
 *                         type: number
 *                         example: 50000
 *                       payment_status:
 *                         type: string
 *                         example: COMPLETED
 *       500:
 *         description: Server error while fetching payments
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       course:
 *                         type: string
 *                         example: Full-Stack React & Node Engineering
 *                       enrolled_count:
 *                         type: string
 *                         example: "45"
 *       500:
 *         description: Server error while fetching courses
 */
router.get('/courses', getAllCourses)

/**
 * @swagger
 * /api/admin/courses/{courseId}/assign-tutor:
 *   put:
 *     summary: Assign a tutor to a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID or Course Name/Slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorId
 *             properties:
 *               tutorId:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Tutor assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Tutor assigned to course successfully
 *                 course:
 *                   type: object
 *       400:
 *         description: tutorId or instructorId is required
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error while assigning tutor
 */
router.put('/courses/:courseId/assign-tutor', assignTutorToCourse)

/**
 * @swagger
 * /api/admin/courses/{courseId}/attendance:
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
 *         description: Course ID or Identifier
 *     responses:
 *       200:
 *         description: Attendance overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 course_id:
 *                   type: string
 *                   example: "1"
 *                 cohort_attendance:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error fetching attendance overview
 */
router.get('/courses/:courseId/attendance', getAttendanceOverview)

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 announcements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Mid-Term Break Notice
 *                       content:
 *                         type: string
 *                         example: All students are to note...
 *                       target:
 *                         type: string
 *                         example: all
 *                       priority:
 *                         type: string
 *                         example: normal
 *                       created_at:
 *                         type: string
 *                         example: "2026-08-29T10:00:00.000Z"
 *       500:
 *         description: Server error while fetching announcements
 *   post:
 *     summary: Create a new announcement (broadcasted to students)
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
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mid-Term Break Notice
 *               content:
 *                 type: string
 *                 example: All regular and scholarship students are to note...
 *               message:
 *                 type: string
 *                 example: Alternative field for announcement body
 *               target:
 *                 type: string
 *                 enum: [all, regular, scholarship]
 *                 example: all
 *               priority:
 *                 type: string
 *                 enum: [normal, high, urgent]
 *                 example: normal
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *       400:
 *         description: Title and content are required
 *       500:
 *         description: Server error while creating announcement
 *
 * /api/admin/announcements/{id}:
 *   put:
 *     summary: Update an existing announcement
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement ID
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
 *               message:
 *                 type: string
 *               target:
 *                 type: string
 *                 enum: [all, regular, scholarship]
 *               priority:
 *                 type: string
 *                 enum: [normal, high, urgent]
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       404:
 *         description: Announcement not found
 *       500:
 *         description: Server error while updating announcement
 *   delete:
 *     summary: Delete an announcement
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 *       404:
 *         description: Announcement not found
 *       500:
 *         description: Server error while deleting announcement
 */
router.get('/announcements', getAdminAnnouncements)
router.post('/announcements', createAnnouncement)
router.put('/announcements/:id', updateAnnouncement)
router.delete('/announcements/:id', deleteAnnouncement)

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 instructors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error while fetching instructors
 *   post:
 *     summary: Create a new instructor/tutor with login credentials
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
 *               - name
 *               - email
 *               - specialty
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: instructor@denskill.com
 *               specialty:
 *                 type: string
 *                 example: Fullstack & Mobile Development
 *               role:
 *                 type: string
 *                 example: Instructor
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *     responses:
 *       201:
 *         description: Instructor created successfully with login credentials
 *       400:
 *         description: Name, email, and specialty are required
 *       500:
 *         description: Server error while creating instructor
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Instructor updated successfully
 *       404:
 *         description: Instructor not found
 *       500:
 *         description: Server error while updating instructor
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
 *       404:
 *         description: Instructor not found
 *       500:
 *         description: Server error while deleting instructor
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 metrics:
 *                   type: object
 *                 student_aggregates:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error while fetching grading reports
 */
router.get('/reports', getReports)

/**
 * @swagger
 * /api/admin/grades/{gradeId}/override:
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
 *         description: Grade ID to override
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_score
 *             properties:
 *               new_score:
 *                 type: number
 *                 example: 85
 *               feedback:
 *                 type: string
 *                 example: Regraded following formal student appeal on question 4.
 *     responses:
 *       200:
 *         description: Grade override executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 updated_submission:
 *                   type: object
 *       404:
 *         description: Submission/Grade record not found
 *       500:
 *         description: Server error executing grade override
 */
router.put('/grades/:gradeId/override', executeGradeOverride)

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 settings:
 *                   type: object
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
 *               - course
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Hilosthone
 *               middleName:
 *                 type: string
 *                 example: Sulyman
 *               lastName:
 *                 type: string
 *                 example: Developer
 *               country:
 *                 type: string
 *                 example: Nigeria
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 example: student@example.com
 *               course:
 *                 type: string
 *                 example: Mobile App Development
 *               amountPaid:
 *                 type: number
 *                 example: 75000
 *               password:
 *                 type: string
 *                 example: StudentPass123!
 *               referredBy:
 *                 type: string
 *                 example: Direct Outreach
 *               reason:
 *                 type: string
 *                 example: Offline bank transfer confirmed.
 *     responses:
 *       201:
 *         description: Student manually onboarded successfully.
 *       400:
 *         description: First name, last name, email, and course are required.
 *       500:
 *         description: Server error during manual student onboarding.
 */
router.post('/enrollments/manual-onboard', manualOnboardStudent)

/**
 * @swagger
 * /api/admin/emails/send:
 *   post:
 *     summary: Send direct custom email messages to one or multiple users with full HTML, links, and attachments support
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
 *               - emails
 *               - subject
 *             properties:
 *               emails:
 *                 type: string
 *                 example: student1@gmail.com, student2@gmail.com
 *               subject:
 *                 type: string
 *                 example: Important Update Regarding Your Portal Access
 *               message:
 *                 type: string
 *                 example: Hello, please check your dashboard for recent updates.
 *               html:
 *                 type: string
 *                 example: <p>Hello, check your <a href="https://denskill.com">dashboard</a>.</p>
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     content:
 *                       type: string
 *               cc:
 *                 type: string
 *               bcc:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message successfully sent to user inbox(es)!
 *       400:
 *         description: Please provide recipient emails, subject, and message content.
 *       500:
 *         description: Failed to deliver emails via Resend or internal server error.
 */
router.post('/emails/send', sendDirectEmailToUsers)

module.exports = router