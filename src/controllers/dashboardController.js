// //src/controllers/dashboardController.js
// const db = require('../config/db')

// /**
//  * @swagger
//  * /api/dashboard/overview:
//  *   get:
//  *     summary: Get complete student portal data across all tabs (with assigned tutors)
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student overview retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  */
// const getStudentOverview = async (req, res) => {
//   try {
//     const userId = req.user.id

//     // Fetch base user details, joined with enrollments to get profile metadata safely
//     const userResult = await db.query(
//       `SELECT u.id, u.name, u.email, u.is_verified, u.created_at,
//               e.first_name, e.middle_name, e.last_name, e.country, e.phone, e.reason, e.referred_by
//        FROM users u
//        LEFT JOIN enrollments e ON u.id = e.user_id
//        WHERE u.id = $1`,
//       [userId],
//     )
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found.' })
//     }
//     const user = userResult.rows[0]

//     // Fetch enrolled courses with tutor details
//     const enrollmentsResult = await db.query(
//       `SELECT e.id, e.course, e.total_amount, e.amount_paid, e.payment_status, e.reference, e.expires_at, e.created_at,
//               c.title as course_title, c.description as course_description,
//               u.name as tutor_name, u.email as tutor_email
//        FROM enrollments e
//        LEFT JOIN courses c ON e.course = c.title
//        LEFT JOIN users u ON c.tutor_id = u.id
//        WHERE e.user_id = $1 ORDER BY e.created_at DESC`,
//       [userId],
//     )

//     let announcements = []
//     try {
//       const annResult = await db.query(
//         'SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5',
//       )
//       announcements = annResult.rows
//     } catch (e) {
//       announcements = [
//         {
//           id: 1,
//           title: 'Welcome to D Enskill Academy!',
//           content: 'Orientation starts this weekend. Check your course tracks.',
//           created_at: new Date(),
//         },
//       ]
//     }

//     res.status(200).json({
//       status: 'success',
//       user,
//       courses: enrollmentsResult.rows,
//       payments: enrollmentsResult.rows,
//       announcements,
//     })
//   } catch (err) {
//     console.error('Dashboard Overview Error:', err.message)
//     res
//       .status(500)
//       .json({ error: 'Server error while fetching dashboard overview.' })
//   }
// }

// /**
//  * @swagger
//  * /api/dashboard/profile:
//  *   get:
//  *     summary: Get student profile details
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student profile retrieved successfully
//  */
// const getStudentProfile = async (req, res) => {
//   try {
//     const userId = req.user.id
//     // Also fetch enrollment metadata like country, phone, reason, and referredBy
//     const userResult = await db.query(
//       `SELECT u.id, u.name, u.email, u.is_verified, u.created_at,
//               e.first_name, e.middle_name, e.last_name, e.country, e.phone, e.reason, e.referred_by
//        FROM users u
//        LEFT JOIN enrollments e ON u.id = e.user_id
//        WHERE u.id = $1`,
//       [userId],
//     )
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found.' })
//     }
//     res.status(200).json({ status: 'success', user: userResult.rows[0] })
//   } catch (err) {
//     console.error('Profile Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching profile.' })
//   }
// }

// /**
//  * @swagger
//  * /api/dashboard/courses:
//  *   get:
//  *     summary: Get student enrolled courses with assigned tutors
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student courses retrieved successfully
//  */
// const getStudentCourses = async (req, res) => {
//   try {
//     const userId = req.user.id
//     const coursesResult = await db.query(
//       `SELECT e.id, e.course, e.payment_status, e.expires_at, e.created_at,
//               c.title as course_title, c.description as course_description,
//               u.name as tutor_name, u.email as tutor_email
//        FROM enrollments e
//        LEFT JOIN courses c ON e.course = c.title
//        LEFT JOIN users u ON c.tutor_id = u.id
//        WHERE e.user_id = $1 ORDER BY e.created_at DESC`,
//       [userId],
//     )
//     res.status(200).json({ status: 'success', courses: coursesResult.rows })
//   } catch (err) {
//     console.error('Courses Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching courses.' })
//   }
// }

