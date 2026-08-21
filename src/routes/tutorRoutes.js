// // src/routes/tutorRoutes.js
// const express = require('express')
// const router = express.Router()
// const tutorController = require('../controllers/tutorController')
// const { protect } = require('../middleware/authMiddleware')

// /**
//  * @swagger
//  * /api/tutors/auth/login:
//  *   post:
//  *     summary: Authenticate a system instructor/tutor with email and password
//  *     tags: [Tutors]
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
//  *                 example: tutor@denskill.com
//  *               password:
//  *                 type: string
//  *                 example: admin@denskill123
//  *     responses:
//  *       200:
//  *         description: Tutor logged in successfully, returns JWT token
//  *       401:
//  *         description: Invalid tutor credentials
//  */
// router.post('/auth/login', tutorController.tutorLogin)

// // Protect all subsequent tutor routes
// router.use(protect)

// /**
//  * @swagger
//  * /api/tutors/assessments:
//  *   post:
//  *     summary: Create a new assessment, quiz, or assignment
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - course_id
//  *               - title
//  *             properties:
//  *               course_id:
//  *                 type: integer
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               type:
//  *                 type: string
//  *                 example: assignment
//  *               total_marks:
//  *                 type: integer
//  *                 example: 100
//  *               weight:
//  *                 type: number
//  *                 example: 1.5
//  *               due_date:
//  *                 type: string
//  *                 format: date-time
//  *     responses:
//  *       201:
//  *         description: Assessment created successfully
//  */
// router.post('/assessments', tutorController.createAssessment)

// /**
//  * @swagger
//  * /api/tutors/assessments/{courseId}:
//  *   get:
//  *     summary: Get all published assessments for a course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: List of assessments retrieved successfully
//  */
// router.get('/assessments/:courseId', tutorController.getAssessmentsByCourse)

// /**
//  * @swagger
//  * /api/tutors/assessments/{assessmentId}:
//  *   put:
//  *     summary: Edit/Update an existing assessment, quiz, or assignment
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: assessmentId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               title:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *               type:
//  *                 type: string
//  *               total_marks:
//  *                 type: integer
//  *               weight:
//  *                 type: number
//  *               due_date:
//  *                 type: string
//  *                 format: date-time
//  *     responses:
//  *       200:
//  *         description: Assessment updated successfully
//  */
// router.put('/assessments/:assessmentId', tutorController.updateAssessment)

// /**
//  * @swagger
//  * /api/tutors/assessments/{assessmentId}:
//  *   delete:
//  *     summary: Delete an assessment, quiz, or assignment
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: assessmentId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Assessment deleted successfully
//  */
// router.delete('/assessments/:assessmentId', tutorController.deleteAssessment)

// /**
//  * @swagger
//  * /api/tutors/submissions/{assessmentId}:
//  *   get:
//  *     summary: View student submissions for an assessment
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: assessmentId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Submissions retrieved successfully
//  */
// router.get(
//   '/submissions/:assessmentId',
//   tutorController.getSubmissionsByAssessment,
// )

// /**
//  * @swagger
//  * /api/tutors/submissions/{submissionId}/grade:
//  *   put:
//  *     summary: Grade a student's submission
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: submissionId
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
//  *               - score
//  *             properties:
//  *               score:
//  *                 type: number
//  *                 example: 85
//  *               feedback:
//  *                 type: string
//  *                 example: Great job implementing the endpoint logic!
//  *     responses:
//  *       200:
//  *         description: Submission graded successfully
//  */
// router.put('/submissions/:submissionId/grade', tutorController.gradeSubmission)

// /**
//  * @swagger
//  * /api/tutors/submissions/{submissionId}/review:
//  *   put:
//  *     summary: Submit iterative code review feedback or request revisions
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: submissionId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               score:
//  *                 type: number
//  *               feedback:
//  *                 type: string
//  *               review_status:
//  *                 type: string
//  *                 example: needs_revision
//  *     responses:
//  *       200:
//  *         description: Review feedback submitted successfully
//  */
// router.put(
//   '/submissions/:submissionId/review',
//   tutorController.submitIterativeFeedback,
// )

// /**
//  * @swagger
//  * /api/tutors/attendance:
//  *   post:
//  *     summary: Log attendance records for students
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - course_id
//  *               - attendance_records
//  *             properties:
//  *               course_id:
//  *                 type: integer
//  *               attendance_records:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     student_id:
//  *                       type: integer
//  *                     status:
//  *                       type: string
//  *                       example: present
//  *     responses:
//  *       200:
//  *         description: Attendance logged successfully
//  */
// router.post('/attendance', tutorController.logAttendance)

