//src/routes/questionBankRoutes.js
/**
 * @file questionBankRoutes.js
 * @description Express router managing endpoints for question banks, supporting CRUD operations,
 * tutor submissions, admin reviews, and bulk question imports with corrected route ordering.
 */

const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/authMiddleware')
const {
  getQuestionBanks,
  createQuestionBank,
  getQuestionBankById,
  updateQuestionBank,
  deleteQuestionBank,
  submitQuestionBank,
  reviewQuestionBank,
  validateImport,
  importQuestions,
} = require('../controllers/questionBankController')

/**
 * @swagger
 * tags:
 *   name: Question Banks
 *   description: API endpoints for managing coding test and programming assessment question banks
 */

// All routes are protected and require a valid Bearer token authorization header
router.use(protect)

/**
 * @swagger
 * /api/question-banks:
 *   get:
 *     summary: Retrieve a list of programming question banks
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter question banks by status (e.g. DRAFT, PENDING_REVIEW, APPROVED)
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter question banks by programming course ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for question bank title
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
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved question banks
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new programming question bank (Restricted to Admins and Tutors)
 *     tags: [Question Banks]
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: Full-Stack JavaScript Midterm Assessment Bank
 *               description:
 *                 type: string
 *                 example: Comprehensive coding assessment bank covering Node.js, Express, and React hooks
 *               courseId:
 *                 type: string
 *                 example: MERN_STACK_PRO
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Async/Await", "REST APIs", "React State Management"]
 *               durationMinutes:
 *                 type: integer
 *                 example: 45
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-12-31T23:59:59Z"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-09-01T08:00:00Z"
 *               maxAttempts:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Question bank successfully created
 *       400:
 *         description: Bad request or missing title
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router
  .route('/')
  .get(getQuestionBanks)
  .post(authorize('ADMIN', 'TUTOR'), createQuestionBank)

/**
 * @swagger
 * /api/question-banks/validate-import:
 *   post:
 *     summary: Validate bulk coding question import payload (Restricted to Admins and Tutors)
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: [{"questionText": "What does CORS stand for?", "options": [{"text": "Cross-Origin Resource Sharing", "isCorrect": true}]}]
 *     responses:
 *       200:
 *         description: Import validation results returned
 *       400:
 *         description: Invalid payload format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires Admin or Tutor role
 */
router.post('/validate-import', authorize('ADMIN', 'TUTOR'), validateImport)

/**
 * CRITICAL FIX: Specific action sub-routes on question banks (like /submit, /review, and /import)
 * MUST be declared BEFORE the generic dynamic parameter route `/:id`. 
 * 
 * Why this is needed:
 * Express matches routes sequentially from top to bottom. If `/:id` is placed above `/:id/submit`, 
 * Express will match the literal string "submit" as the value of the `:id` parameter (e.g. id = "submit"), 
 * causing routing bugs, unexpected 404s, or execution of the wrong controller handler.
 */

/**
 * @swagger
 * /api/question-banks/{id}/submit:
 *   patch:
 *     summary: Submit a programming question bank for review (Restricted to Tutors)
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question bank to submit
 *     responses:
 *       200:
 *         description: Question bank successfully submitted for review
 *       400:
 *         description: Validation failed (e.g. missing questions, insufficient options)
 *       403:
 *         description: Forbidden - Requires Tutor role
 *       404:
 *         description: Question bank not found or unauthorized
 */
router.patch('/:id/submit', authorize('TUTOR'), submitQuestionBank)

/**
 * @swagger
 * /api/question-banks/{id}/review:
 *   patch:
 *     summary: Review (Approve or Reject) a programming question bank (Restricted to Admins)
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question bank to review
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
 *                 example: APPROVED
 *               reviewComment:
 *                 type: string
 *                 example: Code snippets and options verified. Approved for deployment.
 *     responses:
 *       200:
 *         description: Question bank review status updated successfully
 *       400:
 *         description: Invalid status provided
 *       403:
 *         description: Forbidden - Requires Administrator role
 *       404:
 *         description: Question bank not found
 */
router.patch('/:id/review', authorize('ADMIN'), reviewQuestionBank)

// /**
//  * @swagger
//  * /api/question-banks/{id}/import:
//  *   post:
//  *     summary: Bulk import programming questions into a question bank (Restricted to Admins and Tutors)
//  *     tags: [Question Banks]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: Question bank ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - questions
//  *             properties:
//  *               questions:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *     responses:
//  *       201:
//  *         description: Questions successfully imported
//  *       400:
//  *         description: No questions provided
//  *       403:
//  *         description: Forbidden - Requires Admin or Tutor role
//  *       404:
//  *         description: Question bank not found
//  *       500:
//  *         description: Server error during import
//  */
// router.post('/:id/import', authorize('ADMIN', 'TUTOR'), importQuestions)


/**
 * @swagger
 * /api/question-banks/{id}/import:
 *   post:
 *     summary: Bulk sync/overwrite programming questions in a question bank (Restricted to Admins and Tutors)
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question bank ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionText:
 *                       type: string
 *                       example: What does CORS stand for?
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *     responses:
 *       201:
 *         description: Questions successfully synced and updated
 *       400:
 *         description: Invalid payload format or option count out of bounds (2-5 required)
 *       403:
 *         description: Forbidden - Requires Admin or Tutor role
 *       404:
 *         description: Question bank not found
 *       500:
 *         description: Server error during question sync
 */
router.post('/:id/import', authorize('ADMIN', 'TUTOR'), importQuestions)

/**
 * @swagger
 * /api/question-banks/{id}:
 *   get:
 *     summary: Get a single programming question bank by ID with its questions and code options
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question bank ID
 *     responses:
 *       200:
 *         description: Question bank retrieved successfully
 *       404:
 *         description: Question bank not found
 *   put:
 *     summary: Update a programming question bank (Restricted to Admins and Tutors)
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question bank ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               courseId:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               durationMinutes:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               maxAttempts:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Question bank updated successfully
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Question bank not found
 *   delete:
 *     summary: Delete a programming question bank (Restricted to Admins and Tutors)
 *     tags: [Question Banks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the question bank to delete
 *     responses:
 *       200:
 *         description: Question bank deleted successfully
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Question bank not found
 */
router
  .route('/:id')
  .get(getQuestionBankById)
  .put(authorize('ADMIN', 'TUTOR'), updateQuestionBank)
  .delete(authorize('ADMIN', 'TUTOR'), deleteQuestionBank)

module.exports = router