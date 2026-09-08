// // module.exports = router

// // src/routes/adminRoutes.js
// const express = require('express')
// const router = express.Router()

// // Middleware imports for securing routes and enforcing admin permissions
// const { protect } = require('../middleware/authMiddleware')
// const { isAdmin } = require('../middleware/adminMiddleware')

// // Controller functions that handle the business logic for each administrative endpoint
// const {
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
// // PROTECTED ADMIN ROUTES (Auth & Admin Check)
// // ==========================================
// // This global middleware layer intercepts all subsequent routes, ensuring 
// // that incoming requests possess a valid Bearer token and hold admin privileges.
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
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 metrics:
//  *                   type: object
//  *                   properties:
//  *                     totalStudents:
//  *                       type: integer
//  *                       example: 250
//  *                     totalRevenue:
//  *                       type: number
//  *                       example: 1250000
//  *                     activeCourses:
//  *                       type: integer
//  *                       example: 12
//  *                 recentEnrollments:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *       500:
//  *         description: Server error while fetching admin overview
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
//  *         description: Student ID
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
//  *                 enum: [active, frozen]
//  *                 example: frozen
//  *     responses:
//  *       200:
//  *         description: Account status updated successfully
//  *       404:
//  *         description: User not found
//  *       500:
//  *         description: Server error
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
//  *         description: Student ID
//  *     responses:
//  *       200:
//  *         description: Student account deleted successfully
//  *       404:
//  *         description: User not found
//  *       500:
//  *         description: Server error
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
//  *       500:
//  *         description: Server error while fetching payments
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
//  *       500:
//  *         description: Server error while fetching courses
//  */
// router.get('/courses', getAllCourses)

// /**
//  * @swagger
//  * /api/admin/courses/{courseId}/assign-tutor:
//  *   put:
//  *     summary: Assign a tutor to a course
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Course ID or Course Name/Slug
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - tutorId
//  *             properties:
//  *               tutorId:
//  *                 type: integer
//  *                 example: 3
//  *     responses:
//  *       200:
//  *         description: Tutor assigned successfully
//  *       400:
//  *         description: tutorId is required
//  *       404:
//  *         description: Course not found
//  *       500:
//  *         description: Server error while assigning tutor
//  */
// router.put('/courses/:courseId/assign-tutor', assignTutorToCourse)

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
//  *         description: Course ID or Identifier
//  *     responses:
//  *       200:
//  *         description: Attendance overview retrieved successfully
//  *       500:
//  *         description: Server error fetching attendance overview
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
//  *     summary: Create a new announcement (broadcasted to students)
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
//  *               content:
//  *                 type: string
//  *               target:
//  *                 type: string
//  *                 enum: [all, regular, scholarship]
//  *               priority:
//  *                 type: string
//  *                 enum: [normal, high, urgent]
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
//  *     summary: Execute an administrative override for any disputed score
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: gradeId
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
//  *               - new_score
//  *             properties:
//  *               new_score:
//  *                 type: number
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
//  *               - course
//  *     responses:
//  *       201:
//  *         description: Student manually onboarded successfully
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
//  *     responses:
//  *       200:
//  *         description: Message successfully sent
//  */
// router.post('/emails/send', sendDirectEmailToUsers)

// module.exports = router




/**
 * @file adminRoutes.js
 * @description Express router configuration for all administrative endpoints. 
 * Enforces authentication and administrator privilege checks globally, 
 * complete with OpenAPI / Swagger documentation blocks.
 */

const express = require('express')
const router = express.Router()

// Middleware imports for securing routes and enforcing admin permissions
const { protect } = require('../middleware/authMiddleware')
const { isAdmin } = require('../middleware/adminMiddleware')

// Controller functions handling the business logic for each administrative endpoint
const {
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
// PROTECTED ADMIN ROUTES (Auth & Admin Check)
// ==========================================
router.use(protect, isAdmin)

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard overview and metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin overview retrieved successfully
 *       500:
 *         description: Server error while fetching admin overview
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/students/:id', deleteStudentAccount)

/**
 * @swagger
 * /api/admin/enrollments/manual-onboard:
 *   post:
 *     summary: Manually onboard a pre-paid/offline student
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
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               course:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student manually onboarded successfully
 */
router.post('/enrollments/manual-onboard', manualOnboardStudent)

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
 *         description: Course ID or Identifier
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
 *       400:
 *         description: tutorId is required
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
 *               content:
 *                 type: string
 *               target:
 *                 type: string
 *                 enum: [all, regular, scholarship]
 *               priority:
 *                 type: string
 *                 enum: [normal, high, urgent]
 *     responses:
 *       201:
 *         description: Announcement created successfully
 */
router.get('/announcements', getAdminAnnouncements)
router.post('/announcements', createAnnouncement)

/**
 * @swagger
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
router.put('/announcements/:id', updateAnnouncement)
router.delete('/announcements/:id', deleteAnnouncement)

/**
 * @swagger
 * /api/admin/tutors:
 *   get:
 *     summary: Get system tutors/instructors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutors retrieved successfully
 *   post:
 *     summary: Create a new tutor/instructor with login credentials
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
 *     responses:
 *       201:
 *         description: Tutor created successfully
 */
router.get('/tutors', getInstructors)
router.post('/tutors', createInstructor)

/**
 * @swagger
 * /api/admin/tutors/{id}:
 *   put:
 *     summary: Update an existing tutor/instructor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tutor ID
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
 *     responses:
 *       200:
 *         description: Tutor updated successfully
 *       404:
 *         description: Tutor not found
 *   delete:
 *     summary: Delete a tutor/instructor
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tutor ID
 *     responses:
 *       200:
 *         description: Tutor deleted successfully
 *       404:
 *         description: Tutor not found
 */
router.put('/tutors/:id', updateInstructor)
router.delete('/tutors/:id', deleteInstructor)

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
 *     summary: Execute an administrative override for any disputed score
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gradeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Grade ID
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
 *                 example: 85.5
 *     responses:
 *       200:
 *         description: Grade override executed successfully
 *       404:
 *         description: Grade record not found
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
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["student@example.com"]
 *               subject:
 *                 type: string
 *                 example: "Important Notice"
 *               message:
 *                 type: string
 *                 example: "Hello, please check your dashboard."
 *     responses:
 *       200:
 *         description: Message successfully sent
 */
router.post('/emails/send', sendDirectEmailToUsers)

module.exports = router