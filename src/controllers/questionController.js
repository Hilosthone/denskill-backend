// //src/controllers/questionController.js
// /**
//  * @file questionController.js
//  * @description Controller handling CRUD operations for Question Banks and Questions,
//  * including options management, pagination, filtering, transaction safety, and 
//  * robust dynamic updates that correctly handle explicit null values.
//  */

// const { pool } = require('../config/db')

// /**
//  * @desc    Create a question and its associated options
//  * @route   POST /api/questions
//  * @access  Admin or Tutor
//  * 
//  * TEACHING NOTE:
//  * We use a PostgreSQL client from the pool with explicit transaction control (BEGIN, COMMIT, ROLLBACK).
//  * This ensures atomicity: if inserting the question succeeds, but inserting options fails, 
//  * the entire operation rolls back so we don't leave orphaned questions without choices.
//  */
// const createQuestion = async (req, res) => {
//   const client = await pool.connect()
//   try {
//     // 1. Start a database transaction
//     await client.query('BEGIN')

//     const {
//       questionBankId,
//       subjectId,
//       courseId,
//       questionText,
//       questionType = 'MCQ',
//       imageUrl,
//       marks = 1,
//       options,
//     } = req.body

//     // 2. Validate essential fields and options count (Minimum 2 choices for MCQs)
//     if (
//       !questionBankId ||
//       !subjectId ||
//       !questionText ||
//       !options ||
//       !Array.isArray(options) ||
//       options.length < 2
//     ) {
//       await client.query('ROLLBACK')
//       return res.status(400).json({
//         success: false,
//         message:
//           'Missing required fields or insufficient options (minimum 2 required).',
//       })
//     }

//     // 3. Ensure at least one option is explicitly marked as correct
//     const hasCorrectOption = options.some(
//       (opt) => opt.isCorrect === true || opt.is_correct === true,
//     )
//     if (!hasCorrectOption) {
//       await client.query('ROLLBACK')
//       return res.status(400).json({
//         success: false,
//         message: 'At least one option must be marked as the correct answer.',
//       })
//     }

//     // 4. Verify that the parent question bank actually exists
//     const bankCheck = await client.query(
//       'SELECT * FROM question_banks WHERE id = $1',
//       [questionBankId],
//     )
//     if (bankCheck.rows.length === 0) {
//       await client.query('ROLLBACK')
//       return res
//         .status(404)
//         .json({ success: false, message: 'Question bank not found.' })
//     }

//     // 5. Insert the parent Question record
//     const questionQuery = `
//       INSERT INTO questions (question_bank_id, subject_id, course_id, question_text, question_type, image_url, marks, created_by, created_by_role)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//       RETURNING *;
//     `
//     const questionValues = [
//       questionBankId,
//       subjectId,
//       courseId || bankCheck.rows[0].course_id || null,
//       questionText,
//       questionType,
//       imageUrl || null,
//       marks,
//       req.user.id,
//       req.user.role || 'TUTOR',
//     ]

//     const questionResult = await client.query(questionQuery, questionValues)
//     const newQuestion = questionResult.rows[0]

//     // 6. Iterate through choices/options and insert them linked to the new question ID
//     const insertedOptions = []
//     for (const opt of options) {
//       const optionQuery = `
//         INSERT INTO question_options (question_id, text, is_correct, explanation)
//         VALUES ($1, $2, $3, $4)
//         RETURNING *;
//       `
//       const optionValues = [
//         newQuestion.id,
//         opt.text,
//         opt.isCorrect || opt.is_correct || false,
//         opt.explanation || null,
//       ]
//       const optResult = await client.query(optionQuery, optionValues)
//       insertedOptions.push(optResult.rows[0])
//     }

//     // 7. Commit changes permanently if all insertions pass successfully
//     await client.query('COMMIT')

//     res.status(201).json({
//       success: true,
//       message: 'Question created successfully',
//       data: {
//         ...newQuestion,
//         options: insertedOptions,
//       },
//     })
//   } catch (error) {
//     // Revert all changes made during this session if any server/database error happens
//     await client.query('ROLLBACK')
//     console.error('Error creating question:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error creating question' })
//   } finally {
//     // Release the client back to the connection pool
//     client.release()
//   }
// }