// /**
//  * @swagger
//  * /api/dashboard/payments:
//  *   get:
//  *     summary: Get student payment history
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student payment history retrieved successfully
//  */
// const getStudentPayments = async (req, res) => {
//   try {
//     const userId = req.user.id
//     const paymentsResult = await db.query(
//       `SELECT id, course, total_amount, amount_paid, payment_status, reference, expires_at, created_at
//        FROM enrollments WHERE user_id = $1 ORDER BY created_at DESC`,
//       [userId],
//     )
//     res.status(200).json({ status: 'success', payments: paymentsResult.rows })
//   } catch (err) {
//     console.error('Payments Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching payments.' })
//   }
// }

// /**
//  * @swagger
//  * /api/dashboard/announcements:
//  *   get:
//  *     summary: Get portal announcements
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Announcements retrieved successfully
//  */
// const getStudentAnnouncements = async (req, res) => {
//   try {
//     let announcements = []
//     try {
//       const annResult = await db.query(
//         'SELECT * FROM announcements ORDER BY created_at DESC',
//       )
//       announcements = annResult.rows
//     } catch (e) {
//       announcements = [
//         {
//           id: 1,
//           title: 'Welcome to D Enskill Academy!',
//           content: 'Orientation starts this weekend. Check your course tracks.',
//           created_at: new Date(),
//         },
//       ]
//     }
//     res.status(200).json({ status: 'success', announcements })
//   } catch (err) {
//     console.error('Announcements Error:', err.message)
//     res
//       .status(500)
//       .json({ error: 'Server error while fetching announcements.' })
//   }
// }

// module.exports = {
//   getStudentOverview,
//   getStudentProfile,
//   getStudentCourses,
//   getStudentPayments,
//   getStudentAnnouncements,
// }


//src/controllers/dashboardController.js
const db = require('../config/db')

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get complete student portal data across all tabs (with assigned tutors)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student overview retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const getStudentOverview = async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch base user details, joined with enrollments to get profile metadata safely
    const userResult = await db.query(
      `SELECT u.id, u.name, u.email, u.is_verified, u.created_at,
              e.first_name, e.middle_name, e.last_name, e.country, e.phone, e.reason, e.referred_by
       FROM users u
       LEFT JOIN enrollments e ON u.id = e.user_id
       WHERE u.id = $1`,
      [userId],
    )
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }
    const user = userResult.rows[0]

    // Fetch enrolled courses with tutor details
    const enrollmentsResult = await db.query(
      `SELECT e.id, e.course, e.total_amount, e.amount_paid, e.payment_status, e.reference, e.expires_at, e.created_at,
              c.title as course_title, c.description as course_description,
              u.name as tutor_name, u.email as tutor_email
       FROM enrollments e
       LEFT JOIN courses c ON e.course = c.title
       LEFT JOIN users u ON c.tutor_id = u.id
       WHERE e.user_id = $1 ORDER BY e.created_at DESC`,
      [userId],
    )

    let announcements = []
    try {
      const annResult = await db.query(
        'SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5',
      )
      announcements = annResult.rows
    } catch (e) {
      announcements = [
        {
          id: 1,
          title: 'Welcome to D Enskill Academy!',
          content: 'Orientation starts this weekend. Check your course tracks.',
          created_at: new Date(),
        },
      ]
    }

    res.status(200).json({
      status: 'success',
      user,
      courses: enrollmentsResult.rows,
      payments: enrollmentsResult.rows,
      announcements,
    })
  } catch (err) {
    console.error('Dashboard Overview Error:', err.message)
    res
      .status(500)
      .json({ error: 'Server error while fetching dashboard overview.' })
  }
}

