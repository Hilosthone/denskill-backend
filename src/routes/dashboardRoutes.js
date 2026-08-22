// // src/routes/dashboardRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect } = require('../middleware/authMiddleware')
// const {
//   getStudentOverview,
//   getStudentProfile,
//   getStudentCourses,
//   getStudentPayments,
//   getStudentAnnouncements,
//   getCourseAssessments,
//   submitAssessmentContent,
//   getStudentGradesAndAttendance,
//   getStudentCourseModules,
//   getStudentLiveSessions,
// } = require('../controllers/dashboardController')

// // Protect all routes with auth
// router.use(protect)

// router.get('/overview', getStudentOverview)
// router.get('/profile', getStudentProfile)
// router.get('/courses', getStudentCourses)
// router.get('/payments', getStudentPayments)
// router.get('/receipts', getStudentPayments)
// router.get('/announcements', getStudentAnnouncements)

// // New Assessment, Submission, and Grade/Attendance Routes
// router.get('/assessments/:courseId', getCourseAssessments)
// router.post('/assessments/:assessmentId/submit', submitAssessmentContent)
// router.get('/grades', getStudentGradesAndAttendance)

// // New Course Content & Live Session Routes
// router.get('/modules/:courseId', getStudentCourseModules)
// router.get('/sessions/:courseId', getStudentLiveSessions)

// router.get('/community', (req, res) => {
//   res.status(200).json({ status: 'success', posts: [] })
// })

// const express = require('express')
// const router = express.Router()
// const { protect } = require('../middleware/authMiddleware')
// const {
//   getStudentOverview,
//   getStudentProfile,
//   getStudentCourses,
//   getStudentPayments,
//   getStudentAnnouncements,
//   getCourseAssessments,
//   submitAssessmentContent,
//   getStudentGradesAndAttendance,
//   getStudentCourseModules,
//   getStudentLiveSessions,
//   verifyContributionPayment,
//   getStudentScholarshipProfile,
// } = require('../controllers/dashboardController')

// // Protect all routes with auth
// router.use(protect)

// /**
//  * @swagger
//  * /api/dashboard/overview:
//  *   get:
//  *     summary: Get complete student portal data across all tabs (with assigned tutors and scholarship info if applicable)
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student overview retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 data:
//  *                   type: object
//  *       401:
//  *         description: Unauthorized - Missing or invalid token
//  *       404:
//  *         description: User not found
//  */
// router.get('/overview', getStudentOverview)

// /**
//  * @swagger
//  * /api/dashboard/profile:
//  *   get:
//  *     summary: Get student profile and enrollment metadata
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student profile retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 student:
//  *                   type: object
//  *                   properties:
//  *                     id:
//  *                       type: integer
//  *                       example: 1
//  *                     first_name:
//  *                       type: string
//  *                       example: John
//  *                     last_name:
//  *                       type: string
//  *                       example: Doe
//  *                     email:
//  *                       type: string
//  *                       example: john@example.com
//  *                     student_type:
//  *                       type: string
//  *                       example: REGULAR
//  *       401:
//  *         description: Unauthorized
//  */
// router.get('/profile', getStudentProfile)

// /**
//  * @swagger
//  * /api/dashboard/courses:
//  *   get:
//  *     summary: Get student enrolled courses with assigned tutors
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student courses retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 courses:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       course_id:
//  *                         type: string
//  *                         example: fullstack-dev
//  *                       title:
//  *                         type: string
//  *                         example: Fullstack Web Engineering
//  *                       tutor_name:
//  *                         type: string
//  *                         example: Hilosthone Sulyman
//  *       401:
//  *         description: Unauthorized
//  */
// router.get('/courses', getStudentCourses)

// /**
//  * @swagger
//  * /api/dashboard/payments:
//  *   get:
//  *     summary: Get student payment history
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student payment history retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 payments:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  */
// router.get('/payments', getStudentPayments)