// /**
//  * @swagger
//  * /api/tutors/modules:
//  *   post:
//  *     summary: Upload and organize weekly course modules, lectures, and resources
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - course_id
//  *               - title
//  *             properties:
//  *               course_id:
//  *                 type: integer
//  *               title:
//  *                 type: string
//  *               week_number:
//  *                 type: integer
//  *                 example: 1
//  *               content_type:
//  *                 type: string
//  *                 example: video
//  *               resource_url:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Course module uploaded successfully
//  */
// router.post('/modules', tutorController.uploadCourseModule)

// /**
//  * @swagger
//  * /api/tutors/modules/{courseId}:
//  *   get:
//  *     summary: Fetch all course modules and resource files for a specific course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Course modules retrieved successfully
//  */
// router.get('/modules/:courseId', tutorController.getCourseModules)

// /**
//  * @swagger
//  * /api/tutors/sessions:
//  *   post:
//  *     summary: Schedule a live lecture session or office hours meeting link
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - course_id
//  *               - title
//  *               - meeting_link
//  *               - scheduled_at
//  *             properties:
//  *               course_id:
//  *                 type: integer
//  *               title:
//  *                 type: string
//  *               session_type:
//  *                 type: string
//  *                 example: lecture
//  *               meeting_link:
//  *                 type: string
//  *                 example: https://zoom.us/j/123456789
//  *               scheduled_at:
//  *                 type: string
//  *                 format: date-time
//  *               description:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Live session scheduled successfully
//  */
// router.post('/sessions', tutorController.scheduleLiveSession)

// /**
//  * @swagger
//  * /api/tutors/sessions/{courseId}:
//  *   get:
//  *     summary: Get upcoming and past live sessions for a course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Live sessions retrieved successfully
//  */
// router.get('/sessions/:courseId', tutorController.getLiveSessions)

// /**
//  * @swagger
//  * /api/tutors/roster/{courseId}:
//  *   get:
//  *     summary: View enrolled student directory and cohort tracking roster
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Course roster retrieved successfully
//  */
// router.get('/roster/:courseId', tutorController.getCourseRoster)

// /**
//  * @swagger
//  * /api/tutors/announcements:
//  *   post:
//  *     summary: Publish a course-specific real-time announcement or deadline reminder
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - course_id
//  *               - title
//  *               - content
//  *             properties:
//  *               course_id:
//  *                 type: integer
//  *               title:
//  *                 type: string
//  *               content:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Announcement created successfully
//  */
// router.post('/announcements', tutorController.createCourseAnnouncement)

// /**
//  * @swagger
//  * /api/tutors/analytics/{courseId}:
//  *   get:
//  *     summary: Get class grade distributions and early warning performance reports
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Class analytics generated successfully
//  */
// router.get('/analytics/:courseId', tutorController.getClassAnalytics)

// module.exports = router

const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  tutorLogin,
  createAssessment,
  getAssessmentsByCourse,
  updateAssessment,
  deleteAssessment,
  getSubmissionsByAssessment,
  gradeSubmission,
  logAttendance,
  uploadCourseModule,
  getCourseModules,
  scheduleLiveSession,
  getLiveSessions,
  getCourseRoster,
  submitIterativeFeedback,
  createCourseAnnouncement,
  getClassAnalytics,
  getAssignedCohortStudents,
} = require('../controllers/tutorController')

// --- Public Route ---

/**
 * @swagger
 * /api/tutor/login:
 *   post:
 *     summary: Authenticate a tutor/instructor
 *     tags: [Tutors]
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
 *                 example: tutor@denskill.com
 *               password:
 *                 type: string
 *                 example: admin@denskill123
 *     responses:
 *       200:
 *         description: Tutor logged in successfully
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', tutorLogin)

// --- Protected Tutor Routes ---
router.use(protect)

/**
 * @swagger
 * /api/tutor/assessments:
 *   post:
 *     summary: Create a new course assessment or assignment
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - title
 *             properties:
 *               course_id:
 *                 type: string
 *                 example: fullstack-dev
 *               title:
 *                 type: string
 *                 example: Build a REST API
 *               description:
 *                 type: string
 *                 example: Create endpoints for users and products using Express.js
 *               type:
 *                 type: string
 *                 example: assignment
 *               total_marks:
 *                 type: integer
 *                 example: 100
 *               weight:
 *                 type: number
 *                 example: 10
 *               due_date:
 *                 type: string
 *                 example: 2026-09-01T23:59:59.000Z
 *     responses:
 *       201:
 *         description: Assessment created successfully
 */