/**
 * @swagger
 * /api/dashboard/profile:
 *   get:
 *     summary: Get student profile details
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student profile retrieved successfully
 */
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id
    // Also fetch enrollment metadata like country, phone, reason, and referredBy
    const userResult = await db.query(
      `SELECT u.id, u.name, u.email, u.is_verified, u.created_at,
              e.first_name, e.middle_name, e.last_name, e.country, e.phone, e.reason, e.referred_by
       FROM users u
       LEFT JOIN enrollments e ON u.id = e.user_id
       WHERE u.id = $1`,
      [userId],
    )
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }
    res.status(200).json({ status: 'success', user: userResult.rows[0] })
  } catch (err) {
    console.error('Profile Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching profile.' })
  }
}

/**
 * @swagger
 * /api/dashboard/courses:
 *   get:
 *     summary: Get student enrolled courses with assigned tutors
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student courses retrieved successfully
 */
const getStudentCourses = async (req, res) => {
  try {
    const userId = req.user.id
    const coursesResult = await db.query(
      `SELECT e.id, e.course, e.payment_status, e.expires_at, e.created_at,
              c.title as course_title, c.description as course_description,
              u.name as tutor_name, u.email as tutor_email
       FROM enrollments e
       LEFT JOIN courses c ON e.course = c.title
       LEFT JOIN users u ON c.tutor_id = u.id
       WHERE e.user_id = $1 ORDER BY e.created_at DESC`,
      [userId],
    )
    res.status(200).json({ status: 'success', courses: coursesResult.rows })
  } catch (err) {
    console.error('Courses Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching courses.' })
  }
}

/**
 * @swagger
 * /api/dashboard/payments:
 *   get:
 *     summary: Get student payment history
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student payment history retrieved successfully
 */