// /**
//  * @desc    Get all questions with optional filters and pagination
//  * @route   GET /api/questions
//  * @access  Admin or Tutor
//  * 
//  * TEACHING NOTE:
//  * Fixed a previous fragility bug involving parameter index slicing. 
//  * We now cleanly isolate filter parameters from limit/offset pagination parameters 
//  * to ensure that total count queries and main data queries execute with correct SQL parameter indexes ($1, $2, etc.).
//  */
// const getQuestions = async (req, res) => {
//   try {
//     const {
//       question_bank_id,
//       subject_id,
//       course_id,
//       page = 1,
//       limit = 20,
//     } = req.query

//     const parsedPage = parseInt(page, 10)
//     const parsedLimit = parseInt(limit, 10)
//     const offset = (parsedPage - 1) * parsedLimit

//     const conditions = []
//     const filterValues = []

//     // Build dynamic SQL query filters safely
//     if (question_bank_id) {
//       filterValues.push(question_bank_id)
//       conditions.push(`q.question_bank_id = $${filterValues.length}`)
//     }
//     if (subject_id) {
//       filterValues.push(subject_id)
//       conditions.push(`q.subject_id = $${filterValues.length}`)
//     }
//     if (course_id) {
//       filterValues.push(course_id)
//       conditions.push(`q.course_id = $${filterValues.length}`)
//     }

//     const whereClause = conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ``

//     // Main query aggregates options into a clean JSON array structure using json_agg
//     let query = `
//       SELECT q.*, 
//              COALESCE(
//                json_agg(
//                  json_build_object(
//                    'id', qo.id, 
//                    'text', qo.text, 
//                    'is_correct', qo.is_correct, 
//                    'explanation', qo.explanation
//                  )
//                ) FILTER (WHERE qo.id IS NOT NULL), '[]'
//              ) AS options
//       FROM questions q
//       LEFT JOIN question_options qo ON q.id = qo.question_id
//       ${whereClause}
//       GROUP BY q.id 
//       ORDER BY q.created_at DESC 
//       LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2};
//     `

//     let countQuery = `SELECT COUNT(DISTINCT q.id) FROM questions q ${whereClause};`

//     // Combine filter values with pagination limits for the main data execution
//     const mainQueryValues = [...filterValues, parsedLimit, offset]

//     // Execute data retrieval and total count calculation concurrently for optimum performance
//     const [result, countResult] = await Promise.all([
//       pool.query(query, mainQueryValues),
//       pool.query(countQuery, filterValues), // Count query only needs search filters, not pagination values
//     ])

//     const total = parseInt(countResult.rows[0].count, 10)

//     res.status(200).json({
//       success: true,
//       data: result.rows,
//       pagination: {
//         page: parsedPage,
//         limit: parsedLimit,
//         total,
//         totalPages: Math.ceil(total / parsedLimit),
//       },
//     })
//   } catch (error) {
//     console.error('Error fetching questions:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching questions' })
//   }
// }

// /**
//  * @desc    Get a single question by ID along with options array
//  * @route   GET /api/questions/:id
//  * @access  Admin or Tutor
//  */
// const getQuestionById = async (req, res) => {
//   try {
//     const { id } = req.params

//     const query = `
//       SELECT q.*, 
//              COALESCE(
//                json_agg(
//                  json_build_object(
//                    'id', qo.id, 
//                    'text', qo.text, 
//                    'is_correct', qo.is_correct, 
//                    'explanation', qo.explanation
//                  )
//                ) FILTER (WHERE qo.id IS NOT NULL), '[]'
//              ) AS options
//       FROM questions q
//       LEFT JOIN question_options qo ON q.id = qo.question_id
//       WHERE q.id = $1
//       GROUP BY q.id;
//     `
//     const result = await pool.query(query, [id])

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Question not found' })
//     }

//     res.status(200).json({
//       success: true,
//       data: result.rows[0],
//     })
//   } catch (error) {
//     console.error('Error fetching question:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching question' })
//   }
// }

// /**
//  * @desc    Update a question properties and optionally replace/update its options choices
//  * @route   PUT /api/questions/:id
//  * @access  Admin or Tutor
//  * 
//  * TEACHING NOTE:
//  * Refactored from static COALESCE statements to a dynamic query builder. 
//  * This ensures that if a client explicitly sends `null` to clear a nullable field (like `imageUrl` or `courseId`), 
//  * the database actually updates the field to `null` instead of ignoring it and preserving the old value.
//  */
// const updateQuestion = async (req, res) => {
//   const client = await pool.connect()
//   try {
//     await client.query('BEGIN')
//     const { id } = req.params
//     const {
//       subjectId,
//       courseId,
//       questionText,
//       questionType,
//       imageUrl,
//       marks,
//       options,
//     } = req.body

