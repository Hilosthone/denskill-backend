// // src/controllers/questionBankController.js
// const pool = require('../config/db') // Adjust based on your db connection path

// // @desc    Get question banks (Filtered by role)
// // @route   GET /api/question-banks
// // @access  Admin or Tutor
// const getQuestionBanks = async (req, res) => {
//   try {
//     const { status, courseId, search, page = 1, limit = 20 } = req.query
//     const offset = (page - 1) * limit

//     let query = `SELECT * FROM question_banks WHERE 1=1`
//     let countQuery = `SELECT COUNT(*) FROM question_banks WHERE 1=1`
//     const params = []

//     // If user is a Tutor (check req.user.role or similar from your auth middleware), limit to their banks or authorized courses
//     if (req.user.role === 'Instructor' || req.user.role === 'TUTOR') {
//       params.push(req.user.id)
//       query += ` AND created_by = $${params.length}`
//       countQuery += ` AND created_by = $${params.length}`
//     }

//     if (status) {
//       params.push(status)
//       query += ` AND status = $${params.length}`
//       countQuery += ` AND status = $${params.length}`
//     }

//     if (courseId) {
//       params.push(courseId)
//       query += ` AND course_id = $${params.length}`
//       countQuery += ` AND course_id = $${params.length}`
//     }

//     if (search) {
//       params.push(`%${search}%`)
//       query += ` AND title ILIKE $${params.length}`
//       countQuery += ` AND title ILIKE $${params.length}`
//     }

//     params.push(limit, offset)
//     query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`

//     const [banksResult, countResult] = await Promise.all([
//       pool.query(query, params),
//       pool.query(countQuery, params.slice(0, params.length - 2)),
//     ])

//     const total = parseInt(countResult.rows[0].count, 10)

//     res.status(200).json({
//       success: true,
//       data: banksResult.rows,
//       pagination: {
//         page: parseInt(page, 10),
//         limit: parseInt(limit, 10),
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     })
//   } catch (error) {
//     console.error('Error fetching question banks:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching question banks' })
//   }
// }

// // @desc    Create an empty question bank
// // @route   POST /api/question-banks
// // @access  Admin or Tutor
// const createQuestionBank = async (req, res) => {
//   try {
//     const { title, description, courseId, subjects } = req.body

//     if (!title) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Question bank title is required' })
//     }

//     const query = `
//       INSERT INTO question_banks (title, description, course_id, subjects, created_by, created_by_role, status)
//       VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
//       RETURNING *;
//     `
//     const values = [
//       title,
//       description || null,
//       courseId || null,
//       subjects || [],
//       req.user.id,
//       req.user.role || 'TUTOR',
//     ]

//     const newBank = await pool.query(query, values)

//     res.status(201).json({
//       success: true,
//       message: 'Question bank created successfully',
//       data: newBank.rows[0],
//     })
//   } catch (error) {
//     console.error('Error creating question bank:', error)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error creating question bank' })
//   }
// }

// // @desc    Submit question bank for admin review
// // @route   PATCH /api/question-banks/:id/submit
// // @access  Tutor
// const submitQuestionBank = async (req, res) => {
//   try {
//     const { id } = req.params

//     // Validate if bank has at least one question with valid options & correct answer
//     const questionsCheck = await pool.query(
//       `
//       SELECT q.id, COUNT(o.id) as option_count, SUM(CASE WHEN o.is_correct THEN 1 ELSE 0 END) as correct_count
//       FROM questions q
//       LEFT JOIN question_options o ON q.id = o.question_id
//       WHERE q.question_bank_id = $1
//       GROUP BY q.id
//     `,
//       [id],
//     )

//     if (questionsCheck.rows.length === 0) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message:
//             'Question bank must contain at least one question before submission.',
//         })
//     }

//     for (const q of questionsCheck.rows) {
//       if (q.option_count < 2) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: `Question ID ${q.id} must have at least 2 options.`,
//           })
//       }
//       if (q.correct_count < 1) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message: `Question ID ${q.id} must have at least one correct option selected.`,
//           })
//       }
//     }

