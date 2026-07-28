const db = require('../config/db')

// 1. GET /api/admin/dashboard (Dashboard Metrics & Recent Enrollments)
const getAdminOverview = async (req, res) => {
  try {
    const studentCount = await db.query(
      'SELECT COUNT(*) FROM users WHERE role = $1',
      ['student'],
    )
    const revenueResult = await db.query(
      'SELECT SUM(amount_paid) AS total_revenue FROM enrollments',
    )
    const activeCourses = await db.query(
      'SELECT COUNT(DISTINCT course) FROM enrollments',
    )
    const recentEnrollments = await db.query(
      `SELECT e.id, u.name, e.course, e.amount_paid, e.payment_status, e.created_at 
       FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC LIMIT 5`,
    )

    res.status(200).json({
      status: 'success',
      metrics: {
        totalStudents: parseInt(studentCount.rows[0].count),
        totalRevenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
        activeCourses: parseInt(activeCourses.rows[0].count),
      },
      recentEnrollments: recentEnrollments.rows,
    })
  } catch (err) {
    console.error('Admin Overview Error:', err.message)
    res
      .status(500)
      .json({ error: 'Server error while fetching admin overview.' })
  }
}

// 2. GET /api/admin/students (Students Tab)
const getAllStudents = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, is_verified, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      ['student'],
    )
    res.status(200).json({ status: 'success', students: result.rows })
  } catch (err) {
    console.error('Admin Students Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching students.' })
  }
}

// 3. GET /api/admin/payments (Payments Tab)
const getAllPayments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.id, u.name as student_name, u.email, e.course, e.total_amount, e.amount_paid, 
              e.payment_status, e.reference, e.created_at 
       FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC`,
    )
    res.status(200).json({ status: 'success', payments: result.rows })
  } catch (err) {
    console.error('Admin Payments Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching payments.' })
  }
}

// 4. GET /api/admin/courses (Courses Tab)
const getAllCourses = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT course, COUNT(user_id) as enrolled_count FROM enrollments GROUP BY course',
    )
    res.status(200).json({ status: 'success', courses: result.rows })
  } catch (err) {
    console.error('Admin Courses Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching courses.' })
  }
}

// 5. Announcements (Announcements Tab)
const getAdminAnnouncements = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM announcements ORDER BY created_at DESC',
    )
    res.status(200).json({ status: 'success', announcements: result.rows })
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Server error while fetching announcements.' })
  }
}

const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' })
    }
    const result = await db.query(
      'INSERT INTO announcements (title, content) VALUES ($1, $2) RETURNING *',
      [title, content],
    )
    res.status(201).json({ status: 'success', announcement: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Server error while creating announcement.' })
  }
}

// 6. Instructors Tab Placeholder
const getInstructors = async (req, res) => {
  res.status(200).json({ status: 'success', instructors: [] })
}

// 7. Reports Tab Placeholder
const getReports = async (req, res) => {
  res
    .status(200)
    .json({
      status: 'success',
      reports: { summary: 'System performance normal' },
    })
}

// 8. Settings Tab Placeholder
const getSettings = async (req, res) => {
  res
    .status(200)
    .json({
      status: 'success',
      settings: { platform: 'D Enskill Academy', maintenanceMode: false },
    })
}

module.exports = {
  getAdminOverview,
  getAllStudents,
  getAllPayments,
  getAllCourses,
  getAdminAnnouncements,
  createAnnouncement,
  getInstructors,
  getReports,
  getSettings,
}
