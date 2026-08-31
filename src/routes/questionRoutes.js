// // src/routes/questionRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect } = require('../middleware/authMiddleware')
// const { createQuestion } = require('../controllers/questionController')

// /**
//  * @swagger
//  * tags:
//  *   name: Questions
//  *   description: API endpoints for managing individual questions within banks
//  */

// // All routes are protected and require a valid Bearer token
// router.use(protect)

// /**
//  * @swagger
//  * /api/questions:
//  *   post:
//  *     summary: Create a new question
//  *     tags: [Questions]
//  *     security:
//  *       - BearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - question_bank_id
//  *               - subject_id
//  *               - question_text
//  *             properties:
//  *               question_bank_id:
//  *                 type: integer
//  *                 example: 1
//  *               subject_id:
//  *                 type: string
//  *                 example: sub_algebra_01
//  *               course_id:
//  *                 type: string
//  *                 example: CS101
//  *               question_text:
//  *                 type: string
//  *                 example: What is the derivative of x^2?
//  *               question_type:
//  *                 type: string
//  *                 example: MCQ
//  *               image_url:
//  *                 type: string
//  *                 example: https://example.com/images/question-1.png
//  *               marks:
//  *                 type: integer
//  *                 example: 2
//  *               options:
//  *                 type: array
//  *                 items:
//  *                   type: object
//  *                   properties:
//  *                     text:
//  *                       type: string
//  *                       example: 2x
//  *                     is_correct:
//  *                       type: boolean
//  *                       example: true
//  *                     explanation:
//  *                       type: string
//  *                       example: Using the power rule, d/dx(x^2) = 2x.
//  *     responses:
//  *       201:
//  *         description: Question successfully created
//  *       400:
//  *         description: Bad request or validation failure
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: Question bank not found
//  */
// router.post('/', createQuestion)

// module.exports = router


// src/routes/questionRoutes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  updateQuestionStatus,
} = require('../controllers/questionController')

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: API endpoints for managing individual questions within banks
 */

// All routes are protected and require a valid Bearer token
router.use(protect)

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions with optional filters
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
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
 *         description: Filter questions by subject ID
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: string
 *         description: Filter questions by course ID
 *     responses:
 *       200:
 *         description: List of questions successfully retrieved
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
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
 *                 example: sub_algebra_01
 *               courseId:
 *                 type: string
 *                 example: CS101
 *               questionText:
 *                 type: string
 *                 example: What is the derivative of x^2?
 *               questionType:
 *                 type: string
 *                 example: MCQ
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/images/question-1.png
 *               marks:
 *                 type: integer
 *                 example: 2
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       example: 2x
 *                     isCorrect:
 *                       type: boolean
 *                       example: true
 *                     explanation:
 *                       type: string
 *                       example: Using the power rule, d/dx(x^2) = 2x.
 *     responses:
 *       201:
 *         description: Question successfully created
 *       400:
 *         description: Bad request or validation failure
 *       401:
 *         description: Unauthorized
 */
router.route('/').get(getQuestions).post(createQuestion)

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a single question by ID
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
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
 *     summary: Update a question and its options
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
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
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 *   delete:
 *     summary: Delete a question
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
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
 *       404:
 *         description: Question not found
 */
router
  .route('/:id')
  .get(getQuestionById)
  .put(updateQuestion)
  .delete(deleteQuestion)

/**
 * @swagger
 * /api/questions/{id}/status:
 *   patch:
 *     summary: Update question status (e.g., ACTIVE, ARCHIVED)
 *     tags: [Questions]
 *     security:
 *       - BearerAuth: []
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
 *       404:
 *         description: Question not found
 */
router.patch('/:id/status', updateQuestionStatus)

module.exports = router