//     // 1. Verify existence of the targeted question
//     const checkRes = await client.query(
//       'SELECT * FROM questions WHERE id = $1',
//       [id],
//     )
//     if (checkRes.rows.length === 0) {
//       await client.query('ROLLBACK')
//       return res
//         .status(404)
//         .json({ success: false, message: 'Question not found' })
//     }

//     // 2. Validate options if updated array is provided
//     if (options && Array.isArray(options)) {
//       if (options.length < 2) {
//         await client.query('ROLLBACK')
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: 'A question must have at least 2 options.',
//           })
//       }
//       const hasCorrect = options.some(
//         (o) => o.isCorrect === true || o.is_correct === true,
//       )
//       if (!hasCorrect) {
//         await client.query('ROLLBACK')
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: 'At least one updated option must be marked as correct.',
//           })
//       }
//     }

//     // 3. Dynamically build the update query to support explicit nullification of fields
//     const fields = []
//     const updateValues = []
//     let paramIndex = 1

//     if (subjectId !== undefined) {
//       fields.push(`subject_id = $${paramIndex++}`)
//       updateValues.push(subjectId)
//     }
//     if (courseId !== undefined) {
//       fields.push(`course_id = $${paramIndex++}`)
//       updateValues.push(courseId)
//     }
//     if (questionText !== undefined) {
//       fields.push(`question_text = $${paramIndex++}`)
//       updateValues.push(questionText)
//     }
//     if (questionType !== undefined) {
//       fields.push(`question_type = $${paramIndex++}`)
//       updateValues.push(questionType)
//     }
//     if (imageUrl !== undefined) {
//       fields.push(`image_url = $${paramIndex++}`)
//       updateValues.push(imageUrl)
//     }
//     if (marks !== undefined) {
//       fields.push(`marks = $${paramIndex++}`)
//       updateValues.push(marks)
//     }

//     fields.push(`updated_at = CURRENT_TIMESTAMP`)

//     let updatedQuestion = checkRes.rows[0]
//     if (fields.length > 1) {
//       updateValues.push(id)
//       const updateQuery = `
//         UPDATE questions 
//         SET ${fields.join(', ')}
//         WHERE id = $${paramIndex}
//         RETURNING *;
//       `
//       const updatedQRes = await client.query(updateQuery, updateValues)
//       updatedQuestion = updatedQRes.rows[0]
//     }

//     // 4. Handle option modifications: Delete old and insert new set if requested
//     let updatedOptions = []
//     if (options && Array.isArray(options)) {
//       await client.query(
//         'DELETE FROM question_options WHERE question_id = $1',
//         [id],
//       )

//       for (const opt of options) {
//         const optionQuery = `
//           INSERT INTO question_options (question_id, text, is_correct, explanation)
//           VALUES ($1, $2, $3, $4)
//           RETURNING *;
//         `
//         const optionValues = [
//           id,
//           opt.text,
//           opt.isCorrect || opt.is_correct || false,
//           opt.explanation || null,
//         ]
//         const optResult = await client.query(optionQuery, optionValues)
//         updatedOptions.push(optResult.rows[0])
//       }
//     } else {
//       const existingOpts = await client.query(
//         'SELECT * FROM question_options WHERE question_id = $1',
//         [id],
//       )
//       updatedOptions = existingOpts.rows
//     }

//     await client.query('COMMIT')

//     res.status(200).json({
//       success: true,
//       message: 'Question updated successfully',
//       data: {
//         ...updatedQuestion,
//         options: updatedOptions,
//       },
//     })
//   } catch (error) {
//     await client.query('ROLLBACK')
//     console.error('Error updating question:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error updating question' })
//   } finally {
//     client.release()
//   }
// }

// /**
//  * @desc    Delete a question (associated options delete automatically via database cascade constraints)
//  * @route   DELETE /api/questions/:id
//  * @access  Admin or Tutor
//  */
// const deleteQuestion = async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await pool.query(
//       'DELETE FROM questions WHERE id = $1 RETURNING *;',
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Question not found' })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Question deleted successfully',
//     })
//   } catch (error) {
//     console.error('Error deleting question:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error deleting question' })
//   }
// }

