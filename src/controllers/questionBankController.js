/**
 * @file questionBankController.js
 * @description Controller managing question bank lifecycles, configuration settings,
 * submissions, reviews, and bulk question imports.
 */

// const pool = require('../config/db')
const { pool } = require('../config/db')

/**
 * @desc    Get question banks with filters, search, and pagination
 * @route   GET /api/question-banks
 * @access  Admin or Tutor
 */
const getQuestionBanks = async (req, res) => {
  // 1. Get the client INSIDE the async function function block
  const client = await pool.getClient()

  try {
    const { status, courseId, search, page = 1, limit = 20 } = req.query
    const parsedPage = parseInt(page, 10)
    const parsedLimit = parseInt(limit, 10)
    const offset = (parsedPage - 1) * parsedLimit

    let query = `SELECT * FROM question_banks WHERE 1=1`
    let countQuery = `SELECT COUNT(*) FROM question_banks WHERE 1=1`

    const filterParams = []

    // Restrict tutors to viewing only their own question banks
    if (req.user.role === 'Instructor' || req.user.role === 'TUTOR') {
      filterParams.push(req.user.id)
      query += ` AND created_by = $${filterParams.length}`
      countQuery += ` AND created_by = $${filterParams.length}`
    }

    if (status) {
      filterParams.push(status)
      query += ` AND status = $${filterParams.length}`
      countQuery += ` AND status = $${filterParams.length}`
    }

    if (courseId) {
      filterParams.push(courseId)
      query += ` AND course_id = $${filterParams.length}`
      countQuery += ` AND course_id = $${filterParams.length}`
    }

    if (search) {
      filterParams.push(`%${search}%`)
      query += ` AND title ILIKE $${filterParams.length}`
      countQuery += ` AND title ILIKE $${filterParams.length}`
    }

    // Append pagination parameters cleanly without index confusion
    const mainQueryValues = [...filterParams, parsedLimit, offset]
    query += ` ORDER BY created_at DESC LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`

    const [banksResult, countResult] = await Promise.all([
      pool.query(query, mainQueryValues),
      pool.query(countQuery, filterParams), // Count query only needs filter parameters
    ])

    const total = parseInt(countResult.rows[0].count, 10)

    res.status(200).json({
      success: true,
      data: banksResult.rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit),
      },
    })
  } catch (error) {
    console.error('Error fetching question banks:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching question banks' })
  }
}

/**
 * @desc    Create an empty question bank with configuration fields
 * @route   POST /api/question-banks
 * @access  Admin or Tutor
 */
const createQuestionBank = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      subjects,
      durationMinutes,
      expiresAt,
      startTime,
      maxAttempts,
    } = req.body

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: 'Question bank title is required' })
    }

    const query = `
      INSERT INTO question_banks (
        title, 
        description, 
        course_id, 
        subjects, 
        duration_minutes, 
        expires_at, 
        start_time, 
        max_attempts, 
        created_by, 
        created_by_role, 
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'DRAFT')
      RETURNING *;
    `
    const values = [
      title,
      description !== undefined ? description : null,
      courseId !== undefined ? courseId : null,
      subjects || [],
      durationMinutes !== undefined ? durationMinutes : 30,
      expiresAt !== undefined ? expiresAt : null,
      startTime !== undefined ? startTime : null,
      maxAttempts !== undefined ? maxAttempts : 1,
      req.user.id,
      req.user.role || 'TUTOR',
    ]

    const newBank = await pool.query(query, values)

    res.status(201).json({
      success: true,
      message: 'Question bank created successfully',
      data: newBank.rows[0],
    })
  } catch (error) {
    console.error('Error creating question bank:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error creating question bank' })
  }
}

/**
 * @desc    Get a single question bank by ID with its questions and options
 * @route   GET /api/question-banks/:id
 * @access  Admin or Tutor
 */