const getStudentPayments = async (req, res) => {
  try {
    const userId = req.user.id
    const paymentsResult = await db.query(
      `SELECT id, course, total_amount, amount_paid, payment_status, reference, expires_at, created_at 
       FROM enrollments WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId],
    )
    res.status(200).json({ status: 'success', payments: paymentsResult.rows })
  } catch (err) {
    console.error('Payments Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching payments.' })
  }
}

/**
 * @swagger
 * /api/dashboard/announcements:
 *   get:
 *     summary: Get portal announcements
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Announcements retrieved successfully
 */
const getStudentAnnouncements = async (req, res) => {
  try {
    let announcements = []
    try {
      const annResult = await db.query(
        'SELECT * FROM announcements ORDER BY created_at DESC',
      )
      announcements = annResult.rows
    } catch (e) {
      announcements = [
        {
          id: 1,
          title: 'Welcome to D Enskill Academy!',
          content: 'Orientation starts this weekend. Check your course tracks.',
          created_at: new Date(),
        },
      ]
    }
    res.status(200).json({ status: 'success', announcements })
  } catch (err) {
    console.error('Announcements Error:', err.message)
    res
      .status(500)
      .json({ error: 'Server error while fetching announcements.' })
  }
}

/**
 * @swagger
 * /api/dashboard/assessments/{courseId}:
 *   get:
 *     summary: View published quizzes, assessments, and assignments for a course
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assessments retrieved successfully
 */
const getCourseAssessments = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id

    const query = `
      SELECT a.*, 
             s.status as submission_status, 
             s.score, 
             s.feedback, 
             s.submitted_at 
      FROM assessments a
      LEFT JOIN student_submissions s ON a.id = s.assessment_id AND s.student_id = $1
      WHERE a.course_id = $2
      ORDER BY a.created_at DESC;
    `
    const result = await db.query(query, [userId, courseId])
    res.status(200).json({ status: 'success', assessments: result.rows })
  } catch (err) {
    console.error('Course Assessments Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching course assessments.' })
  }
}

/**
 * @swagger
 * /api/dashboard/assessments/{assessmentId}/submit:
 *   post:
 *     summary: Submit quiz answers or assignment project links/files with deadline duration enforcement
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Assessment submitted successfully
 *       400:
 *         description: Submission deadline has passed
 */
const submitAssessmentContent = async (req, res) => {
  try {
    const { assessmentId } = req.params
    const { content } = req.body
    const userId = req.user.id

    // 1. Fetch assessment to verify due date / duration window
    const assessmentQuery = await db.query(
      'SELECT * FROM assessments WHERE id = $1',
      [assessmentId]
    )

    if (assessmentQuery.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found.' })
    }

    const assessment = assessmentQuery.rows[0]

    // 2. Strictly enforce submission deadline window
    if (assessment.due_date && new Date() > new Date(assessment.due_date)) {
      return res.status(400).json({
        success: false,
        error: 'Submission deadline has passed. You can no longer submit work for this assessment.',
      })
    }

    // 3. Upsert submission
    const query = `
      INSERT INTO student_submissions (assessment_id, student_id, content, status)
      VALUES ($1, $2, $3, 'submitted')
      ON CONFLICT (assessment_id, student_id) 
      DO UPDATE SET content = EXCLUDED.content, status = 'submitted', submitted_at = CURRENT_TIMESTAMP
      RETURNING *;
    `
    const result = await db.query(query, [assessmentId, userId, content])
    res.status(201).json({ status: 'success', submission: result.rows[0] })
  } catch (err) {
    console.error('Submit Assessment Error:', err.message)
    res.status(500).json({ error: 'Server error while submitting assessment.' })
  }
}

/**
 * @swagger
 * /api/dashboard/grades:
 *   get:
 *     summary: Fetch personal scores, attendance breakdown, and computed final aggregate status
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grades and attendance breakdown retrieved successfully
 */
const getStudentGradesAndAttendance = async (req, res) => {
  try {
    const userId = req.user.id

    const submissionsQuery = `
      SELECT s.*, a.title, a.type, a.weight, a.total_marks
      FROM student_submissions s
      JOIN assessments a ON s.assessment_id = a.id
      WHERE s.student_id = $1;
    `
    const submissionsResult = await db.query(submissionsQuery, [userId])

    const attendanceQuery = `
      SELECT course_id,
             COUNT(*) FILTER (WHERE status = 'present') as present_count,
             COUNT(*) as total_sessions
      FROM attendance_logs
      WHERE student_id = $1
      GROUP BY course_id;
    `
    const attendanceResult = await db.query(attendanceQuery, [userId])

    res.status(200).json({
      status: 'success',
      submissions: submissionsResult.rows,
      attendance: attendanceResult.rows
    })
  } catch (err) {
    console.error('Grades & Attendance Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching grades and attendance.' })
  }
}

/**
 * @swagger
 * /api/dashboard/modules/{courseId}:
 *   get:
 *     summary: View weekly lecture modules and downloadable resource files uploaded by tutor
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
const getStudentCourseModules = async (req, res) => {
  try {
    const { courseId } = req.params
    const result = await db.query(
      'SELECT * FROM course_modules WHERE course_id = $1 ORDER BY week_number ASC',
      [courseId]
    )
    res.status(200).json({ status: 'success', modules: result.rows })
  } catch (err) {
    console.error('Student Course Modules Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching course modules.' })
  }
}

/**
 * @swagger
 * /api/dashboard/sessions/{courseId}:
 *   get:
 *     summary: View scheduled live workshop sessions and video conference links for a course
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
const getStudentLiveSessions = async (req, res) => {
  try {
    const { courseId } = req.params
    const result = await db.query(
      'SELECT * FROM live_sessions WHERE course_id = $1 ORDER BY scheduled_at ASC',
      [courseId]
    )
    res.status(200).json({ status: 'success', sessions: result.rows })
  } catch (err) {
    console.error('Student Live Sessions Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching live sessions.' })
  }
}

module.exports = {
  getStudentOverview,
  getStudentProfile,
  getStudentCourses,
  getStudentPayments,
  getStudentAnnouncements,
  getCourseAssessments,
  submitAssessmentContent,
  getStudentGradesAndAttendance,
  getStudentCourseModules,
  getStudentLiveSessions,
}