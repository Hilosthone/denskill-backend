// // src/controllers/tutorController.js
// const pool = require('../config/db')
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')

// // Helper to normalize route params like "fullstack-dev" back to "Full Stack Development"
// const normalizeCourseName = (courseParam) => {
//   if (!courseParam) return ''
//   const decoded = decodeURIComponent(courseParam).replace(/-/g, ' ').trim()
//   return decoded
// }

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

// // Fetch courses explicitly assigned to the logged-in tutor
// exports.getTutorCourses = async (req, res) => {
//   try {
//     const tutorId = req.user.id

//     // Adjust 'tutor_id' if your database column name differs (e.g., instructor_id)
//     const query = `
//       SELECT id, title, description, code, category
//       FROM courses
//       WHERE tutor_id = $1
//     `
//     const result = await pool.query(query, [tutorId])

//     res.status(200).json({
//       success: true,
//       courses: result.rows,
//     })
//   } catch (err) {
//     console.error('Error fetching tutor courses:', err)
//     res.status(500).json({
//       success: false,
//       message: 'Server error fetching assigned courses.',
//     })
//   }
// }

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
//           due_date = COALESCE($6, due_date),
//           updated_at = CURRENT_TIMESTAMP
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

// exports.logAttendance = async (req, res) => {
//   const client = await pool.connect()
//   try {
//     const { course_id, attendance_records } = req.body
//     const tutorId = req.user.id
//     const sessionDate = new Date().toISOString().split('T')[0]

//     if (!attendance_records || !Array.isArray(attendance_records)) {
//       return res.status(400).json({
//         success: false,
//         message: 'attendance_records must be a valid array.',
//       })
//     }

//     await client.query('BEGIN')

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
//       const result = await client.query(query, values)
//       savedLogs.push(result.rows[0])
//     }

//     await client.query('COMMIT')

//     res.status(200).json({
//       success: true,
//       message: 'Attendance logged successfully.',
//       logs: savedLogs,
//     })
//   } catch (err) {
//     await client.query('ROLLBACK')
//     console.error('Error logging attendance:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error logging attendance.' })
//   } finally {
//     client.release()
//   }
// }

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
//       content_type || 'video',
//       resource_url,
//       description,
//       tutorId,
//     ])
//     res.status(201).json({ success: true, module: result.rows[0] })
//   } catch (err) {
//     console.error('Error uploading module:', err)
//     res.status(500).json({
//       success: false,
//       message: 'Server error uploading course module.',
//     })
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
//     res.status(500).json({
//       success: false,
//       message: 'Server error scheduling live session.',
//     })
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

// exports.getCourseRoster = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const courseName = normalizeCourseName(courseId)

//     const query = `
//       SELECT u.id, u.name, u.email, e.payment_status, e.created_at as enrollment_date,
//              (SELECT COUNT(*) FROM student_submissions s JOIN assessments a ON s.assessment_id = a.id WHERE s.student_id = u.id AND LOWER(a.course_id) = LOWER($1)) as submissions_count
//       FROM enrollments e
//       JOIN users u ON e.user_id = u.id
//       WHERE LOWER(e.course) = LOWER($1) OR LOWER(e.course) = LOWER($2)
//     `
//     const result = await pool.query(query, [courseId, courseName])
//     res.status(200).json({ success: true, roster: result.rows })
//   } catch (err) {
//     console.error('Error fetching roster:', err)
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error fetching course roster.' })
//   }
// }

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
//     res.status(500).json({
//       success: false,
//       message: 'Server error updating repository review.',
//     })
//   }
// }

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

// exports.getClassAnalytics = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const courseName = normalizeCourseName(courseId)

//     const statsQuery = `
//       SELECT
//         AVG(s.score) as average_score,
//         MAX(s.score) as highest_score,
//         MIN(s.score) as lowest_score,
//         COUNT(s.id) as total_submissions
//       FROM student_submissions s
//       JOIN assessments a ON s.assessment_id = a.id
//       WHERE LOWER(a.course_id) = LOWER($1) OR LOWER(a.course_id) = LOWER($2);
//     `
//     const statsResult = await pool.query(statsQuery, [courseId, courseName])