// /**
//  * @desc    Update question status (e.g. ACTIVE, ARCHIVED, DRAFT)
//  * @route   PATCH /api/questions/:id/status
//  * @access  Admin or Tutor
//  */
// const updateQuestionStatus = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { status } = req.body

//     if (!status) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Status is required' })
//     }

//     const result = await pool.query(
//       `UPDATE questions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
//       [status, id],
//     )

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Question not found' })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Question status updated successfully',
//       data: result.rows[0],
//     })
//   } catch (error) {
//     console.error('Error updating question status:', error)
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error updating question status',
//       })
//   }
// }

// /**
//  * @desc    Get authenticated student's quiz/assessment history and attempt breakdowns
//  * @route   GET /api/questions/history/me
//  * @access  Student
//  */
// const getMyAssessmentHistory = async (req, res) => {
//   try {
//     const studentId = req.user.id
//     const { page = 1, limit = 20 } = req.query
//     const parsedPage = parseInt(page, 10)
//     const parsedLimit = parseInt(limit, 10)
//     const offset = (parsedPage - 1) * parsedLimit

//     // Query student assessment submissions / quiz attempts history
//     const query = `
//       SELECT s.*, 
//              c.title AS course_title,
//              a.title AS assessment_title
//       FROM assessment_submissions s
//       LEFT JOIN courses c ON s.course_id = c.id
//       LEFT JOIN assessments a ON s.assessment_id = a.id
//       WHERE s.user_id = $1
//       ORDER BY s.submitted_at DESC
//       LIMIT $2 OFFSET $3;
//     `
//     const countQuery = `SELECT COUNT(*) FROM assessment_submissions WHERE user_id = $1;`

//     const [result, countResult] = await Promise.all([
//       pool.query(query, [studentId, parsedLimit, offset]),
//       pool.query(countQuery, [studentId]),
//     ])

//     const total = parseInt(countResult.rows[0].count, 10)

//     res.status(200).json({
//       success: true,
//       data: result.rows,
//       pagination: {
//         page: parsedPage,
//         limit: parsedLimit,
//         total,
//         totalPages: Math.ceil(total / parsedLimit),
//       },
//     })
//   } catch (error) {
//     console.error('Error fetching student assessment history:', error)
//     res.status(500).json({ success: false, message: 'Server error fetching student history' })
//   }
// }

// /**
//  * @desc    Get detailed review for a specific assessment attempt (what was correct, missed, time used)
//  * @route   GET /api/questions/history/submissions/:submissionId
//  * @access  Student (own) or Admin/Tutor (any)
//  */
// const getSubmissionDetailReview = async (req, res) => {
//   try {
//     const { submissionId } = req.params
//     const userId = req.user.id
//     const userRole = (req.user.role || '').toUpperCase()

//     const subResult = await pool.query(
//       `SELECT s.*, u.name AS student_name, u.email AS student_email 
//        FROM assessment_submissions s
//        LEFT JOIN users u ON s.user_id = u.id
//        WHERE s.id = $1;`,
//       [submissionId]
//     )

//     if (subResult.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'Assessment submission not found' })
//     }

//     const submission = subResult.rows[0]

//     // Restrict student from viewing other students' submissions
//     if (userRole === 'STUDENT' && Number(submission.user_id) !== Number(userId)) {
//       return res.status(403).json({ success: false, message: 'Access denied to this submission record' })
//     }

//     res.status(200).json({
//       success: true,
//       data: submission,
//     })
//   } catch (error) {
//     console.error('Error fetching submission review details:', error)
//     res.status(500).json({ success: false, message: 'Server error fetching submission details' })
//   }
// }

// /**
//  * @desc    Get all students' assessment/quiz performances, timing metrics, and analytics for admins & tutors
//  * @route   GET /api/questions/admin/history/all
//  * @access  Admin or Tutor
//  */
// const getAllStudentsAssessmentHistory = async (req, res) => {
//   try {
//     const { course_id, assessment_id, student_id, page = 1, limit = 20 } = req.query
//     const parsedPage = parseInt(page, 10)
//     const parsedLimit = parseInt(limit, 10)
//     const offset = (parsedPage - 1) * parsedLimit

//     const conditions = []
//     const filterValues = []

//     if (course_id) {
//       filterValues.push(course_id)
//       conditions.push(`s.course_id = $${filterValues.length}`)
//     }
//     if (assessment_id) {
//       filterValues.push(assessment_id)
//       conditions.push(`s.assessment_id = $${filterValues.length}`)
//     }
//     if (student_id) {
//       filterValues.push(student_id)
//       conditions.push(`s.user_id = $${filterValues.length}`)
//     }

