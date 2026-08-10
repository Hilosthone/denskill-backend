// const pool = require('../config/db')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

// // 0. Tutor Login Controller
// exports.tutorLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Please provide email and password' })
//     }

//     const result = await pool.query(
//       'SELECT * FROM instructors WHERE email = $1',
//       [email],
//     )

//     if (result.rows.length === 0) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'Invalid tutor credentials' })
//     }

//     const tutor = result.rows[0]
//     const DEFAULT_PASS = 'admin@denskill123'
//     const isMatch =
//       password === DEFAULT_PASS ||
//       (tutor.password && (await bcrypt.compare(password, tutor.password)))

//     if (!isMatch) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'Invalid tutor credentials' })
//     }

//     const token = jwt.sign(
//       { id: tutor.id, email: tutor.email, role: tutor.role || 'Instructor' },
//       process.env.JWT_SECRET || 'fallback_secret',
//       { expiresIn: '7d' },
//     )

//     return res.status(200).json({
//       success: true,
//       message: 'Tutor logged in successfully',
//       token,
//       tutor: {
//         id: tutor.id,
//         name: tutor.name,
//         email: tutor.email,
//         specialty: tutor.specialty,
//         role: tutor.role || 'Instructor',
//       },
//     })
//   } catch (err) {
//     console.error('Tutor login error:', err)
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error during tutor login.' })
//   }
// }

// // 1. Create a new Quiz, Assessment, Assignment, or Milestone with Duration/Deadline
// exports.createAssessment = async (req, res) => {
//   try {
//     const {
//       course_id,
//       title,
//       description,
//       type,
//       total_marks,
//       weight,
//       due_date,
//     } = req.body
//     const tutorId = req.user.id

//     const query = `
//       INSERT INTO assessments (course_id, title, description, type, total_marks, weight, created_by, due_date)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//       RETURNING *;
//     `
//     const values = [
//       course_id,
//       title,
//       description,
//       type || 'assignment',
//       total_marks || 100,
//       weight || 0,
//       tutorId,
//       due_date || null,
//     ]

//     const result = await pool.query(query, values)
//     res.status(201).json({ success: true, assessment: result.rows[0] })
//   } catch (err) {
//     console.error('Error creating assessment:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error creating assessment.' })
//   }
// }

// // 2. Fetch all assessments for a course
// exports.getAssessmentsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const result = await pool.query(
//       'SELECT * FROM assessments WHERE course_id = $1 ORDER BY created_at DESC',
//       [courseId],
//     )
//     res.status(200).json({ success: true, assessments: result.rows })
//   } catch (err) {
//     console.error('Error fetching assessments:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching assessments.' })
//   }
// }

// // 3. Update an existing assessment/quiz/assignment
// exports.updateAssessment = async (req, res) => {
//   try {
//     const { assessmentId } = req.params
//     const { title, description, type, total_marks, weight, due_date } = req.body

//     const query = `
//       UPDATE assessments
//       SET title = COALESCE($1, title),
//           description = COALESCE($2, description),
//           type = COALESCE($3, type),
//           total_marks = COALESCE($4, total_marks),
//           weight = COALESCE($5, weight),
//           due_date = COALESCE($6, due_date)
//       WHERE id = $7
//       RETURNING *;
//     `
//     const values = [
//       title,
//       description,
//       type,
//       total_marks,
//       weight,
//       due_date,
//       assessmentId,
//     ]
//     const result = await pool.query(query, values)

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Assessment not found.' })
//     }

//     res.status(200).json({ success: true, assessment: result.rows[0] })
//   } catch (err) {
//     console.error('Error updating assessment:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error updating assessment.' })
//   }
// }

// // 4. Delete an assessment/quiz/assignment
// exports.deleteAssessment = async (req, res) => {
//   try {
//     const { assessmentId } = req.params

//     const result = await pool.query(
//       'DELETE FROM assessments WHERE id = $1 RETURNING *;',
//       [assessmentId],
//     )

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Assessment not found.' })
//     }

