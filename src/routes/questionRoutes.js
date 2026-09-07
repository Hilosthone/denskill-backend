// // // src/routes/questionRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect, authorize } = require('../middleware/authMiddleware')
// const {
//   createQuestion,
//   getQuestions,
//   getQuestionById,
//   updateQuestion,
//   deleteQuestion,
//   updateQuestionStatus,
// } = require('../controllers/questionController')

// /**
//  * @swagger
//  * tags:
//  *   name: Questions
//  *   description: API endpoints for managing individual programming and computer science assessment questions within banks
//  */

// // All routes are protected and require a valid Bearer token
// router.use(protect)

// /**
//  * @swagger
//  * /api/questions:
//  *   get:
//  *     summary: Get all programming assessment questions with optional filters and pagination
//  *     tags: [Questions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: question_bank_id
//  *         schema:
//  *           type: integer
//  *         description: Filter questions by question bank ID
//  *       - in: query
//  *         name: subject_id
//  *         schema:
//  *           type: string
//  *         description: Filter questions by programming track/subject ID (e.g., sub_react_01, sub_nodejs_01)
//  *       - in: query
//  *         name: course_id
//  *         schema:
//  *           type: string
//  *         description: Filter questions by course ID (e.g., FULLSTACK_MERN, MOBILE_FLUTTER)
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Page number for pagination
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 20
//  *         description: Number of records per page
//  *     responses:
//  *       200:
//  *         description: List of programming questions successfully retrieved with pagination metadata
//  *       401:
//  *         description: Unauthorized
//  *   post:
//  *     summary: Create a new programming assessment question (Restricted to Admins and Tutors)
//  *     tags: [Questions]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - questionBankId
//  *               - subjectId
//  *               - questionText
//  *               - options
//  *             properties:
//  *               questionBankId:
//  *                 type: integer
//  *                 example: 1
//  *               subjectId:
//  *                 type: string
//  *                 example: sub_react_hooks_01
//  *               courseId:
//  *                 type: string
//  *                 example: MERN_STACK_PRO
//  *               questionText:
//  *                 type: string
//  *                 example: What is the correct way to memoize a computational expensive function in React using the useCallback hook?
//  *               questionType:
//  *                 type: string
//  *                 example: MCQ
//  *               imageUrl:
//  *                 type: string
//  *                 example: https://enskill.com/assets/code-snippet-1.png
//  *               marks:
//  *                 type: integer
//  *                 example: 5
//  *               options:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     text:
//  *                       type: string
//  *                       example: useMemo(() => compute(x), [x])
//  *                     isCorrect:
//  *                       type: boolean
//  *                       example: true
//  *                     explanation:
//  *                       type: string
//  *                       example: useMemo caches the result of a function calculation between renders.
//  *     responses:
//  *       201:
//  *         description: Programming question successfully created
//  *       400:
//  *         description: Bad request or validation failure (e.g., missing correct option)
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden - Insufficient permissions (Requires Admin or Tutor role)
//  */
// router
//   .route('/')
//   .get(getQuestions)
//   .post(authorize('ADMIN', 'TUTOR'), createQuestion)

// /**
//  * @swagger
//  * /api/questions/{id}:
//  *   get:
//  *     summary: Get a single programming question by ID (Accessible by Admin, Tutors, and Students)
//  *     tags: [Questions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Question ID
//  *     responses:
//  *       200:
//  *         description: Programming question details retrieved successfully
//  *       404:
//  *         description: Question not found
//  *   put:
//  *     summary: Update a programming question and its options (Restricted to Admins and Tutors)
//  *     tags: [Questions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Question ID
//  *     requestBody:
//  *       required: false
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               subjectId:
//  *                 type: string
//  *                 example: sub_async_js_02
//  *               courseId:
//  *                 type: string
//  *                 example: MERN_STACK_PRO
//  *               questionText:
//  *                 type: string
//  *                 example: What will be the output of executing an async function that encounters an unhandled rejected Promise?
//  *               questionType:
//  *                 type: string
//  *                 example: MCQ
//  *               imageUrl:
//  *                 type: string
//  *               marks:
//  *                 type: integer
//  *                 example: 3
//  *               options:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *     responses:
//  *       200:
//  *         description: Question updated successfully
//  *       400:
//  *         description: Validation error (e.g. invalid options count)
//  *       403:
//  *         description: Forbidden - Insufficient permissions
//  *       404:
//  *         description: Question not found
//  *   delete:
//  *     summary: Delete a programming question (Restricted to Admin and Creator Tutor)
//  *     tags: [Questions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Question ID
//  *     responses:
//  *       200:
//  *         description: Question deleted successfully
//  *       403:
//  *         description: Forbidden - Insufficient permissions
//  *       404:
//  *         description: Question not found
//  */
// router
//   .route('/:id')
//   .get(getQuestionById)
//   .put(authorize('ADMIN', 'TUTOR'), updateQuestion)
//   .delete(authorize('ADMIN', 'TUTOR'), deleteQuestion)