//     const whereClause = conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ``

//     const query = `
//       SELECT s.*, 
//              u.name AS student_name, 
//              u.email AS student_email,
//              c.title AS course_title,
//              a.title AS assessment_title
//       FROM assessment_submissions s
//       LEFT JOIN users u ON s.user_id = u.id
//       LEFT JOIN courses c ON s.course_id = c.id
//       LEFT JOIN assessments a ON s.assessment_id = a.id
//       ${whereClause}
//       ORDER BY s.submitted_at DESC
//       LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2};
//     `

//     const countQuery = `SELECT COUNT(*) FROM assessment_submissions s ${whereClause};`

//     const mainQueryValues = [...filterValues, parsedLimit, offset]

//     const [result, countResult] = await Promise.all([
//       pool.query(query, mainQueryValues),
//       pool.query(countQuery, filterValues),
//     ])

//     const total = parseInt(countResult.rows[0].count, 10)

//     res.status(200).json({
//       success: true,
//       data: result.rows,
//       pagination: {
//         page: parsedPage,
//         limit: parsedLimit,
//         total,
//         totalPages: Math.ceil(total / parsedLimit),
//       },
//     })
//   } catch (error) {
//     console.error('Error fetching global assessment history:', error)
//     res.status(500).json({ success: false, message: 'Server error fetching cohort performance metrics' })
//   }
// }

// module.exports = {
//   createQuestion,
//   getQuestions,
//   getQuestionById,
//   updateQuestion,
//   deleteQuestion,
//   updateQuestionStatus,
//   getMyAssessmentHistory,
//   getSubmissionDetailReview,
//   getAllStudentsAssessmentHistory,
// }





//src/controllers/questionController.js
/**
 * @file questionController.js
 * @description Controller handling CRUD operations for Question Banks and Questions,
 * including options management, pagination, filtering, transaction safety, and 
 * robust dynamic updates that correctly handle explicit null values.
 */

const { pool } = require('../config/db')

/**
 * @desc    Create a question and its associated options
 * @route   POST /api/questions
 * @access  Admin or Tutor
 * 
 * TEACHING NOTE:
 * We use a PostgreSQL client from the pool with explicit transaction control (BEGIN, COMMIT, ROLLBACK).
 * This ensures atomicity: if inserting the question succeeds, but inserting options fails, 
 * the entire operation rolls back so we don't leave orphaned questions without choices.
 */
const createQuestion = async (req, res) => {
  const client = await pool.connect()
  try {
    // 1. Start a database transaction
    await client.query('BEGIN')

    const {
      questionBankId,
      subjectId,
      courseId,
      questionText,
      questionType = 'MCQ',
      imageUrl,
      marks = 1,
      options,
    } = req.body

    // 2. Validate essential fields and options count (Minimum 2 choices for MCQs)
    if (
      !questionBankId ||
      !subjectId ||
      !questionText ||
      !options ||
      !Array.isArray(options) ||
      options.length < 2
    ) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields or insufficient options (minimum 2 required).',
      })
    }

    // 3. Ensure at least one option is explicitly marked as correct
    const hasCorrectOption = options.some(
      (opt) => opt.isCorrect === true || opt.is_correct === true,
    )
    if (!hasCorrectOption) {
      await client.query('ROLLBACK')
      return res.status(400).json({
        success: false,
        message: 'At least one option must be marked as the correct answer.',
      })
    }

    // 4. Verify that the parent question bank actually exists
    const bankCheck = await client.query(
      'SELECT * FROM question_banks WHERE id = $1',
      [questionBankId],
    )
    if (bankCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      return res
        .status(404)
        .json({ success: false, message: 'Question bank not found.' })
    }

    // 5. Insert the parent Question record
    const questionQuery = `
      INSERT INTO questions (question_bank_id, subject_id, course_id, question_text, question_type, image_url, marks, created_by, created_by_role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `
    const questionValues = [
      questionBankId,
      subjectId,
      courseId || bankCheck.rows[0].course_id || null,
      questionText,
      questionType,
      imageUrl || null,
      marks,
      req.user.id,
      req.user.role || 'TUTOR',
    ]

    const questionResult = await client.query(questionQuery, questionValues)
    const newQuestion = questionResult.rows[0]

    // 6. Iterate through choices/options and insert them linked to the new question ID
    const insertedOptions = []
    for (const opt of options) {
      const optionQuery = `
        INSERT INTO question_options (question_id, text, is_correct, explanation)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `
      const optionValues = [
        newQuestion.id,
        opt.text,
        opt.isCorrect || opt.is_correct || false,
        opt.explanation || null,
      ]
      const optResult = await client.query(optionQuery, optionValues)
      insertedOptions.push(optResult.rows[0])
    }

    // 7. Commit changes permanently if all insertions pass successfully
    await client.query('COMMIT')

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        ...newQuestion,
        options: insertedOptions,
      },
    })
  } catch (error) {
    // Revert all changes made during this session if any server/database error happens
    await client.query('ROLLBACK')
    console.error('Error creating question:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error creating question' })
  } finally {
    // Release the client back to the connection pool
    client.release()
  }
}