//     const atRiskQuery = `
//       SELECT u.id, u.name, u.email
//       FROM users u
//       JOIN enrollments e ON u.id = e.user_id
//       WHERE (LOWER(e.course) = LOWER($1) OR LOWER(e.course) = LOWER($2))
//       AND u.id NOT IN (
//         SELECT DISTINCT s.student_id
//         FROM student_submissions s
//         JOIN assessments a ON s.assessment_id = a.id
//         WHERE LOWER(a.course_id) = LOWER($1) OR LOWER(a.course_id) = LOWER($2)
//       );
//     `
//     const atRiskResult = await pool.query(atRiskQuery, [courseId, courseName])

//     res.status(200).json({
//       success: true,
//       analytics: {
//         summary: statsResult.rows[0],
//         at_risk_students: atRiskResult.rows,
//       },
//     })
//   } catch (err) {
//     console.error('Error fetching analytics:', err)
//     res.status(500).json({
//       success: false,
//       message: 'Server error generating class analytics.',
//     })
//   }
// }

// // Updated to fetch ALL students (Normal & Scholarship) linked to the course/cohort via enrollments
// exports.getAssignedCohortStudents = async (req, res) => {
//   try {
//     const { cohortId } = req.query
    
//     let query = `
//       SELECT DISTINCT u.id, u.first_name, u.last_name, u.name, u.email, u.phone, u.scholarship_status, u.student_type
//       FROM users u
//       JOIN enrollments e ON u.id = e.user_id
//     `
//     let params = []

//     if (cohortId) {
//       query += ` WHERE e.course_id = $1 OR e.course = $1`
//       params.push(cohortId)
//     }

//     const result = await pool.query(query, params)
//     res.status(200).json({ success: true, students: result.rows })
//   } catch (error) {
//     console.error('Error fetching tutor students:', error)
//     res.status(500).json({ success: false, message: 'Server error fetching students.' })
//   }
// }



// src/controllers/tutorController.js
const pool = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

/**
 * HELPER: Normalize route params like "fullstack-dev" back to "Full Stack Development"
 */
const normalizeCourseName = (courseParam) => {
  if (!courseParam) return ''
  return decodeURIComponent(courseParam).replace(/-/g, ' ').trim()
}

/**
 * HELPER: Resolve course identifier (handles both numeric IDs / UUIDs and string slugs/names)
 * Prevents PostgreSQL type mismatch errors (e.g., passing "fullstack-dev" into an integer/UUID column).
 */
const resolveCourseId = async (client, courseIdentifier) => {
  if (!courseIdentifier) return null

  // If it's already a pure number, treat as ID
  if (!isNaN(courseIdentifier)) {
    return Number(courseIdentifier)
  }

  // Otherwise, attempt to look up the course by ID first, then by title/slug match
  const normalizedName = normalizeCourseName(courseIdentifier)
  const query = `
    SELECT id FROM courses 
    WHERE id::text = $1 
       OR LOWER(title) = LOWER($1) 
       OR LOWER(title) = LOWER($2) 
       OR LOWER(code) = LOWER($1)
    LIMIT 1;
  `
  const result = await client.query(query, [courseIdentifier, normalizedName])
  return result.rows.length > 0 ? result.rows[0].id : courseIdentifier
}

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