const getQuestionBankById = async (req, res) => {
  try {
    const { id } = req.params

    const bankQuery = `SELECT * FROM question_banks WHERE id = $1`
    const bankResult = await pool.query(bankQuery, [id])

    if (bankResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Question bank not found' })
    }

    const questionsQuery = `
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
      WHERE q.question_bank_id = $1
      GROUP BY q.id
      ORDER BY q.created_at ASC;
    `
    const questionsResult = await pool.query(questionsQuery, [id])

    res.status(200).json({
      success: true,
      data: {
        ...bankResult.rows[0],
        questions: questionsResult.rows,
      },
    })
  } catch (error) {
    console.error('Error fetching question bank details:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching question bank details',
    })
  }
}

/**
 * @desc    Update a question bank configuration fields safely
 * @route   PUT /api/question-banks/:id
 * @access  Admin or Tutor
 */
const updateQuestionBank = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      courseId,
      subjects,
      durationMinutes,
      expiresAt,
      startTime,
      maxAttempts,
    } = req.body

    const query = `
      UPDATE question_banks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          course_id = COALESCE($3, course_id),
          subjects = COALESCE($4, subjects),
          duration_minutes = COALESCE($5, duration_minutes),
          expires_at = COALESCE($6, expires_at),
          start_time = COALESCE($7, start_time),
          max_attempts = COALESCE($8, max_attempts),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *;
    `
    // Use strict undefined checks so empty strings/zeros don't accidentally evaluate to null
    const values = [
      title !== undefined ? title : null,
      description !== undefined ? description : null,
      courseId !== undefined ? courseId : null,
      subjects !== undefined ? subjects : null,
      durationMinutes !== undefined ? durationMinutes : null,
      expiresAt !== undefined ? expiresAt : null,
      startTime !== undefined ? startTime : null,
      maxAttempts !== undefined ? maxAttempts : null,
      id,
    ]

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Question bank not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Question bank updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating question bank:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error updating question bank' })
  }
}

/**
 * @desc    Delete a question bank
 * @route   DELETE /api/question-banks/:id
 * @access  Admin or Tutor
 */
const deleteQuestionBank = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'DELETE FROM question_banks WHERE id = $1 RETURNING *;',
      [id],
    )

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Question bank not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Question bank deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting question bank:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error deleting question bank' })
  }
}

/**
 * @desc    Submit question bank for admin review
 * @route   PATCH /api/question-banks/:id/submit
 * @access  Tutor
 */
const submitQuestionBank = async (req, res) => {
  try {
    const { id } = req.params

    const questionsCheck = await pool.query(
      `
      SELECT q.id, COUNT(o.id) as option_count, SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END) as correct_count
      FROM questions q
      LEFT JOIN question_options o ON q.id = o.question_id
      WHERE q.question_bank_id = $1
      GROUP BY q.id
    `,
      [id],
    )

    if (questionsCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Question bank must contain at least one question before submission.',
      })
    }

    for (const q of questionsCheck.rows) {
      if (q.option_count < 2) {
        return res.status(400).json({
          success: false,
          message: `Question ID ${q.id} must have at least 2 options.`,
        })
      }
      if (q.correct_count < 1) {
        return res.status(400).json({
          success: false,
          message: `Question ID ${q.id} must have at least one correct option selected.`,
        })
      }
    }

    const updateResult = await pool.query(
      `
      UPDATE question_banks 
      SET status = 'PENDING_REVIEW', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND created_by = $2
      RETURNING *;
    `,
      [id, req.user.id],
    )

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Question bank not found or unauthorized',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Question bank submitted for review successfully.',
      data: updateResult.rows[0],
    })
  } catch (error) {
    console.error('Error submitting question bank:', error)
    res.status(500).json({
      success: false,
      message: 'Server error submitting question bank',
    })
  }
}

/**
 * @desc    Review (Approve or Reject) question bank
 * @route   PATCH /api/question-banks/:id/review
 * @access  Admin
 */