//     res
//       .status(200)
//       .json({ success: true, message: 'Assessment deleted successfully.' })
//   } catch (err) {
//     console.error('Error deleting assessment:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error deleting assessment.' })
//   }
// }

// // 5. Get all student submissions for a specific assessment item
// exports.getSubmissionsByAssessment = async (req, res) => {
//   try {
//     const { assessmentId } = req.params
//     const query = `
//       SELECT s.*, u.name, u.email
//       FROM student_submissions s
//       JOIN users u ON s.student_id = u.id
//       WHERE s.assessment_id = $1
//     `
//     const result = await pool.query(query, [assessmentId])
//     res.status(200).json({ success: true, submissions: result.rows })
//   } catch (err) {
//     console.error('Error fetching submissions:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching submissions.' })
//   }
// }

// // 6. Submit Score and qualitative feedback for student work item
// exports.gradeSubmission = async (req, res) => {
//   try {
//     const { submissionId } = req.params
//     const { score, feedback } = req.body
//     const tutorId = req.user.id

//     const query = `
//       UPDATE student_submissions
//       SET score = $1, feedback = $2, graded_by = $3, status = 'graded', graded_at = CURRENT_TIMESTAMP
//       WHERE id = $4
//       RETURNING *;
//     `
//     const result = await pool.query(query, [
//       score,
//       feedback,
//       tutorId,
//       submissionId,
//     ])

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Submission not found.' })
//     }

//     res.status(200).json({ success: true, submission: result.rows[0] })
//   } catch (err) {
//     console.error('Error grading submission:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error grading submission.' })
//   }
// }

// // 7. Log daily attendance records for students in a course session
// exports.logAttendance = async (req, res) => {
//   try {
//     const { course_id, attendance_records } = req.body
//     const tutorId = req.user.id
//     const sessionDate = new Date().toISOString().split('T')[0]

//     const query = `
//       INSERT INTO attendance_logs (course_id, student_id, session_date, status, logged_by)
//       VALUES ($1, $2, $3, $4, $5)
//       ON CONFLICT (student_id, course_id, session_date)
//       DO UPDATE SET status = EXCLUDED.status, logged_by = EXCLUDED.logged_by
//       RETURNING *;
//     `

//     const savedLogs = []
//     for (const record of attendance_records) {
//       const values = [
//         course_id,
//         record.student_id,
//         sessionDate,
//         record.status,
//         tutorId,
//       ]
//       const result = await pool.query(query, values)
//       savedLogs.push(result.rows[0])
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Attendance logged successfully.',
//       logs: savedLogs,
//     })
//   } catch (err) {
//     console.error('Error logging attendance:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error logging attendance.' })
//   }
// }

// // ==========================================
// // 8. COURSE CONTENT & RESOURCE MANAGEMENT
// // ==========================================
// exports.uploadCourseModule = async (req, res) => {
//   try {
//     const {
//       course_id,
//       title,
//       week_number,
//       content_type,
//       resource_url,
//       description,
//     } = req.body
//     const tutorId = req.user.id

//     const query = `
//       INSERT INTO course_modules (course_id, title, week_number, content_type, resource_url, description, created_by)
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING *;
//     `
//     const result = await pool.query(query, [
//       course_id,
//       title,
//       week_number,
//       content_type,
//       resource_url,
//       description,
//       tutorId,
//     ])
//     res.status(201).json({ success: true, module: result.rows[0] })
//   } catch (err) {
//     console.error('Error uploading module:', err)
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error uploading course module.',
//       })
//   }
// }

// exports.getCourseModules = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const result = await pool.query(
//       'SELECT * FROM course_modules WHERE course_id = $1 ORDER BY week_number ASC',
//       [courseId],
//     )
//     res.status(200).json({ success: true, modules: result.rows })
//   } catch (err) {
//     console.error('Error fetching modules:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching modules.' })
//   }
// }

// // ==========================================
// // 9. LIVE SESSION & OFFICE HOURS MANAGEMENT
// // ==========================================
// exports.scheduleLiveSession = async (req, res) => {
//   try {
//     const {
//       course_id,
//       title,
//       session_type,
//       meeting_link,
//       scheduled_at,
//       description,
//     } = req.body
//     const tutorId = req.user.id