// Fetch courses explicitly assigned to the logged-in tutor
exports.getTutorCourses = async (req, res) => {
  try {
    const tutorId = req.user.id

    const query = `
      SELECT id, title, description, code, category, tutor_id 
      FROM courses 
      WHERE tutor_id = $1
    `
    const result = await pool.query(query, [tutorId])

    res.status(200).json({
      success: true,
      courses: result.rows,
    })
  } catch (err) {
    console.error('Error fetching tutor courses:', err)
    res.status(500).json({
      success: false,
      message: 'Server error fetching assigned courses.',
    })
  }
}

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

    // Resolve course_id in case a slug or name was passed from frontend params
    const resolvedCourseId = await resolveCourseId(pool, course_id)

    const query = `
      SELECT id FROM courses WHERE id = $1 AND tutor_id = $2
    `
    const courseCheck = await pool.query(query, [resolvedCourseId, tutorId])
    
    // Optional safety check: ensure tutor is assigned to this course (uncomment if strict enforcement is needed)
    /*
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You are not assigned to this course.' })
    }
    */

    const insertQuery = `
      SELECT * FROM assessments; -- placeholder check
    `
    const assessmentQuery = `
      INSERT INTO assessments (course_id, title, description, type, total_marks, weight, tutor_id, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `
    const values = [
      resolvedCourseId,
      title,
      description,
      type || 'assignment',
      total_marks || 100,
      weight || 0,
      tutorId, // Aligned with tutor_id across all tutor-created tables
      due_date || null,
    ]

    const result = await pool.query(assessmentQuery, values)
    res.status(201).json({ success: true, assessment: result.rows[0] })
  } catch (err) {
    console.error('Error creating assessment:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error creating assessment.' })
  }
}

exports.getAssessmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const resolvedId = await resolveCourseId(pool, courseId)

    const result = await pool.query(
      'SELECT * FROM assessments WHERE course_id = $1 ORDER BY created_at DESC',
      [resolvedId],
    )
    res.status(200).json({ success: true, assessments: result.rows })
  } catch (err) {
    console.error('Error fetching assessments:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching assessments.' })
  }
}

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

    const resolvedCourseId = await resolveCourseId(client, course_id)

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
        resolvedCourseId,
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
    const resolvedCourseId = await resolveCourseId(pool, course_id)

    const query = `
      INSERT INTO course_modules (course_id, title, week_number, content_type, resource_url, description, tutor_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `
    const result = await pool.query(query, [
      resolvedCourseId,
      title,
      week_number,
      content_type || 'video',
      resource_url,
      description,
      tutorId, // Aligned to tutor_id for consistency with admin & live sessions
    ])
    res.status(201).json({ success: true, module: result.rows[0] })
  } catch (err) {
    console.error('Error uploading module:', err)
    res.status(500).json({
      success: false,
      message: 'Server error uploading course module.',
    })
  }
}

exports.getCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params
    const resolvedId = await resolveCourseId(pool, courseId)

    const result = await pool.query(
      'SELECT * FROM course_modules WHERE course_id = $1 ORDER BY week_number ASC',
      [resolvedId],
    )
    res.status(200).json({ success: true, modules: result.rows })
  } catch (err) {
    console.error('Error fetching modules:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching modules.' })
  }
}

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
    const resolvedCourseId = await resolveCourseId(pool, course_id)

    const query = `
      INSERT INTO live_sessions (course_id, title, session_type, meeting_link, scheduled_at, description, tutor_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `
    const result = await pool.query(query, [
      resolvedCourseId,
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
    res.status(500).json({
      success: false,
      message: 'Server error scheduling live session.',
    })
  }
}

exports.getLiveSessions = async (req, res) => {
  try {
    const { courseId } = req.params
    const resolvedId = await resolveCourseId(pool, courseId)

    const result = await pool.query(
      'SELECT * FROM live_sessions WHERE course_id = $1 ORDER BY scheduled_at ASC',
      [resolvedId],
    )
    res.status(200).json({ success: true, sessions: result.rows })
  } catch (err) {
    console.error('Error fetching sessions:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching live sessions.' })
  }
}

