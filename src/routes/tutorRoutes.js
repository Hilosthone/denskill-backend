// // src/routes/tutorRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect } = require('../middleware/authMiddleware')
// const {
//   tutorLogin,
//   createAssessment,
//   getAssessmentsByCourse,
//   updateAssessment,
//   deleteAssessment,
//   getSubmissionsByAssessment,
//   gradeSubmission,
//   logAttendance,
//   uploadCourseModule,
//   getCourseModules,
//   scheduleLiveSession,
//   getLiveSessions,
//   getCourseRoster,
//   submitIterativeFeedback,
//   createCourseAnnouncement,
//   getClassAnalytics,
//   getAssignedCohortStudents,
//   getTutorCourses,
// } = require('../controllers/tutorController')

// // --- Public Route ---

// /**
//  * @swagger
//  * /api/tutor/login:
//  *   post:
//  *     summary: Authenticate a tutor/instructor
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
//  *         description: Tutor logged in successfully
//  *       401:
//  *         description: Invalid credentials
//  */
// router.post('/login', tutorLogin)

// // --- Protected Tutor Routes ---
// router.use(protect)

// /**
//  * @swagger
//  * /api/tutor/courses:
//  *   get:
//  *     summary: Get courses assigned to the logged-in tutor
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Tutor courses retrieved successfully
//  */
// router.get('/courses', getTutorCourses)

// /**
//  * @swagger
//  * /api/tutor/assessments:
//  *   post:
//  *     summary: Create a new course assessment or assignment
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
//  *                 type: string
//  *                 example: fullstack-dev
//  *               title:
//  *                 type: string
//  *                 example: Build a REST API
//  *               description:
//  *                 type: string
//  *                 example: Create endpoints for users and products using Express.js
//  *               type:
//  *                 type: string
//  *                 example: assignment
//  *               total_marks:
//  *                 type: integer
//  *                 example: 100
//  *               weight:
//  *                 type: number
//  *                 example: 10
//  *               due_date:
//  *                 type: string
//  *                 example: 2026-09-01T23:59:59.000Z
//  *     responses:
//  *       201:
//  *         description: Assessment created successfully
//  */
// router.post('/assessments', createAssessment)

// /**
//  * @swagger
//  * /api/tutor/assessments/{courseId}:
//  *   get:
//  *     summary: Get all assessments for a specific course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: fullstack-dev
//  *     responses:
//  *       200:
//  *         description: Assessments retrieved successfully
//  */
// router.get('/assessments/:courseId', getAssessmentsByCourse)

// /**
//  * @swagger
//  * /api/tutor/assessments/{assessmentId}:
//  *   put:
//  *     summary: Update an existing assessment
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: assessmentId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 1
//  *     responses:
//  *       200:
//  *         description: Assessment updated successfully
//  */
// router.put('/assessments/:assessmentId', updateAssessment)

// /**
//  * @swagger
//  * /api/tutor/assessments/{assessmentId}:
//  *   delete:
//  *     summary: Delete an assessment
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: assessmentId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 1
//  *     responses:
//  *       200:
//  *         description: Assessment deleted successfully
//  */
// router.delete('/assessments/:assessmentId', deleteAssessment)

// /**
//  * @swagger
//  * /api/tutor/assessments/{assessmentId}/submissions:
//  *   get:
//  *     summary: Get student submissions for a specific assessment
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: assessmentId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 1
//  *     responses:
//  *       200:
//  *         description: Submissions retrieved successfully
//  */
// router.get('/assessments/:assessmentId/submissions', getSubmissionsByAssessment)

// /**
//  * @swagger
//  * /api/tutor/submissions/{submissionId}/grade:
//  *   put:
//  *     summary: Grade a student's submission and provide feedback
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: submissionId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 42
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
//  *                 example: Great job on the repository architecture! Clean code.
//  *     responses:
//  *       200:
//  *         description: Submission graded successfully
//  */
// router.put('/submissions/:submissionId/grade', gradeSubmission)