const reviewQuestionBank = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reviewComment } = req.body

    if (!['APPROVED', 'REJECTED', 'ACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided for review.',
      })
    }

    const query = `
      UPDATE question_banks 
      SET status = $1, 
          review_comment = $2, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `
    const result = await pool.query(query, [status, reviewComment || null, id])

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Question bank not found' })
    }

    res.status(200).json({
      success: true,
      message: `Question bank status updated to ${status}`,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error reviewing question bank:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error reviewing question bank' })
  }
}

/**
 * @desc    Validate question import file/payload
 * @route   POST /api/question-banks/validate-import
 * @access  Admin or Tutor
 */
const validateImport = async (req, res) => {
  try {
    const { questions } = req.body

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload. Questions array required.',
      })
    }

    let validCount = 0
    let errors = []

    questions.forEach((q, index) => {
      if (!q.questionText && !q.question_text) {
        errors.push({ index, message: 'Missing question text.' })
      } else if (
        !q.options ||
        !Array.isArray(q.options) ||
        q.options.length < 2
      ) {
        errors.push({ index, message: 'Fewer than 2 options provided.' })
      } else {
        const hasCorrect = q.options.some(
          (o) => o.isCorrect === true || o.is_correct === true,
        )
        if (!hasCorrect) {
          errors.push({
            index,
            message: 'At least one option must be marked correct.',
          })
        } else {
          validCount++
        }
      }
    })

    res.status(200).json({
      success: true,
      total: questions.length,
      valid: validCount,
      invalid: errors.length,
      errors,
    })
  } catch (error) {
    console.error('Error validating import:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error validating import' })
  }
}

/**
 * @desc    Bulk import questions into a question bank inside a single transaction block
 * @route   POST /api/question-banks/:id/import
 * @access  Admin or Tutor
 */
const importQuestions = async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { id } = req.params
    const { questions } = req.body

    const bankCheck = await client.query(
      'SELECT * FROM question_banks WHERE id = $1',
      [id],
    )
    if (bankCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      return res
        .status(404)
        .json({ success: false, message: 'Question bank not found' })
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      await client.query('ROLLBACK')
      return res
        .status(400)
        .json({ success: false, message: 'No questions provided for import.' })
    }

    const importedQuestions = []

    for (const q of questions) {
      const qRes = await client.query(
        `INSERT INTO questions (question_bank_id, subject_id, course_id, question_text, question_type, image_url, marks, created_by, created_by_role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
        [
          id,
          q.subjectId ||
            q.subject_id ||
            bankCheck.rows[0].subjects?.[0] ||
            null,
          q.courseId || q.course_id || bankCheck.rows[0].course_id,
          q.questionText || q.question_text,
          q.questionType || q.question_type || 'MCQ',
          q.imageUrl || q.image_url || null,
          q.marks || 1,
          req.user.id,
          req.user.role || 'TUTOR',
        ],
      )
      const newQ = qRes.rows[0]
      const insertedOptions = []

      for (const opt of q.options) {
        const optRes = await client.query(
          `INSERT INTO question_options (question_id, text, is_correct, explanation)
           VALUES ($1, $2, $3, $4) RETURNING *;`,
          [
            newQ.id,
            opt.text,
            opt.isCorrect || opt.is_correct || false,
            opt.explanation || null,
          ],
        )
        insertedOptions.push(optRes.rows[0])
      }

      importedQuestions.push({ ...newQ, options: insertedOptions })
    }

    await client.query('COMMIT')
    res.status(201).json({
      success: true,
      message: `Successfully imported ${importedQuestions.length} questions.`,
      data: importedQuestions,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error importing questions:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error during question import' })
  } finally {
    client.release()
  }
}

module.exports = {
  getQuestionBanks,
  createQuestionBank,
  getQuestionBankById,
  updateQuestionBank,
  deleteQuestionBank,
  submitQuestionBank,
  reviewQuestionBank,
  validateImport,
  importQuestions,
}
