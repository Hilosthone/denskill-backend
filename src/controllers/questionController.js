// src/controllers/questionController.js
const pool = require('../config/db')

// @desc    Create a question and its options
// @route   POST /api/questions
// @access  Admin or Tutor
const createQuestion = async (req, res) => {
  const client = await pool.connect()
  try {
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

    if (
      !questionBankId ||
      !subjectId ||
      !questionText ||
      !options ||
      !Array.isArray(options) ||
      options.length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields or insufficient options (minimum 2 required).',
      })
    }

    // Ensure at least one option is marked as correct
    const hasCorrectOption = options.some(
      (opt) => opt.isCorrect === true || opt.is_correct === true,
    )
    if (!hasCorrectOption) {
      return res.status(400).json({
        success: false,
        message: 'At least one option must be marked as the correct answer.',
      })
    }

    // Verify question bank exists
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

    // Insert Question
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

    // Insert Options
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
    await client.query('ROLLBACK')
    console.error('Error creating question:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error creating question' })
  } finally {
    client.release()
  }
}

// @desc    Get all questions with optional filters and pagination
// @route   GET /api/questions
// @access  Admin or Tutor
const getQuestions = async (req, res) => {
  try {
    const {
      question_bank_id,
      subject_id,
      course_id,
      page = 1,
      limit = 20,
    } = req.query
    const offset = (page - 1) * limit

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
    `
    let countQuery = `SELECT COUNT(DISTINCT q.id) FROM questions q WHERE 1=1`
    const conditions = []
    const values = []

    if (question_bank_id) {
      values.push(question_bank_id)
      conditions.push(`q.question_bank_id = $${values.length}`)
    }
    if (subject_id) {
      values.push(subject_id)
      conditions.push(`q.subject_id = $${values.length}`)
    }
    if (course_id) {
      values.push(course_id)
      conditions.push(`q.course_id = $${values.length}`)
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ` + conditions.join(' AND ')
      query += whereClause
      countQuery += ` AND ` + conditions.join(' AND ')
    }

    values.push(limit, offset)
    query += ` GROUP BY q.id ORDER BY q.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length};`

    const [result, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, values.slice(0, values.length - 2)),
    ])

    const total = parseInt(countResult.rows[0].count, 10)

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching questions' })
  }
}

// @desc    Get a single question by ID with options
// @route   GET /api/questions/:id
// @access  Admin or Tutor
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

// @desc    Update a question and optionally replace/update its options
// @route   PUT /api/questions/:id
// @access  Admin or Tutor
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

    // Check if question exists
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

    // If new options are provided, validate them
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

    const updateQuery = `
      UPDATE questions 
      SET subject_id = COALESCE($1, subject_id),
          course_id = COALESCE($2, course_id),
          question_text = COALESCE($3, question_text),
          question_type = COALESCE($4, question_type),
          image_url = COALESCE($5, image_url),
          marks = COALESCE($6, marks),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `
    const updateValues = [
      subjectId || null,
      courseId || null,
      questionText || null,
      questionType || null,
      imageUrl || null,
      marks || null,
      id,
    ]

    const updatedQRes = await client.query(updateQuery, updateValues)
    const updatedQuestion = updatedQRes.rows[0]

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

// @desc    Delete a question and its cascade options
// @route   DELETE /api/questions/:id
// @access  Admin or Tutor
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

// @desc    Update question status (e.g. ACTIVE, ARCHIVED)
// @route   PATCH /api/questions/:id/status
// @access  Admin or Tutor
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

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  updateQuestionStatus,
}