exports.getCourseRoster = async (req, res) => {
  try {
    const { courseId } = req.params
    const courseName = normalizeCourseName(courseId)
    const resolvedId = await resolveCourseId(pool, courseId)

    const query = `
      SELECT DISTINCT u.id, u.name, u.email, e.payment_status, e.created_at as enrollment_date,
             (SELECT COUNT(*) FROM student_submissions s JOIN assessments a ON s.assessment_id = a.id WHERE s.student_id = u.id AND (a.course_id = $1 OR a.course_id::text = $2)) as submissions_count
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = $1 OR LOWER(e.course) = LOWER($2) OR LOWER(e.course) = LOWER($3)
    `
    const result = await pool.query(query, [resolvedId, courseId, courseName])
    res.status(200).json({ success: true, roster: result.rows })
  } catch (err) {
    console.error('Error fetching roster:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error fetching course roster.' })
  }
}

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
      return res
        .status(404)
        .json({ success: false, message: 'Submission not found.' })
    }
    res.status(200).json({ success: true, submission: result.rows[0] })
  } catch (err) {
    console.error('Error submitting review:', err)
    res.status(500).json({
      success: false,
      message: 'Server error updating repository review.',
    })
  }
}

exports.createCourseAnnouncement = async (req, res) => {
  try {
    const { course_id, title, content } = req.body
    const tutorId = req.user.id
    const resolvedCourseId = await resolveCourseId(pool, course_id)

    const query = `
      INSERT INTO course_announcements (course_id, title, content, tutor_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `
    const result = await pool.query(query, [resolvedCourseId, title, content, tutorId])
    res.status(201).json({ success: true, announcement: result.rows[0] })
  } catch (err) {
    console.error('Error creating course announcement:', err)
    res
      .status(500)
      .json({ success: false, message: 'Server error creating announcement.' })
  }
}

exports.getClassAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params
    const courseName = normalizeCourseName(courseId)
    const resolvedId = await resolveCourseId(pool, courseId)

    const statsQuery = `
      SELECT
        AVG(s.score) as average_score,
        MAX(s.score) as highest_score,
        MIN(s.score) as lowest_score,
        COUNT(s.id) as total_submissions
      FROM student_submissions s
      JOIN assessments a ON s.assessment_id = a.id
      WHERE a.course_id = $1 OR LOWER(a.course_id::text) = LOWER($2) OR LOWER(a.course_id::text) = LOWER($3);
    `
    const statsResult = await pool.query(statsQuery, [resolvedId, courseId, courseName])

    const atRiskQuery = `
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN enrollments e ON u.id = e.user_id
      WHERE (e.course_id = $1 OR LOWER(e.course) = LOWER($2) OR LOWER(e.course) = LOWER($3))
      AND u.id NOT IN (
        SELECT DISTINCT s.student_id
        FROM student_submissions s
        JOIN assessments a ON s.assessment_id = a.id
        WHERE a.course_id = $1 OR LOWER(a.course_id::text) = LOWER($2) OR LOWER(a.course_id::text) = LOWER($3)
      );
    `
    const atRiskResult = await pool.query(atRiskQuery, [resolvedId, courseId, courseName])

    res.status(200).json({
      success: true,
      analytics: {
        summary: statsResult.rows[0],
        at_risk_students: atRiskResult.rows,
      },
    })
  } catch (err) {
    console.error('Error fetching analytics:', err)
    res.status(500).json({
      success: false,
      message: 'Server error generating class analytics.',
    })
  }
}

exports.getAssignedCohortStudents = async (req, res) => {
  try {
    const { cohortId } = req.query
    const resolvedId = await resolveCourseId(pool, cohortId)
    const cohortName = normalizeCourseName(cohortId)

    let query = `
      SELECT DISTINCT u.id, u.first_name, u.last_name, u.name, u.email, u.phone, u.scholarship_status, u.student_type 
      FROM users u
      JOIN enrollments e ON u.id = e.user_id
    `
    let params = []

    if (cohortId) {
      query += ` WHERE e.course_id = $1 OR e.course_id::text = $2 OR LOWER(e.course) = LOWER($2) OR LOWER(e.course) = LOWER($3)`
      params = [resolvedId, cohortId, cohortName]
    }

    const result = await pool.query(query, params)
    res.status(200).json({ success: true, students: result.rows })
  } catch (error) {
     console.error('Error fetching tutor students:', error)
     res.status(500).json({ success: false, message: 'Server error fetching students.' })
  }
}