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




// controllers/dashboardController.js

// @desc    Get complete student portal data across all tabs
// @route   GET /api/dashboard/overview
// @access  Private (Student)
const getStudentOverview = async (req, res) => {
  try {
    // Fetch student profile, active courses, recent announcements, etc.
    res.status(200).json({ status: 'success', data: {} });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get student profile and enrollment metadata
// @route   GET /api/dashboard/profile
// @access  Private (Student)
const getStudentProfile = async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    res.status(200).json({ status: 'success', student: req.user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get student enrolled courses with assigned tutors
// @route   GET /api/dashboard/courses
// @access  Private (Student)
const getStudentCourses = async (req, res) => {
  try {
    res.status(200).json({ status: 'success', courses: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get student payment history / receipts
// @route   GET /api/dashboard/payments
// @access  Private (Student)
const getStudentPayments = async (req, res) => {
  try {
    res.status(200).json({ status: 'success', payments: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get portal announcements
// @route   GET /api/dashboard/announcements
// @access  Private (Student)
const getStudentAnnouncements = async (req, res) => {
  try {
    res.status(200).json({ status: 'success', announcements: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Verify scholarship contribution payment & provision account
// @route   POST /api/dashboard/payment/verify
// @access  Private (Student)
const verifyContributionPayment = async (req, res) => {
  try {
    const { paymentReference, transactionId } = req.body;
    if (!paymentReference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required' });
    }
    // Verify payment gateway reference here (e.g., Paystack/Flutterwave)
    res.status(200).json({
      success: true,
      message: 'Payment verified and account provisioned successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student scholarship profile details
// @route   GET /api/dashboard/scholarship/profile
// @access  Private (Student)
const getStudentScholarshipProfile = async (req, res) => {
  try {
    res.status(200).json({ status: 'success', scholarship: {} });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    View published quizzes, assessments, and assignments for a course
// @route   GET /api/dashboard/assessments/:courseId
// @access  Private (Student)
const getCourseAssessments = async (req, res) => {
  try {
    const { courseId } = req.params;
    res.status(200).json({ status: 'success', assessments: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Submit quiz answers or assignment project links/files
// @route   POST /api/dashboard/assessments/:assessmentId/submit
// @access  Private (Student)
const submitAssessmentContent = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ status: 'fail', message: 'Submission content is required' });
    }
    res.status(201).json({ status: 'success', message: 'Assessment submitted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Fetch personal scores, submission grades, and attendance breakdown
// @route   GET /api/dashboard/grades
// @access  Private (Student)
const getStudentGradesAndAttendance = async (req, res) => {
  try {
    res.status(200).json({ status: 'success', grades: [], attendance: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    View weekly lecture modules and downloadable resources
// @route   GET /api/dashboard/modules/:courseId
// @access  Private (Student)
const getStudentCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    res.status(200).json({ status: 'success', modules: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    View scheduled live workshop sessions
// @route   GET /api/dashboard/sessions/:courseId
// @access  Private (Student)
const getStudentLiveSessions = async (req, res) => {
  try {
    const { courseId } = req.params;
    res.status(200).json({ status: 'success', sessions: [] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getStudentOverview,
  getStudentProfile,
  getStudentCourses,
  getStudentPayments,
  getStudentAnnouncements,
  getCourseAssessments,
  submitAssessmentContent,
  getStudentGradesAndAttendance,
  getStudentCourseModules,
  getStudentLiveSessions,
  verifyContributionPayment,
  getStudentScholarshipProfile,
};