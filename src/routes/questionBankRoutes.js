// // src/routes/questionBankRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect } = require('../middleware/authMiddleware')
// const {
//   getQuestionBanks,
//   createQuestionBank,
//   submitQuestionBank,
// } = require('../controllers/questionBankController')

// /**
//  * @swagger
//  * tags:
//  *   name: Question Banks
//  *   description: API endpoints for managing question banks
//  */

// // All routes are protected and require a valid Bearer token
// router.use(protect)

// /**
//  * @swagger
//  * /api/question-banks:
//  *   get:
//  *     summary: Retrieve a list of question banks
//  *     tags: [Question Banks]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: course_id
//  *         schema:
//  *           type: string
//  *         description: Filter question banks by course ID
//  *       - in: query
//  *         name: status
//  *         schema:
//  *           type: string
//  *         description: Filter question banks by status (e.g. DRAFT, PENDING_REVIEW, APPROVED)
//  *     responses:
//  *       200:
//  *         description: Successfully retrieved question banks
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: string
//  *                   example: success
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *       401:
//  *         description: Unauthorized token missing or invalid
//  *       500:
//  *         description: Internal server error
//  *   post:
//  *     summary: Create a new question bank
//  *     tags: [Question Banks]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *abor:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - title
//  *             properties:
//  *               title:
//  *                 type: string
//  *                 example: Midterm Assessment Bank
//  *               description:
//  *                 type: string
//  *                 example: Question bank covering chapters 1 to 5
//  *               course_id:
//  *                 type: string
//  *                 example: CS101
//  *               subjects:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                 example: ["Algebra", "Calculus"]
//  *     responses:
//  *       201:
//  *         description: Question bank successfully created
//  *       400:
//  *         description: Bad request or validation failure
//  *       401:
//  *         description: Unauthorized
//  */
// router.route('/').get(getQuestionBanks).post(createQuestionBank)

// /**
//  * @swagger
//  * /api/question-banks/{id}/submit:
//  *   patch:
//  *     summary: Submit a question bank for review
//  *     tags: [Question Banks]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID of the question bank to submit
//  *     responses:
//  *       200:
//  *         description: Question bank successfully submitted for review
//  *       400:
//  *         description: Invalid input or already submitted
//  *       404:
//  *         description: Question bank not found
//  *       401:
//  *         description: Unauthorized
//  */
// router.patch('/:id/submit', submitQuestionBank)

// module.exports = router



// src/routes/questionBankRoutes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
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
 *   description: API endpoints for managing question banks
 */

// All routes are protected and require a valid Bearer token
router.use(protect)

/**
 * @swagger
 * /api/question-banks:
 *   get:
 *     summary: Retrieve a list of question banks
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
 *         description: Filter question banks by course ID
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
 *     summary: Create a new question bank
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
 *                 example: Midterm Assessment Bank
 *               description:
 *                 type: string
 *                 example: Question bank covering chapters 1 to 5
 *               courseId:
 *                 type: string
 *                 example: CS101
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Algebra", "Calculus"]
 *     responses:
 *       201:
 *         description: Question bank successfully created
 *       400:
 *         description: Bad request or missing title
 *       401:
 *         description: Unauthorized
 */
router.route('/').get(getQuestionBanks).post(createQuestionBank)

/**
 * @swagger
 * /api/question-banks/validate-import:
 *   post:
 *     summary: Validate question import payload
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
 *     responses:
 *       200:
 *         description: Import validation results returned
 *       400:
 *         description: Invalid payload format
 *       401:
 *         description: Unauthorized
 */
router.post('/validate-import', validateImport)

/**
 * @swagger
 * /api/question-banks/{id}:
 *   get:
 *     summary: Get a single question bank by ID with its questions and options
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
 *     summary: Update a question bank
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
 *               description:
 *                 type: string
 *               courseId:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Question bank updated successfully
 *       404:
 *         description: Question bank not found
 *   delete:
 *     summary: Delete a question bank
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
 *       404:
 *         description: Question bank not found
 */
router
  .route('/:id')
  .get(getQuestionBankById)
  .put(updateQuestionBank)
  .delete(deleteQuestionBank)

/**
 * @swagger
 * /api/question-banks/{id}/submit:
 *   patch:
 *     summary: Submit a question bank for review
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
 *       404:
 *         description: Question bank not found or unauthorized
 */
router.patch('/:id/submit', submitQuestionBank)

/**
 * @swagger
 * /api/question-banks/{id}/review:
 *   patch:
 *     summary: Review (Approve or Reject) a question bank
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
 *                 example: Looks good. Approved for deployment.
 *     responses:
 *       200:
 *         description: Question bank review status updated successfully
 *       400:
 *         description: Invalid status provided
 *       404:
 *         description: Question bank not found
 */
router.patch('/:id/review', reviewQuestionBank)

/**
 * @swagger
 * /api/question-banks/{id}/import:
 *   post:
 *     summary: Bulk import questions into a question bank
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
 *       404:
 *         description: Question bank not found
 *       500:
 *         description: Server error during import
 */
router.post('/:id/import', importQuestions)

module.exports = router