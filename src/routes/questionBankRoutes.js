// src/routes/questionBankRoutes.js
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

// All routes are protected and require a valid Bearer token
router.use(protect)

/**
 * @swagger
 * /api/question-banks:
 *   get:
 *     summary: Retrieve a list of programming question banks (Accessible by Admin, Tutors, and Students)
 *     tags: [Question Banks]
 *     security:
 *       - BearerAuth: []
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
 *         description: Filter question banks by programming course ID (e.g., FULLSTACK_JS, MOBILE_FLUTTER)
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
 *       - BearerAuth: []
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
 *     responses:
 *       201:
 *         description: Question bank successfully created
 *       400:
 *         description: Bad request or missing title
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions (Requires Admin or Tutor role)
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
 *       - BearerAuth: []
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
 * @swagger
 * /api/question-banks/{id}:
 *   get:
 *     summary: Get a single programming question bank by ID with its questions and code options (Accessible by Admin, Tutors, and Students)
 *     tags: [Question Banks]
 *     security:
 *       - BearerAuth: []
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
 *       - BearerAuth: []
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
 *                 example: Advanced Flutter State Management Question Bank
 *               description:
 *                 type: string
 *                 example: Updated assessment covering Provider, Bloc, and Riverpod patterns
 *               courseId:
 *                 type: string
 *                 example: MOBILE_FLUTTER_PRO
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Bloc Architecture", "Riverpod Providers"]
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
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question bank ID
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

/**
 * @swagger
 * /api/question-banks/{id}/submit:
 *   patch:
 *     summary: Submit a programming question bank for review (Restricted to Tutors)
 *     tags: [Question Banks]
 *     security:
 *       - BearerAuth: []
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
 *       - BearerAuth: []
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

/**
 * @swagger
 * /api/question-banks/{id}/import:
 *   post:
 *     summary: Bulk import programming questions into a question bank (Restricted to Admins and Tutors)
 *     tags: [Question Banks]
 *     security:
 *       - BearerAuth: []
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
 *     responses:
 *       201:
 *         description: Questions successfully imported
 *       400:
 *         description: No questions provided
 *       403:
 *         description: Forbidden - Requires Admin or Tutor role
 *       404:
 *         description: Question bank not found
 *       500:
 *         description: Server error during import
 */
router.post('/:id/import', authorize('ADMIN', 'TUTOR'), importQuestions)

module.exports = router