//     const query = `
//       INSERT INTO live_sessions (course_id, title, session_type, meeting_link, scheduled_at, description, tutor_id)
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING *;
//     `
//     const result = await pool.query(query, [
//       course_id,
//       title,
//       session_type || 'lecture',
//       meeting_link,
//       scheduled_at,
//       description,
//       tutorId,
//     ])
//     res.status(201).json({ success: true, session: result.rows[0] })
//   } catch (err) {
//     console.error('Error scheduling live session:', err)
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error scheduling live session.',
//       })
//   }
// }

// exports.getLiveSessions = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const result = await pool.query(
//       'SELECT * FROM live_sessions WHERE course_id = $1 ORDER BY scheduled_at ASC',
//       [courseId],
//     )
//     res.status(200).json({ success: true, sessions: result.rows })
//   } catch (err) {
//     console.error('Error fetching sessions:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching live sessions.' })
//   }
// }

// // ==========================================
// // 10. STUDENT ROSTER & COHORT TRACKING
// // ==========================================
// exports.getCourseRoster = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const query = `
//       SELECT u.id, u.name, u.email, e.payment_status, e.created_at as enrollment_date,
//              (SELECT COUNT(*) FROM student_submissions s JOIN assessments a ON s.assessment_id = a.id WHERE s.student_id = u.id AND a.course_id = $1) as submissions_count
//       FROM enrollments e
//       JOIN users u ON e.user_id = u.id
//       WHERE e.course = (SELECT title FROM courses WHERE id = $1 OR title = $1)
//     `
//     const result = await pool.query(query, [courseId])
//     res.status(200).json({ success: true, roster: result.rows })
//   } catch (err) {
//     console.error('Error fetching roster:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching course roster.' })
//   }
// }

// // ==========================================
// // 11. ADVANCED PROJECT & CODE REVIEW WORKFLOWS
// // ==========================================
// exports.submitIterativeFeedback = async (req, res) => {
//   try {
//     const { submissionId } = req.params
//     const { score, feedback, review_status } = req.body
//     const tutorId = req.user.id

//     const query = `
//       UPDATE student_submissions
//       SET score = COALESCE($1, score),
//           feedback = $2,
//           status = COALESCE($3, status),
//           graded_by = $4,
//           graded_at = CURRENT_TIMESTAMP
//       WHERE id = $5
//       RETURNING *;
//     `
//     const result = await pool.query(query, [
//       score,
//       feedback,
//       review_status || 'reviewed',
//       tutorId,
//       submissionId,
//     ])
//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Submission not found.' })
//     }
//     res.status(200).json({ success: true, submission: result.rows[0] })
//   } catch (err) {
//     console.error('Error submitting review:', err)
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error updating repository review.',
//       })
//   }
// }

// // ==========================================
// // 12. COURSE-SPECIFIC ANNOUNCEMENTS
// // ==========================================
// exports.createCourseAnnouncement = async (req, res) => {
//   try {
//     const { course_id, title, content } = req.body
//     const tutorId = req.user.id

//     const query = `
//       INSERT INTO course_announcements (course_id, title, content, tutor_id)
//       VALUES ($1, $2, $3, $4)
//       RETURNING *;
//     `
//     const result = await pool.query(query, [course_id, title, content, tutorId])
//     res.status(201).json({ success: true, announcement: result.rows[0] })
//   } catch (err) {
//     console.error('Error creating course announcement:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error creating announcement.' })
//   }
// }

// // ==========================================
// // 13. CLASS ANALYTICS & PERFORMANCE REPORTS
// // ==========================================
// exports.getClassAnalytics = async (req, res) => {
//   try {
//     const { courseId } = req.params

//     const statsQuery = `
//       SELECT
//         AVG(s.score) as average_score,
//         MAX(s.score) as highest_score,
//         MIN(s.score) as lowest_score,
//         COUNT(s.id) as total_submissions
//       FROM student_submissions s
//       JOIN assessments a ON s.assessment_id = a.id
//       WHERE a.course_id = $1;
//     `
//     const statsResult = await pool.query(statsQuery, [courseId])

