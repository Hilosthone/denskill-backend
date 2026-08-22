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
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       student_type:
 *                         type: string
 *                       cohort_name:
 *                         type: string
 *                       cohort_code:
 *                         type: string
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
 *     responses:
 *       200:
 *         description: Attendance overview retrieved successfully
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
 *   post:
 *     summary: Create a new announcement (broadcasted to all students)
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
 *               email:
 *                 type: string
 *               specialty:
 *                 type: string
 *               role:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Instructor created successfully with login credentials
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
 *     responses:
 *       200:
 *         description: Grade override executed successfully
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

/**
 * @swagger
 * /api/admin/emails/send:
 *   post:
 *     summary: Send direct custom email messages to one or multiple users
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
 *               - message
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
 *     responses:
 *       200:
 *         description: Message successfully sent to user inbox(es)
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Failed to deliver emails via Resend
 */
router.post('/emails/send', sendDirectEmailToUsers)

module.exports = router