// /**
//  * @swagger
//  * /api/tutor/submissions/{submissionId}/feedback:
//  *   put:
//  *     summary: Submit iterative review or feedback on a student code submission
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: submissionId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 42
//  *     responses:
//  *       200:
//  *         description: Review feedback submitted successfully
//  */
// router.put('/submissions/:submissionId/feedback', submitIterativeFeedback)

// /**
//  * @swagger
//  * /api/tutor/attendance:
//  *   post:
//  *     summary: Log daily attendance for students in a course session
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
//  *                 type: string
//  *                 example: fullstack-dev
//  *               attendance_records:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     student_id:
//  *                       type: integer
//  *                       example: 5
//  *                     status:
//  *                       type: string
//  *                       example: present
//  *     responses:
//  *       200:
//  *         description: Attendance logged successfully
//  */
// router.post('/attendance', logAttendance)

// /**
//  * @swagger
//  * /api/tutor/modules:
//  *   post:
//  *     summary: Upload a weekly course lecture module or resource file
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       201:
//  *         description: Module uploaded successfully
//  */
// router.post('/modules', uploadCourseModule)

// /**
//  * @swagger
//  * /api/tutor/modules/{courseId}:
//  *   get:
//  *     summary: Get all modules for a course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: fullstack-dev
//  *     responses:
//  *       200:
//  *         description: Course modules fetched successfully
//  */
// router.get('/modules/:courseId', getCourseModules)

// /**
//  * @swagger
//  * /api/tutor/sessions:
//  *   post:
//  *     summary: Schedule a live workshop session and conference link
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       201:
//  *         description: Live session scheduled successfully
//  */
// router.post('/sessions', scheduleLiveSession)

// /**
//  * @swagger
//  * /api/tutor/sessions/{courseId}:
//  *   get:
//  *     summary: Get scheduled live sessions for a course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: fullstack-dev
//  *     responses:
//  *       200:
//  *         description: Live sessions retrieved successfully
//  */
// router.get('/sessions/:courseId', getLiveSessions)

// /**
//  * @swagger
//  * /api/tutor/roster/{courseId}:
//  *   get:
//  *     summary: Get list of registered students (roster) for a specific course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: fullstack-dev
//  *     responses:
//  *       200:
//  *         description: Course roster retrieved successfully
//  */
// router.get('/roster/:courseId', getCourseRoster)

// /**
//  * @swagger
//  * /api/tutor/announcements:
//  *   post:
//  *     summary: Create an announcement targeted to a specific course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       201:
//  *         description: Announcement created successfully
//  */
// router.post('/announcements', createCourseAnnouncement)

// /**
//  * @swagger
//  * /api/tutor/analytics/{courseId}:
//  *   get:
//  *     summary: Get summary performance statistics and at-risk student lists for a course
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: courseId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: fullstack-dev
//  *     responses:
//  *       200:
//  *         description: Analytics generated successfully
//  */
// router.get('/analytics/:courseId', getClassAnalytics)

// /**
//  * @swagger
//  * /api/tutor/students/cohort:
//  *   get:
//  *     summary: Get assigned cohort students list (Normal & Scholarship)
//  *     tags: [Tutors]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: cohortId
//  *         schema:
//  *           type: integer
//  *         example: 3
//  *     responses:
//  *       200:
//  *         description: Cohort students retrieved successfully
//  */
// router.get('/students/cohort', getAssignedCohortStudents)

// module.exports = router




// src/routes/tutorRoutes.js
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
  getTutorCourses,
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
// All routes declared below this middleware require a valid JWT Bearer token
router.use(protect)

/**
 * @swagger
 * /api/tutor/courses:
 *   get:
 *     summary: Get courses assigned to the logged-in tutor
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutor courses retrieved successfully
 */
router.get('/courses', getTutorCourses)

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
 *         description: Announcement created successfully
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
 *     summary: Get assigned cohort students list (Normal & Scholarship)
 *     tags: [Tutors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         schema:
 *           type: string
 *         example: "3"
 *     responses:
 *       200:
 *         description: Cohort students retrieved successfully
 */
router.get('/students/cohort', getAssignedCohortStudents)

module.exports = router