//     const atRiskQuery = `
//       SELECT u.id, u.name, u.email
//       FROM users u
//       JOIN enrollments e ON u.id = e.user_id
//       WHERE e.course = (SELECT title FROM courses WHERE id = $1 OR title = $1)
//       AND u.id NOT IN (
//         SELECT DISTINCT s.student_id
//         FROM student_submissions s
//         JOIN assessments a ON s.assessment_id = a.id
//         WHERE a.course_id = $1
//       );
//     `
//     const atRiskResult = await pool.query(atRiskQuery, [courseId])

//     res.status(200).json({
//       success: true,
//       analytics: {
//         summary: statsResult.rows[0],
//         at_risk_students: atRiskResult.rows,
//       },
//     })
//   } catch (err) {
//     console.error('Error fetching analytics:', err)
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error generating class analytics.',
//       })
//   }
// }





// ==========================================
// 1. TUTOR CONTROLLER (tutorController.js)
// ==========================================
const pool = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// 0. Tutor Login Controller
exports.tutorLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide email and password' })
    }

    const result = await pool.query(
      'SELECT * FROM instructors WHERE email = $1',
      [email],
    )

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid tutor credentials' })
    }

    const tutor = result.rows[0]
    const DEFAULT_PASS = 'admin@denskill123'
    const isMatch =
      password === DEFAULT_PASS ||
      (tutor.password && (await bcrypt.compare(password, tutor.password)))

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid tutor credentials' })
    }

    const token = jwt.sign(
      { id: tutor.id, email: tutor.email, role: tutor.role || 'Instructor' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' },
    )

    return res.status(200).json({
      success: true,
      message: 'Tutor logged in successfully',
      token,
      tutor: {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        specialty: tutor.specialty,
        role: tutor.role || 'Instructor',
      },
    })
  } catch (err) {
    console.error('Tutor login error:', err)
    return res
      .status(500)
      .json({ success: false, message: 'Server error during tutor login.' })
  }
}

// 1. Create a new Quiz, Assessment, Assignment, or Milestone
exports.createAssessment = async (req, res) => {
  try {
    const {
      course_id,
      title,
      description,
      type,
      total_marks,
      weight,
      due_date,
    } = req.body
    const tutorId = req.user.id

    const query = `
      INSERT INTO assessments (course_id, title, description, type, total_marks, weight, created_by, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `
    const values = [
      course_id,
      title,
      description,
      type || 'assignment',
      total_marks || 100,
      weight || 0,
      tutorId,
      due_date || null,
    ]

    const result = await pool.query(query, values)
    res.status(201).json({ success: true, assessment: result.rows[0] })
  } catch (err) {
    console.error('Error creating assessment:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error creating assessment.' })
  }
}

// 2. Fetch all assessments for a course
exports.getAssessmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const result = await pool.query(
      'SELECT * FROM assessments WHERE course_id = $1 ORDER BY created_at DESC',
      [courseId],
    )
    res.status(200).json({ success: true, assessments: result.rows })
  } catch (err) {
    console.error('Error fetching assessments:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching assessments.' })
  }
}

// 3. Update an existing assessment
exports.updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params
    const { title, description, type, total_marks, weight, due_date } = req.body

    const query = `
      UPDATE assessments 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          type = COALESCE($3, type),
          total_marks = COALESCE($4, total_marks),
          weight = COALESCE($5, weight),
          due_date = COALESCE($6, due_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `
    const values = [
      title,
      description,
      type,
      total_marks,
      weight,
      due_date,
      assessmentId,
    ]
    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Assessment not found.' })
    }

    res.status(200).json({ success: true, assessment: result.rows[0] })
  } catch (err) {
    console.error('Error updating assessment:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error updating assessment.' })
  }
}