/**
 * @desc    Get all questions with optional filters and pagination
 * @route   GET /api/questions
 * @access  Admin or Tutor
 * 
 * TEACHING NOTE:
 * Fixed a previous fragility bug involving parameter index slicing. 
 * We now cleanly isolate filter parameters from limit/offset pagination parameters 
 * to ensure that total count queries and main data queries execute with correct SQL parameter indexes ($1, $2, etc.).
 */
const getQuestions = async (req, res) => {
  try {
    const {
      question_bank_id,
      subject_id,
      course_id,
      page = 1,
      limit = 20,
    } = req.query

    const parsedPage = parseInt(page, 10)
    const parsedLimit = parseInt(limit, 10)
    const offset = (parsedPage - 1) * parsedLimit

    const conditions = []
    const filterValues = []

    // Build dynamic SQL query filters safely
    if (question_bank_id) {
      filterValues.push(question_bank_id)
      conditions.push(`q.question_bank_id = $${filterValues.length}`)
    }
    if (subject_id) {
      filterValues.push(subject_id)
      conditions.push(`q.subject_id = $${filterValues.length}`)
    }
    if (course_id) {
      filterValues.push(course_id)
      conditions.push(`q.course_id = $${filterValues.length}`)
    }

    const whereClause = conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ``

    // Main query aggregates options into a clean JSON array structure using json_agg
    let query = `
      SELECT q.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', qo.id, 
                   'text', qo.text, 
                   'is_correct', qo.is_correct, 
                   'explanation', qo.explanation
                 )
               ) FILTER (WHERE qo.id IS NOT NULL), '[]'
             ) AS options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      ${whereClause}
      GROUP BY q.id 
      ORDER BY q.created_at DESC 
      LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2};
    `

    let countQuery = `SELECT COUNT(DISTINCT q.id) FROM questions q ${whereClause};`

    // Combine filter values with pagination limits for the main data execution
    const mainQueryValues = [...filterValues, parsedLimit, offset]

    // Execute data retrieval and total count calculation concurrently for optimum performance
    const [result, countResult] = await Promise.all([
      pool.query(query, mainQueryValues),
      pool.query(countQuery, filterValues), // Count query only needs search filters, not pagination values
    ])

    const total = parseInt(countResult.rows[0].count, 10)

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit),
      },
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching questions' })
  }
}

/**
 * @desc    Get a single question by ID along with options array
 * @route   GET /api/questions/:id
 * @access  Admin or Tutor
 */
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params

    const query = `
      SELECT q.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', qo.id, 
                   'text', qo.text, 
                   'is_correct', qo.is_correct, 
                   'explanation', qo.explanation
                 )
               ) FILTER (WHERE qo.id IS NOT NULL), '[]'
             ) AS options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE q.id = $1
      GROUP BY q.id;
    `
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Question not found' })
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching question:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching question' })
  }
}

/**
 * @desc    Update a question properties and optionally replace/update its options choices
 * @route   PUT /api/questions/:id
 * @access  Admin or Tutor
 * 
 * TEACHING NOTE:
 * Refactored from static COALESCE statements to a dynamic query builder. 
 * This ensures that if a client explicitly sends `null` to clear a nullable field (like `imageUrl` or `courseId`), 
 * the database actually updates the field to `null` instead of ignoring it and preserving the old value.
 */
