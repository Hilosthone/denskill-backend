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

    const userResult = await db.query(
      'SELECT id, name, email, is_verified, created_at FROM users WHERE id = $1',
      [userId],
    )
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }
    const user = userResult.rows[0]

    // Updated to join courses and instructors/tutors
    const enrollmentsResult = await db.query(
      `SELECT e.id, e.course, e.total_amount, e.amount_paid, e.payment_status, e.reference, e.expires_at, e.created_at,
              c.title as course_title, c.description as course_description,
              u.name as tutor_name, u.email as tutor_email
       FROM enrollments e
       LEFT JOIN courses c ON e.course_id = c.id
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
    const userResult = await db.query(
      'SELECT id, name, email, is_verified, created_at FROM users WHERE id = $1',
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
       LEFT JOIN courses c ON e.course_id = c.id
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

module.exports = {
  getStudentOverview,
  getStudentProfile,
  getStudentCourses,
  getStudentPayments,
  getStudentAnnouncements,
}