// /**
//  * @swagger
//  * /api/questions/{id}/status:
//  *   patch:
//  *     summary: Update question status (e.g., ACTIVE, ARCHIVED) (Restricted to Admins and Tutors)
//  *     tags: [Questions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Question ID
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
//  *                 example: ACTIVE
//  *     responses:
//  *       200:
//  *         description: Question status updated successfully
//  *       400:
//  *         description: Status is required
//  *       403:
//  *         description: Forbidden - Insufficient permissions
//  *       404:
//  *         description: Question not found
//  */
// router.patch('/:id/status', authorize('ADMIN', 'TUTOR'), updateQuestionStatus)

// module.exports = router



//src/routes/questionRoutes.js
/**
 * @file questionRoutes.js
 * @description Express router for Question Banks, assessment questions, and student submission history,
 * equipped with JWT protection, role-based authorization, and Swagger documentation.
 */

const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  updateQuestionStatus,
  getMyAssessmentHistory,
  getSubmissionDetailReview,
  getAllStudentsAssessmentHistory,
} = require('../controllers/questionController')

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: API endpoints for managing individual assessment questions and student performance history
 */

// All routes are protected and require a valid Bearer token
router.use(protect)

/**
 * @swagger
 * /api/questions/history/me:
 *   get:
 *     summary: Get authenticated student's quiz and assessment attempt history
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Student assessment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/history/me', authorize('STUDENT', 'ADMIN', 'TUTOR'), getMyAssessmentHistory)

/**
 * @swagger
 * /api/questions/admin/history/all:
 *   get:
 *     summary: Get all students' assessment performances and cohort analytics (Restricted to Admins and Tutors)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: assessment_id
 *         schema:
 *           type: integer
 *         description: Filter by assessment ID
 *       - in: query
 *         name: student_id
 *         schema:
 *           type: integer
 *         description: Filter by specific student user ID
 *     responses:
 *       200:
 *         description: Cohort performance metrics retrieved successfully
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get('/admin/history/all', authorize('ADMIN', 'TUTOR'), getAllStudentsAssessmentHistory)

/**
 * @swagger
 * /api/questions/history/submissions/{submissionId}:
 *   get:
 *     summary: Get detailed review for a specific assessment submission attempt
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assessment submission record ID
 *     responses:
 *       200:
 *         description: Submission detail review retrieved successfully
 *       403:
 *         description: Access denied to this submission record
 *       404:
 *         description: Submission not found
 */
router.get('/history/submissions/:submissionId', getSubmissionDetailReview)

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all programming assessment questions with optional filters and pagination
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: question_bank_id
 *         schema:
 *           type: integer
 *         description: Filter questions by question bank ID
 *       - in: query
 *         name: subject_id
 *         schema:
 *           type: string
 *         description: Filter questions by programming track/subject ID
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *         description: Filter questions by course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: List of programming questions successfully retrieved with pagination metadata
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new programming assessment question (Restricted to Admins and Tutors)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionBankId
 *               - subjectId
 *               - questionText
 *               - options
 *             properties:
 *               questionBankId:
 *                 type: integer
 *                 example: 1
 *               subjectId:
 *                 type: string
 *                 example: sub_react_hooks_01
 *               courseId:
 *                 type: string
 *                 example: MERN_STACK_PRO
 *               questionText:
 *                 type: string
 *                 example: What is the correct way to memoize a computational expensive function in React?
 *               questionType:
 *                 type: string
 *                 example: MCQ
 *               imageUrl:
 *                 type: string
 *                 example: https://enskill.com/assets/code-snippet-1.png
 *               marks:
 *                 type: integer
 *                 example: 5
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       example: useMemo(() => compute(x), [x])
 *                     isCorrect:
 *                       type: boolean
 *                       example: true
 *                     explanation:
 *                       type: string
 *                       example: useMemo caches the result between renders.
 *     responses:
 *       201:
 *         description: Programming question successfully created
 *       400:
 *         description: Bad request or validation failure
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router
  .route('/')
  .get(getQuestions)
  .post(authorize('ADMIN', 'TUTOR'), createQuestion)

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a single programming question by ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question details retrieved successfully
 *       404:
 *         description: Question not found
 *   put:
 *     summary: Update a programming question and its options (Restricted to Admins and Tutors)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               questionText:
 *                 type: string
 *               questionType:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               marks:
 *                 type: integer
 *               options:
 *                 type: array
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Question not found
 *   delete:
 *     summary: Delete a programming question (Restricted to Admin and Tutor)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Question not found
 */
router
  .route('/:id')
  .get(getQuestionById)
  .put(authorize('ADMIN', 'TUTOR'), updateQuestion)
  .delete(authorize('ADMIN', 'TUTOR'), deleteQuestion)

/**
 * @swagger
 * /api/questions/{id}/status:
 *   patch:
 *     summary: Update question status (Restricted to Admins and Tutors)
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
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
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Question status updated successfully
 *       400:
 *         description: Status is required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Question not found
 */
router.patch('/:id/status', authorize('ADMIN', 'TUTOR'), updateQuestionStatus)

module.exports = router