const updateQuestion = async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { id } = req.params
    const {
      subjectId,
      courseId,
      questionText,
      questionType,
      imageUrl,
      marks,
      options,
    } = req.body

    // 1. Verify existence of the targeted question
    const checkRes = await client.query(
      'SELECT * FROM questions WHERE id = $1',
      [id],
    )
    if (checkRes.rows.length === 0) {
      await client.query('ROLLBACK')
      return res
        .status(404)
        .json({ success: false, message: 'Question not found' })
    }

    // 2. Validate options if updated array is provided
    if (options && Array.isArray(options)) {
      if (options.length < 2) {
        await client.query('ROLLBACK')
        return res
          .status(400)
          .json({
            success: false,
            message: 'A question must have at least 2 options.',
          })
      }
      const hasCorrect = options.some(
        (o) => o.isCorrect === true || o.is_correct === true,
      )
      if (!hasCorrect) {
        await client.query('ROLLBACK')
        return res
          .status(400)
          .json({
            success: false,
            message: 'At least one updated option must be marked as correct.',
          })
      }
    }

    // 3. Dynamically build the update query to support explicit nullification of fields
    const fields = []
    const updateValues = []
    let paramIndex = 1

    if (subjectId !== undefined) {
      fields.push(`subject_id = $${paramIndex++}`)
      updateValues.push(subjectId)
    }
    if (courseId !== undefined) {
      fields.push(`course_id = $${paramIndex++}`)
      updateValues.push(courseId)
    }
    if (questionText !== undefined) {
      fields.push(`question_text = $${paramIndex++}`)
      updateValues.push(questionText)
    }
    if (questionType !== undefined) {
      fields.push(`question_type = $${paramIndex++}`)
      updateValues.push(questionType)
    }
    if (imageUrl !== undefined) {
      fields.push(`image_url = $${paramIndex++}`)
      updateValues.push(imageUrl)
    }
    if (marks !== undefined) {
      fields.push(`marks = $${paramIndex++}`)
      updateValues.push(marks)
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)

    let updatedQuestion = checkRes.rows[0]
    if (fields.length > 1) {
      updateValues.push(id)
      const updateQuery = `
        UPDATE questions 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *;
      `
      const updatedQRes = await client.query(updateQuery, updateValues)
      updatedQuestion = updatedQRes.rows[0]
    }

    // 4. Handle option modifications: Delete old and insert new set if requested
    let updatedOptions = []
    if (options && Array.isArray(options)) {
      await client.query(
        'DELETE FROM question_options WHERE question_id = $1',
        [id],
      )

      for (const opt of options) {
        const optionQuery = `
          INSERT INTO question_options (question_id, text, is_correct, explanation)
          VALUES ($1, $2, $3, $4)
          RETURNING *;
        `
        const optionValues = [
          id,
          opt.text,
          opt.isCorrect || opt.is_correct || false,
          opt.explanation || null,
        ]
        const optResult = await client.query(optionQuery, optionValues)
        updatedOptions.push(optResult.rows[0])
      }
    } else {
      const existingOpts = await client.query(
        'SELECT * FROM question_options WHERE question_id = $1',
        [id],
      )
      updatedOptions = existingOpts.rows
    }

    await client.query('COMMIT')

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: {
        ...updatedQuestion,
        options: updatedOptions,
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error updating question:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error updating question' })
  } finally {
    client.release()
  }
}

/**
 * @desc    Delete a question (associated options delete automatically via database cascade constraints)
 * @route   DELETE /api/questions/:id
 * @access  Admin or Tutor
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'DELETE FROM questions WHERE id = $1 RETURNING *;',
      [id],
    )

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Question not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting question:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error deleting question' })
  }
}

/**
 * @desc    Update question status (e.g. ACTIVE, ARCHIVED, DRAFT)
 * @route   PATCH /api/questions/:id/status
 * @access  Admin or Tutor
 */
const updateQuestionStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: 'Status is required' })
    }

    const result = await pool.query(
      `UPDATE questions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *;`,
      [status, id],
    )

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Question not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Question status updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating question status:', error)
    res
      .status(500)
      .json({
        success: false,
        message: 'Server error updating question status',
      })
  }
}

/**
 * @desc    Get authenticated student's quiz/assessment history and attempt breakdowns
 * @route   GET /api/questions/history/me
 * @access  Student
 */