// /**
//  * @swagger
//  * /api/dashboard/receipts:
//  *   get:
//  *     summary: Get student payment receipts/history (Alias for payments)
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Payment receipts retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 payments:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  */
// router.get('/receipts', getStudentPayments)

// /**
//  * @swagger
//  * /api/dashboard/announcements:
//  *   get:
//  *     summary: Get portal announcements
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Announcements retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 announcements:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                       id:
//  *                         type: integer
//  *                         example: 1
//  *                       title:
//  *                         type: string
//  *                         example: Welcome to D Enskill Academy
//  *                       content:
//  *                         type: string
//  *                         example: Classes start next week.
//  *                       created_at:
//  *                         type: string
//  *                         example: 2026-08-21T12:00:00.000Z
//  */
// router.get('/announcements', getStudentAnnouncements)

// /**
//  * @swagger
//  * /api/dashboard/payment/verify:
//  *   post:
//  *     summary: Verify scholarship contribution payment & provision account
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - paymentReference
//  *             properties:
//  *               paymentReference:
//  *                 type: string
//  *                 description: The payment gateway reference code (e.g., Flutterwave ref)
//  *                 example: T123456789_ref
//  *               transactionId:
//  *                 type: string
//  *                 description: Optional transaction identifier
//  *                 example: TXN-987654
//  *     responses:
//  *       200:
//  *         description: Payment verified and account provisioned successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: Payment verified and account provisioned successfully
//  *       400:
//  *         description: Missing reference or payment already completed
//  *       404:
//  *         description: Scholarship award record not found
//  */
// router.post('/payment/verify', verifyContributionPayment)

// /**
//  * @swagger
//  * /api/dashboard/scholarship/profile:
//  *   get:
//  *     summary: Get student scholarship profile details, cohort info, and award breakdown
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Scholarship profile retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 scholarship:
//  *                   type: object
//  *       404:
//  *         description: No scholarship profile found for this email
//  */
// router.get('/scholarship/profile', getStudentScholarshipProfile)

// /**
//  * @swagger
//  * /api/dashboard/assessments/{courseId}:
//  *   get:
//  *     summary: View published quizzes, assessments, and assignments for a course
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID or title key of the course
//  *         example: fullstack-dev
//  *     responses:
//  *       200:
//  *         description: Assessments retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 assessments:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  */
// router.get('/assessments/:courseId', getCourseAssessments)

// /**
//  * @swagger
//  * /api/dashboard/assessments/{assessmentId}/submit:
//  *   post:
//  *     summary: Submit quiz answers or assignment project links/files with deadline duration enforcement
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: assessmentId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: The numeric ID of the assessment
//  *         example: 12
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - content
//  *             properties:
//  *               content:
//  *                 type: string
//  *                 description: Submission answer text, GitHub link, or file URL
//  *                 example: https://github.com/username/repo
//  *     responses:
//  *       201:
//  *         description: Assessment submitted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 message:
//  *                   type: string
//  *                   example: Assessment submitted successfully
//  *       400:
//  *         description: Submission deadline has passed
//  *       404:
//  *         description: Assessment not found
//  */
// router.post('/assessments/:assessmentId/submit', submitAssessmentContent)

// /**
//  * @swagger
//  * /api/dashboard/grades:
//  *   get:
//  *     summary: Fetch personal scores, submission grades, and attendance breakdown
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Grades and attendance breakdown retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 grades:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                 attendance:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  */
// router.get('/grades', getStudentGradesAndAttendance)

// /**
//  * @swagger
//  * /api/dashboard/modules/{courseId}:
//  *   get:
//  *     summary: View weekly lecture modules and downloadable resource files uploaded by tutor
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Course ID
//  *         example: fullstack-dev
//  *     responses:
//  *       200:
//  *         description: Course modules retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 modules:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  */
// router.get('/modules/:courseId', getStudentCourseModules)