router.post('/assessments', createAssessment)

/**
 * @swagger
 * /api/tutor/assessments/{courseId}:
 *   get:
 *     summary: Get all assessments for a specific course
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: fullstack-dev
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully
 */
router.get('/assessments/:courseId', getAssessmentsByCourse)

/**
 * @swagger
 * /api/tutor/assessments/{assessmentId}:
 *   put:
 *     summary: Update an existing assessment
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 */
router.put('/assessments/:assessmentId', updateAssessment)

/**
 * @swagger
 * /api/tutor/assessments/{assessmentId}:
 *   delete:
 *     summary: Delete an assessment
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Assessment deleted successfully
 */
router.delete('/assessments/:assessmentId', deleteAssessment)

/**
 * @swagger
 * /api/tutor/assessments/{assessmentId}/submissions:
 *   get:
 *     summary: Get student submissions for a specific assessment
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 */
router.get('/assessments/:assessmentId/submissions', getSubmissionsByAssessment)

/**
 * @swagger
 * /api/tutor/submissions/{submissionId}/grade:
 *   put:
 *     summary: Grade a student's submission and provide feedback
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 42
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *                 example: 85
 *               feedback:
 *                 type: string
 *                 example: Great job on the repository architecture! Clean code.
 *     responses:
 *       200:
 *         description: Submission graded successfully
 */
router.put('/submissions/:submissionId/grade', gradeSubmission)

/**
 * @swagger
 * /api/tutor/submissions/{submissionId}/feedback:
 *   put:
 *     summary: Submit iterative review or feedback on a student code submission
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 42
 *     responses:
 *       200:
 *         description: Review feedback submitted successfully
 */
router.put('/submissions/:submissionId/feedback', submitIterativeFeedback)

/**
 * @swagger
 * /api/tutor/attendance:
 *   post:
 *     summary: Log daily attendance for students in a course session
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - attendance_records
 *             properties:
 *               course_id:
 *                 type: string
 *                 example: fullstack-dev
 *               attendance_records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: integer
 *                       example: 5
 *                     status:
 *                       type: string
 *                       example: present
 *     responses:
 *       200:
 *         description: Attendance logged successfully
 */
router.post('/attendance', logAttendance)

/**
 * @swagger
 * /api/tutor/modules:
 *   post:
 *     summary: Upload a weekly course lecture module or resource file
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Module uploaded successfully
 */
router.post('/modules', uploadCourseModule)

/**
 * @swagger
 * /api/tutor/modules/{courseId}:
 *   get:
 *     summary: Get all modules for a course
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: fullstack-dev
 *     responses:
 *       200:
 *         description: Course modules fetched successfully
 */
router.get('/modules/:courseId', getCourseModules)

/**
 * @swagger
 * /api/tutor/sessions:
 *   post:
 *     summary: Schedule a live workshop session and conference link
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Live session scheduled successfully
 */
router.post('/sessions', scheduleLiveSession)

/**
 * @swagger
 * /api/tutor/sessions/{courseId}:
 *   get:
 *     summary: Get scheduled live sessions for a course
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: fullstack-dev
 *     responses:
 *       200:
 *         description: Live sessions retrieved successfully
 */
router.get('/sessions/:courseId', getLiveSessions)

/**
 * @swagger
 * /api/tutor/roster/{courseId}:
 *   get:
 *     summary: Get list of registered students (roster) for a specific course
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: fullstack-dev
 *     responses:
 *       200:
 *         description: Course roster retrieved successfully
 */
router.get('/roster/:courseId', getCourseRoster)

/**
 * @swagger
 * /api/tutor/announcements:
 *   post:
 *     summary: Create an announcement targeted to a specific course
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Announcement created successfully...
 */
router.post('/announcements', createCourseAnnouncement)

/**
 * @swagger
 * /api/tutor/analytics/{courseId}:
 *   get:
 *     summary: Get summary performance statistics and at-risk student lists for a course
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: fullstack-dev
 *     responses:
 *       200:
 *         description: Analytics generated successfully
 */
router.get('/analytics/:courseId', getClassAnalytics)

/**
 * @swagger
 * /api/tutor/students/cohort:
 *   get:
 *     summary: Get assigned scholarship/cohort students list
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         schema:
 *           type: integer
 *         example: 3
 *     responses:
 *       200:
 *         description: Cohort students retrieved successfully
 */
router.get('/students/cohort', getAssignedCohortStudents)

module.exports = router