// 4. Delete an assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params

    const result = await pool.query(
      'DELETE FROM assessments WHERE id = $1 RETURNING *;',
      [assessmentId],
    )

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Assessment not found.' })
    }

    res
      .status(200)
      .json({ success: true, message: 'Assessment deleted successfully.' })
  } catch (err) {
    console.error('Error deleting assessment:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error deleting assessment.' })
  }
}

// 5. Get all student submissions for a specific assessment item
exports.getSubmissionsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params
    const query = `
      SELECT s.*, u.name, u.email 
      FROM student_submissions s
      JOIN users u ON s.student_id = u.id
      WHERE s.assessment_id = $1
    `
    const result = await pool.query(query, [assessmentId])
    res.status(200).json({ success: true, submissions: result.rows })
  } catch (err) {
    console.error('Error fetching submissions:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching submissions.' })
  }
}

// 6. Submit Score and qualitative feedback for student work item
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params
    const { score, feedback } = req.body
    const tutorId = req.user.id

    const query = `
      UPDATE student_submissions 
      SET score = $1, feedback = $2, graded_by = $3, status = 'graded', graded_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `
    const result = await pool.query(query, [
      score,
      feedback,
      tutorId,
      submissionId,
    ])

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'Submission not found.' })
    }

    res.status(200).json({ success: true, submission: result.rows[0] })
  } catch (err) {
    console.error('Error grading submission:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error grading submission.' })
  }
}

// 7. Log daily attendance records for students in a course session
exports.logAttendance = async (req, res) => {
  const client = await pool.connect()
  try {
    const { course_id, attendance_records } = req.body
    const tutorId = req.user.id
    const sessionDate = new Date().toISOString().split('T')[0]

    if (!attendance_records || !Array.isArray(attendance_records)) {
      return res.status(400).json({
        success: false,
        message: 'attendance_records must be a valid array.',
      })
    }

    await client.query('BEGIN')

    const query = `
      INSERT INTO attendance_logs (course_id, student_id, session_date, status, logged_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (student_id, course_id, session_date) 
      DO UPDATE SET status = EXCLUDED.status, logged_by = EXCLUDED.logged_by
      RETURNING *;
    `

    const savedLogs = []
    for (const record of attendance_records) {
      const values = [
        course_id,
        record.student_id,
        sessionDate,
        record.status,
        tutorId,
      ]
      const result = await client.query(query, values)
      savedLogs.push(result.rows[0])
    }

    await client.query('COMMIT')

    res.status(200).json({
      success: true,
      message: 'Attendance logged successfully.',
      logs: savedLogs,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error logging attendance:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error logging attendance.' })
  } finally {
    client.release()
  }
}

// 8. Upload course module
exports.uploadCourseModule = async (req, res) => {
  try {
    const {
      course_id,
      title,
      week_number,
      content_type,
      resource_url,
      description,
    } = req.body
    const tutorId = req.user.id

    const query = `
      INSERT INTO course_modules (course_id, title, week_number, content_type, resource_url, description, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `
    const result = await pool.query(query, [
      course_id,
      title,
      week_number,
      content_type || 'video',
      resource_url,
      description,
      tutorId,
    ])
    res.status(201).json({ success: true, module: result.rows[0] })
  } catch (err) {
    console.error('Error uploading module:', err)
    res.status(500).json({ success: false, message: 'Server error uploading course module.' })
  }
}

// 9. Get course modules
exports.getCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params
    const result = await pool.query(
      'SELECT * FROM course_modules WHERE course_id = $1 ORDER BY week_number ASC',
      [courseId],
    )
    res.status(200).json({ success: true, modules: result.rows })
  } catch (err) {
    console.error('Error fetching modules:', err)
    res.status(500).json({ success: false, message: 'Server error fetching modules.' })
  }
}

// 10. Schedule Live Session
exports.scheduleLiveSession = async (req, res) => {
  try {
    const {
      course_id,
      title,
      session_type,
      meeting_link,
      scheduled_at,
      description,
    } = req.body
    const tutorId = req.user.id

    const query = `
      INSERT INTO live_sessions (course_id, title, session_type, meeting_link, scheduled_at, description, tutor_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `
    const result = await pool.query(query, [
      course_id,
      title,
      session_type || 'lecture',
      meeting_link,
      scheduled_at,
      description,
      tutorId,
    ])
    res.status(201).json({ success: true, session: result.rows[0] })
  } catch (err) {
    console.error('Error scheduling live session:', err)
    res.status(500).json({ success: false, message: 'Server error scheduling live session.' })
  }
}