const getMyAssessmentHistory = async (req, res) => {
  try {
    const studentId = req.user.id
    const { page = 1, limit = 20 } = req.query
    const parsedPage = parseInt(page, 10)
    const parsedLimit = parseInt(limit, 10)
    const offset = (parsedPage - 1) * parsedLimit

    // Query student assessment submissions / quiz attempts history
    const query = `
      SELECT s.*, 
             c.title AS course_title,
             a.title AS assessment_title
      FROM assessment_submissions s
      LEFT JOIN courses c ON s.course_id::text = c.id::text
      LEFT JOIN assessments a ON s.assessment_id = a.id
      WHERE s.user_id = $1
      ORDER BY s.submitted_at DESC
      LIMIT $2 OFFSET $3;
    `
    const countQuery = `SELECT COUNT(*) FROM assessment_submissions WHERE user_id = $1;`

    const [result, countResult] = await Promise.all([
      pool.query(query, [studentId, parsedLimit, offset]),
      pool.query(countQuery, [studentId]),
    ])

    const total = parseInt(countResult.rows[0].count, 10)

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit),
      },
    })
  } catch (error) {
    console.error('Error fetching student assessment history:', error)
    res.status(500).json({ success: false, message: 'Server error fetching student history' })
  }
}

/**
 * @desc    Get detailed review for a specific assessment attempt (what was correct, missed, time used)
 * @route   GET /api/questions/history/submissions/:submissionId
 * @access  Student (own) or Admin/Tutor (any)
 */
const getSubmissionDetailReview = async (req, res) => {
  try {
    const { submissionId } = req.params
    const userId = req.user.id
    const userRole = (req.user.role || '').toUpperCase()

    const subResult = await pool.query(
      `SELECT s.*, u.name AS student_name, u.email AS student_email 
       FROM assessment_submissions s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1;`,
      [submissionId]
    )

    if (subResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Assessment submission not found' })
    }

    const submission = subResult.rows[0]

    // Restrict student from viewing other students' submissions
    if (userRole === 'STUDENT' && Number(submission.user_id) !== Number(userId)) {
      return res.status(403).json({ success: false, message: 'Access denied to this submission record' })
    }

    res.status(200).json({
      success: true,
      data: submission,
    })
  } catch (error) {
    console.error('Error fetching submission review details:', error)
    res.status(500).json({ success: false, message: 'Server error fetching submission details' })
  }
}

/**
 * @desc    Get all students' assessment/quiz performances, timing metrics, and analytics for admins & tutors
 * @route   GET /api/questions/admin/history/all
 * @access  Admin or Tutor
 */
const getAllStudentsAssessmentHistory = async (req, res) => {
  try {
    const { course_id, assessment_id, student_id, page = 1, limit = 20 } = req.query
    const parsedPage = parseInt(page, 10)
    const parsedLimit = parseInt(limit, 10)
    const offset = (parsedPage - 1) * parsedLimit

    const conditions = []
    const filterValues = []

    if (course_id) {
      filterValues.push(course_id)
      conditions.push(`s.course_id = $${filterValues.length}`)
    }
    if (assessment_id) {
      filterValues.push(assessment_id)
      conditions.push(`s.assessment_id = $${filterValues.length}`)
    }
    if (student_id) {
      filterValues.push(student_id)
      conditions.push(`s.user_id = $${filterValues.length}`)
    }

    const whereClause = conditions.length > 0 ? ` WHERE ` + conditions.join(' AND ') : ``

    const query = `
      SELECT s.*, 
             u.name AS student_name, 
             u.email AS student_email,
             c.title AS course_title,
             a.title AS assessment_title
      FROM assessment_submissions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN courses c ON s.course_id::text = c.id::text
      LEFT JOIN assessments a ON s.assessment_id = a.id
      ${whereClause}
      ORDER BY s.submitted_at DESC
      LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2};
    `

    const countQuery = `SELECT COUNT(*) FROM assessment_submissions s ${whereClause};`

    const mainQueryValues = [...filterValues, parsedLimit, offset]

    const [result, countResult] = await Promise.all([
      pool.query(query, mainQueryValues),
      pool.query(countQuery, filterValues),
    ])

    const total = parseInt(countResult.rows[0].count, 10)

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit),
      },
    })
  } catch (error) {
    console.error('Error fetching global assessment history:', error)
    res.status(500).json({ success: false, message: 'Server error fetching cohort performance metrics' })
  }
}

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  updateQuestionStatus,
  getMyAssessmentHistory,
  getSubmissionDetailReview,
  getAllStudentsAssessmentHistory,
}