//     const updateResult = await pool.query(
//       `
//       UPDATE question_banks
//       SET status = 'PENDING_REVIEW', updated_at = CURRENT_TIMESTAMP
//       WHERE id = $1 AND created_by = $2
//       RETURNING *;
//     `,
//       [id, req.user.id],
//     )

//     if (updateResult.rows.length === 0) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message: 'Question bank not found or unauthorized',
//         })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Question bank submitted for review successfully.',
//       data: updateResult.rows[0],
//     })
//   } catch (error) {
//     console.error('Error submitting question bank:', error)
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error submitting question bank',
//       })
//   }
// }

// module.exports = {
//   getQuestionBanks,
//   createQuestionBank,
//   submitQuestionBank,
// }


// src/controllers/questionBankController.js
const pool = require('../config/db') // Adjust based on your db connection path

// @desc    Get question banks (Filtered by role)
// @route   GET /api/question-banks
// @access  Admin or Tutor
const getQuestionBanks = async (req, res) => {
  try {
    const { status, courseId, search, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    let query = `SELECT * FROM question_banks WHERE 1=1`
    let countQuery = `SELECT COUNT(*) FROM question_banks WHERE 1=1`
    const params = []

    // If user is a Tutor (check req.user.role or similar from your auth middleware), limit to their banks or authorized courses
    if (req.user.role === 'Instructor' || req.user.role === 'TUTOR') {
      params.push(req.user.id)
      query += ` AND created_by = $${params.length}`
      countQuery += ` AND created_by = $${params.length}`
    }

    if (status) {
      params.push(status)
      query += ` AND status = $${params.length}`
      countQuery += ` AND status = $${params.length}`
    }

    if (courseId) {
      params.push(courseId)
      query += ` AND course_id = $${params.length}`
      countQuery += ` AND course_id = $${params.length}`
    }

    if (search) {
      params.push(`%${search}%`)
      query += ` AND title ILIKE $${params.length}`
      countQuery += ` AND title ILIKE $${params.length}`
    }

    params.push(limit, offset)
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`

    const [banksResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, params.length - 2)),
    ])

    const total = parseInt(countResult.rows[0].count, 10)

    res.status(200).json({
      success: true,
      data: banksResult.rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching question banks:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching question banks' })
  }
}

// @desc    Create an empty question bank
// @route   POST /api/question-banks
// @access  Admin or Tutor
const createQuestionBank = async (req, res) => {
  try {
    const { title, description, courseId, subjects } = req.body

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: 'Question bank title is required' })
    }

    const query = `
      INSERT INTO question_banks (title, description, course_id, subjects, created_by, created_by_role, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
      RETURNING *;
    `
    const values = [
      title,
      description || null,
      courseId || null,
      subjects || [],
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

// @desc    Get a single question bank by ID with its questions and options
// @route   GET /api/question-banks/:id
// @access  Admin or Tutor
const getQuestionBankById = async (req, res) => {
  try {
    const { id } = req.params

    const bankQuery = `SELECT * FROM question_banks WHERE id = $1`
    const bankResult = await pool.query(bankQuery, [id])

    if (bankResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question bank not found' })
    }

    // Fetch associated questions with options
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
    res.status(500).json({ success: false, message: 'Server error fetching question bank details' })
  }
}

// @desc    Update a question bank
// @route   PUT /api/question-banks/:id
// @access  Admin or Tutor
const updateQuestionBank = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, courseId, subjects } = req.body

    const query = `
      UPDATE question_banks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          course_id = COALESCE($3, course_id),
          subjects = COALESCE($4, subjects),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `
    const values = [
      title || null,
      description || null,
      courseId || null,
      subjects || null,
      id,
    ]

    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question bank not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Question bank updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating question bank:', error)
    res.status(500).json({ success: false, message: 'Server error updating question bank' })
  }
}

// @desc    Delete a question bank
// @route   DELETE /api/question-banks/:id
// @access  Admin or Tutor
const deleteQuestionBank = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM question_banks WHERE id = $1 RETURNING *;', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Question bank not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Question bank deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting question bank:', error)
    res.status(500).json({ success: false, message: 'Server error deleting question bank' })
  }
}

// @desc    Submit question bank for admin review
// @route   PATCH /api/question-banks/:id/submit
// @access  Tutor
const submitQuestionBank = async (req, res) => {
  try {
    const { id } = req.params

    // Validate if bank has at least one question with valid options & correct answer
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
      return res
        .status(400)
        .json({
          success: false,
          message:
            'Question bank must contain at least one question before submission.',
        })
    }

    for (const q of questionsCheck.rows) {
      if (q.option_count < 2) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Question ID ${q.id} must have at least 2 options.`,
          })
      }
      if (q.correct_count < 1) {
        return res
          .status(400)
          .json({
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
      return res
        .status(404)
        .json({
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
    res
      .status(500)
      .json({
        success: false,
        message: 'Server error submitting question bank',
      })
  }
}

// @desc    Review (Approve or Reject) question bank
// @route   PATCH /api/question-banks/:id/review
// @access  Admin
const reviewQuestionBank = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reviewComment } = req.body // status: 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED', 'ACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided for review.' })
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
      return res.status(404).json({ success: false, message: 'Question bank not found' })
    }

    res.status(200).json({
      success: true,
      message: `Question bank status updated to ${status}`,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error reviewing question bank:', error)
    res.status(500).json({ success: false, message: 'Server error reviewing question bank' })
  }
}

// @desc    Validate question import file/payload
// @route   POST /api/question-banks/validate-import
// @access  Admin or Tutor
const validateImport = async (req, res) => {
  try {
    const { questions } = req.body

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Invalid payload. Questions array required.' })
    }

    let validCount = 0
    let errors = []

    questions.forEach((q, index) => {
      if (!q.questionText || !q.options || q.options.length < 2) {
        errors.push({ index, message: 'Missing question text or fewer than 2 options.' })
      } else {
        const hasCorrect = q.options.some((o) => o.isCorrect === true || o.is_correct === true)
        if (!hasCorrect) {
          errors.push({ index, message: 'At least one option must be marked correct.' })
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
    res.status(500).json({ success: false, message: 'Server error validating import' })
  }
}

// @desc    Bulk import questions into a question bank
// @route   POST /api/question-banks/:id/import
// @access  Admin or Tutor
const importQuestions = async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { id } = req.params
    const { questions } = req.body

    const bankCheck = await client.query('SELECT * FROM question_banks WHERE id = $1', [id])
    if (bankCheck.rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ success: false, message: 'Question bank not found' })
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ success: false, message: 'No questions provided for import.' })
    }

    const importedQuestions = []

    for (const q of questions) {
      const qRes = await client.query(
        `INSERT INTO questions (question_bank_id, subject_id, course_id, question_text, question_type, image_url, marks, created_by, created_by_role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
        [
          id,
          q.subjectId || q.subject_id || 'GENERAL',
          q.courseId || q.course_id || bankCheck.rows[0].course_id,
          q.questionText || q.question_text,
          q.questionType || q.question_type || 'MCQ',
          q.imageUrl || q.image_url || null,
          q.marks || 1,
          req.user.id,
          req.user.role || 'TUTOR',
        ]
      )
      const newQ = qRes.rows[0]
      const insertedOptions = []

      for (const opt of q.options) {
        const optRes = await client.query(
          `INSERT INTO question_options (question_id, text, is_correct, explanation)
           VALUES ($1, $2, $3, $4) RETURNING *;`,
          [newQ.id, opt.text, opt.isCorrect || opt.is_correct || false, opt.explanation || null]
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
    res.status(500).json({ success: false, message: 'Server error during question import' })
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