// 11. Get Live Sessions
exports.getLiveSessions = async (req, res) => {
  try {
    const { courseId } = req.params
    const result = await pool.query(
      'SELECT * FROM live_sessions WHERE course_id = $1 ORDER BY scheduled_at ASC',
      [courseId],
    )
    res.status(200).json({ success: true, sessions: result.rows })
  } catch (err) {
    console.error('Error fetching sessions:', err)
    res.status(500).json({ success: false, message: 'Server error fetching live sessions.' })
  }
}

// 12. Student Roster & Cohort Tracking
exports.getCourseRoster = async (req, res) => {
  try {
    const { courseId } = req.params
    const query = `
      SELECT u.id, u.name, u.email, e.payment_status, e.created_at as enrollment_date,
             (SELECT COUNT(*) FROM student_submissions s JOIN assessments a ON s.assessment_id = a.id WHERE s.student_id = u.id AND a.course_id = $1) as submissions_count
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = $1
    `
    const result = await pool.query(query, [courseId])
    res.status(200).json({ success: true, roster: result.rows })
  } catch (err) {
    console.error('Error fetching roster:', err)
    res.status(500).json({ success: false, message: 'Server error fetching course roster.' })
  }
}

// 13. Advanced Project & Code Review Workflows
exports.submitIterativeFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params
    const { score, feedback, review_status } = req.body
    const tutorId = req.user.id

    const query = `
      UPDATE student_submissions 
      SET score = COALESCE($1, score),
          feedback = $2,
          status = COALESCE($3, status),
          graded_by = $4,
          graded_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `
    const result = await pool.query(query, [
      score,
      feedback,
      review_status || 'reviewed',
      tutorId,
      submissionId,
    ])
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' })
    }
    res.status(200).json({ success: true, submission: result.rows[0] })
  } catch (err) {
    console.error('Error submitting review:', err)
    res.status(500).json({ success: false, message: 'Server error updating repository review.' })
  }
}

// 14. Course-Specific Announcements
exports.createCourseAnnouncement = async (req, res) => {
  try {
    const { course_id, title, content } = req.body
    const tutorId = req.user.id

    const query = `
      INSERT INTO course_announcements (course_id, title, content, tutor_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `
    const result = await pool.query(query, [course_id, title, content, tutorId])
    res.status(201).json({ success: true, announcement: result.rows[0] })
  } catch (err) {
    console.error('Error creating course announcement:', err)
    res.status(500).json({ success: false, message: 'Server error creating announcement.' })
  }
}

// 15. Class Analytics & Performance Reports
exports.getClassAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params

    const statsQuery = `
      SELECT 
        AVG(s.score) as average_score,
        MAX(s.score) as highest_score,
        MIN(s.score) as lowest_score,
        COUNT(s.id) as total_submissions
      FROM student_submissions s
      JOIN assessments a ON s.assessment_id = a.id
      WHERE a.course_id = $1;
    `
    const statsResult = await pool.query(statsQuery, [courseId])

    const atRiskQuery = `
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN enrollments e ON u.id = e.user_id
      WHERE e.course_id = $1
      AND u.id NOT IN (
        SELECT DISTINCT s.student_id 
        FROM student_submissions s 
        JOIN assessments a ON s.assessment_id = a.id 
        WHERE a.course_id = $1
      );
    `
    const atRiskResult = await pool.query(atRiskQuery, [courseId])

    res.status(200).json({
      success: true,
      analytics: {
        summary: statsResult.rows[0],
        at_risk_students: atRiskResult.rows,
      },
    })
  } catch (err) {
    console.error('Error fetching analytics:', err)
    res.status(500).json({ success: false, message: 'Server error generating class analytics.' })
  }
}