// /**
//  * @swagger
//  * /api/dashboard/sessions/{courseId}:
//  *   get:
//  *     summary: View scheduled live workshop sessions and video conference links for a course
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Course ID
//  *         example: fullstack-dev
//  *     responses:
//  *       200:
//  *         description: Live sessions retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 sessions:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  */
// router.get('/sessions/:courseId', getStudentLiveSessions)

// /**
//  * @swagger
//  * /api/dashboard/community:
//  *   get:
//  *     summary: Get community feed posts for students
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Community posts retrieved successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 posts:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  */
// router.get('/community', (req, res) => {
//   res.status(200).json({ status: 'success', posts: [] })
// })

// module.exports = router

const express = require('express')
const router = express.Router()

const {
  getStudentOverview,
  getStudentProfile,
  getStudentCourses,
  getStudentPayments,
  getStudentAnnouncements,
  verifyContributionPayment,
  getStudentScholarshipProfile,
  getCourseAssessments,
  submitAssessmentContent,
  getStudentGradesAndAttendance,
  getStudentCourseModules,
  getStudentLiveSessions,
} = require('../controllers/dashboardController')

// Optional: Add your authentication middleware here if you have one
// const { protect } = require('../middlewares/authMiddleware');
// router.use(protect);

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get complete student portal data across all tabs
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student overview retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/overview', getStudentOverview)

/**
 * @swagger
 * /api/dashboard/profile:
 *   get:
 *     summary: Get student profile and enrollment metadata
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/profile', getStudentProfile)

/**
 * @swagger
 * /api/dashboard/courses:
 *   get:
 *     summary: Get student enrolled courses with assigned tutors
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student courses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/courses', getStudentCourses)

/**
 * @swagger
 * /api/dashboard/payments:
 *   get:
 *     summary: Get student payment history / receipts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/payments', getStudentPayments)

/**
 * @swagger
 * /api/dashboard/announcements:
 *   get:
 *     summary: Get portal announcements
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/announcements', getStudentAnnouncements)

/**
 * @swagger
 * /api/dashboard/payment/verify:
 *   post:
 *     summary: Verify scholarship contribution payment & provision account
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentReference
 *             properties:
 *               paymentReference:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified and account provisioned successfully
 *       400:
 *         description: Missing payment reference
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/payment/verify', verifyContributionPayment)

/**
 * @swagger
 * /api/dashboard/scholarship/profile:
 *   get:
 *     summary: Get student scholarship profile details
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scholarship profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No scholarship profile found
 *       500:
 *         description: Server error
 */
router.get('/scholarship/profile', getStudentScholarshipProfile)

/**
 * @swagger
 * /api/dashboard/assessments/{courseId}:
 *   get:
 *     summary: View published quizzes, assessments, and assignments for a course
 *     tags: [Dashboard]
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
 *         description: Assessments retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/assessments/:courseId', getCourseAssessments)

/**
 * @swagger
 * /api/dashboard/assessments/{assessmentId}/submit:
 *   post:
 *     summary: Submit quiz answers or assignment project links/files
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assessment submitted successfully
 *       400:
 *         description: Missing content or submission deadline passed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/assessments/:assessmentId/submit', submitAssessmentContent)

/**
 * @swagger
 * /api/dashboard/grades:
 *   get:
 *     summary: Fetch personal scores, submission grades, and attendance breakdown
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grades and attendance retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/grades', getStudentGradesAndAttendance)

/**
 * @swagger
 * /api/dashboard/modules/{courseId}:
 *   get:
 *     summary: View weekly lecture modules and downloadable resources
 *     tags: [Dashboard]
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
 *         description: Modules retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/modules/:courseId', getStudentCourseModules)

/**
 * @swagger
 * /api/dashboard/sessions/{courseId}:
 *   get:
 *     summary: View scheduled live workshop sessions
 *     tags: [Dashboard]
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
 *         description: Live sessions retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/sessions/:courseId', getStudentLiveSessions)

module.exports = router