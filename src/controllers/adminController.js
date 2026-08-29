// // src/controllers/adminController.js
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')
// const db = require('../config/db')

// // Helper: Generate Short-lived Access Token (15 minutes)
// const generateAccessToken = (admin) => {
//   return jwt.sign(
//     { id: admin.id, email: admin.email, role: admin.role },
//     process.env.JWT_SECRET || 'fallback_secret',
//     { expiresIn: '15m' },
//   )
// }

// // Helper: Generate Long-lived Refresh Token (7 days) & Store in DB
// const generateRefreshToken = async (admin) => {
//   const refreshToken = jwt.sign(
//     { id: admin.id, email: admin.email, role: admin.role },
//     process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
//     { expiresIn: '7d' },
//   )

//   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

//   await db.query(
//     `INSERT INTO refresh_tokens (user_id, token, expires_at)
//      VALUES ($1, $2, $3)`,
//     [admin.id, refreshToken, expiresAt],
//   )

//   return refreshToken
// }

// // @desc   Admin login
// // @route   POST /api/admin/auth/login
// // @access  Public
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     const ADMIN_EMAIL = 'lluxury692@gmail.com'
//     const ADMIN_PASS = 'admin@denskill123'

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Please provide email and password' })
//     }

//     if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'Invalid admin credentials' })
//     }

//     const adminUser = {
//       id: 0, // System Admin ID marker
//       email: ADMIN_EMAIL,
//       role: 'admin',
//     }

//     const accessToken = generateAccessToken(adminUser)
//     const refreshToken = await generateRefreshToken(adminUser)

//     return res.status(200).json({
//       success: true,
//       message: 'Admin logged in successfully',
//       accessToken,
//       refreshToken,
//       admin: {
//         name: 'System Admin',
//         email: ADMIN_EMAIL,
//         role: 'admin',
//       },
//     })
//   } catch (error) {
//     console.error('Admin login error:', error)
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error during admin login' })
//   }
// }

// // 1. GET /api/admin/dashboard (Unified Dashboard Metrics & Recent Enrollments)
// const getAdminOverview = async (req, res) => {
//   try {
//     const studentCount = await db.query(
//       'SELECT COUNT(*) FROM users WHERE role = $1 OR student_type = $2',
//       ['student', 'SCHOLARSHIP'],
//     )
//     const revenueResult = await db.query(
//       'SELECT SUM(amount_paid) AS total_revenue FROM enrollments',
//     )
//     const scholarshipRevenue = await db.query(
//       "SELECT SUM(amount) AS total_scholarship_revenue FROM scholarship_payments WHERE status = 'SUCCESS'",
//     )
//     const activeCourses = await db.query(
//       'SELECT COUNT(DISTINCT course) FROM enrollments',
//     )
//     const recentEnrollments = await db.query(
//       `SELECT e.id, u.first_name, u.last_name, e.course, e.amount_paid, e.payment_status, e.created_at
//        FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC LIMIT 5`,
//     )

//     const totalRev = parseFloat(revenueResult.rows[0].total_revenue || 0) +
//                      parseFloat(scholarshipRevenue.rows[0].total_scholarship_revenue || 0)

//     res.status(200).json({
//       status: 'success',
//       metrics: {
//         totalStudents: parseInt(studentCount.rows[0].count),
//         totalRevenue: totalRev,
//         activeCourses: parseInt(activeCourses.rows[0].count),
//       },
//       recentEnrollments: recentEnrollments.rows,
//     })
//   } catch (err) {
//     console.error('Admin Overview Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching admin overview.' })
//   }
// }

// // 2. GET /api/admin/students (Unified Students Tab - Regular & Scholarship)
// const getAllStudents = async (req, res) => {
//   try {
//     const { studentType, cohortId } = req.query
//     let query = `
//       SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.student_type, u.scholarship_status, u.cohort_id,
//              sc.name as cohort_name, sc.code as cohort_code, u.is_verified, u.created_at
//       FROM users u
//       LEFT JOIN scholarship_cohorts sc ON u.cohort_id = sc.id
//       WHERE u.role = 'student' OR u.student_type = 'SCHOLARSHIP'
//     `
//     let conditions = []
//     let params = []

//     if (studentType) {
//       params.push(studentType)
//       conditions.push(`u.student_type = $${params.length}`)
//     }
//     if (cohortId) {
//       params.push(cohortId)
//       conditions.push(`u.cohort_id = $${params.length}`)
//     }

//     if (conditions.length > 0) {
//       query += ` AND ` + conditions.join(' AND ')
//     }

//     query += ` ORDER BY u.created_at DESC`

//     const result = await db.query(query, params)
//     res.status(200).json({ status: 'success', count: result.rows.length, students: result.rows })
//   } catch (err) {
//     console.error('Admin Students Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching students.' })
//   }
// }

// // 3. POST /api/admin/enrollments/manual-onboard (Manual Student Onboarding)
// const manualOnboardStudent = async (req, res) => {
//   try {
//     const { firstName, middleName, lastName, country, phone, email, course, amountPaid, password, referredBy, reason } = req.body

//     if (!firstName || !lastName || !email || !course) {
//       return res.status(400).json({ success: false, message: 'First name, last name, email, and course are required.' })
//     }

//     // Check if user already exists
//     const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
//     let userId

//     const rawPassword = password || 'denskill123'
//     const hashedPassword = await bcrypt.hash(rawPassword, 10)

//     if (existingUser.rows.length > 0) {
//       userId = existingUser.rows[0].id
//     } else {
//       const userResult = await db.query(
//         `INSERT INTO users (first_name, middle_name, last_name, country, phone, email, password, role, student_type, is_verified)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, 'student', 'REGULAR', true) RETURNING id`,
//         [firstName, middleName || null, lastName, country || 'Nigeria', phone || null, email, hashedPassword]
//       )
//       userId = userResult.rows[0].id
//     }

//     // Create enrollment record
//     const enrollmentResult = await db.query(
//       `INSERT INTO enrollments (user_id, course, total_amount, amount_paid, payment_status, reference)
//        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//       [userId, course, amountPaid || 0, amountPaid || 0, 'COMPLETED', `MANUAL-${Date.now()}`]
//     )

//     return res.status(201).json({
//       success: true,
//       message: 'Student manually onboarded successfully.',
//       enrollment: enrollmentResult.rows[0],
//     })
//   } catch (err) {
//     console.error('Manual Onboard Error:', err.message)
//     return res.status(500).json({ success: false, error: 'Server error during manual student onboarding.' })
//   }
// }

// // 4. GET /api/admin/payments (Payments Tab)
// const getAllPayments = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT e.id, u.first_name, u.last_name, u.email, e.course, e.total_amount, e.amount_paid,
//               e.payment_status, e.reference, e.created_at
//        FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC`,
//     )
//     res.status(200).json({ status: 'success', payments: result.rows })
//   } catch (err) {
//     console.error('Admin Payments Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching payments.' })
//   }
// }

// // 5. GET /api/admin/courses (Courses Tab)
// const getAllCourses = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT course, COUNT(user_id) as enrolled_count FROM enrollments GROUP BY course',
//     )
//     res.status(200).json({ status: 'success', courses: result.rows })
//   } catch (err) {
//     console.error('Admin Courses Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching courses.' })
//   }
// }

// // 6. Announcements Tab
// const getAdminAnnouncements = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT * FROM announcements ORDER BY created_at DESC',
//     )
//     res.status(200).json({ status: 'success', announcements: result.rows })
//   } catch (err) {
//     res.status(500).json({ error: 'Server error while fetching announcements.' })
//   }
// }

// const createAnnouncement = async (req, res) => {
//   try {
//     const { title, content } = req.body
//     if (!title || !content) {
//       return res.status(400).json({ error: 'Title and content are required.' })
//     }
//     const result = await db.query(
//       'INSERT INTO announcements (title, content) VALUES ($1, $2) RETURNING *',
//       [title, content],
//     )
//     res.status(201).json({ status: 'success', announcement: result.rows[0] })
//   } catch (err) {
//     res.status(500).json({ error: 'Server error while creating announcement.' })
//   }
// }

// // 7. Instructors Tab
// const getInstructors = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT id, name, email, specialty, role, created_at FROM instructors ORDER BY created_at DESC',
//     )
//     res.status(200).json({ status: 'success', instructors: result.rows })
//   } catch (err) {
//     console.error('Get Instructors Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching instructors.' })
//   }
// }

// const createInstructor = async (req, res) => {
//   try {
//     const { name, email, specialty, role } = req.body
//     if (!name || !email || !specialty) {
//       return res.status(400).json({ error: 'Name, email, and specialty are required.' })
//     }

//     const result = await db.query(
//       'INSERT INTO instructors (name, email, specialty, role) VALUES ($1, $2, $3, $4) RETURNING *',
//       [name, email, specialty, role || 'Instructor'],
//     )

//     res.status(201).json({
//       status: 'success',
//       message: 'Instructor created successfully.',
//       instructor: result.rows[0],
//     })
//   } catch (err) {
//     console.error('Create Instructor Error:', err.message)
//     res.status(500).json({ error: 'Server error while creating instructor.' })
//   }
// }

// const updateInstructor = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { name, email, specialty, role } = req.body

//     const result = await db.query(
//       `UPDATE instructors
//        SET name = COALESCE($1, name),
//            email = COALESCE($2, email),
//            specialty = COALESCE($3, specialty),
//            role = COALESCE($4, role)
//        WHERE id = $5 RETURNING *`,
//       [name, email, specialty, role, id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Instructor not found.' })
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Instructor updated successfully.',
//       instructor: result.rows[0],
//     })
//   } catch (err) {
//     console.error('Update Instructor Error:', err.message)
//     res.status(500).json({ error: 'Server error while updating instructor.' })
//   }
// }

// const deleteInstructor = async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await db.query(
//       'DELETE FROM instructors WHERE id = $1 RETURNING id',
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Instructor not found.' })
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Instructor deleted successfully.',
//     })
//   } catch (err) {
//     console.error('Delete Instructor Error:', err.message)
//     res.status(500).json({ error: 'Server error while deleting instructor.' })
//   }
// }

// // 8. Reports Tab
// const getReports = async (req, res) => {
//   try {
//     const statsQuery = `
//       SELECT
//         (SELECT COUNT(*) FROM assessments) as total_assessments,
//         (SELECT COUNT(*) FROM student_submissions) as total_submissions,
//         (SELECT COUNT(*) FROM student_submissions WHERE status = 'graded') as total_graded,
//         (SELECT COUNT(*) FROM student_submissions WHERE status = 'submitted') as pending_grading;
//     `
//     const statsResult = await db.query(statsQuery)

//     const studentPerformanceQuery = `
//       SELECT
//         u.id as student_id,
//         u.first_name,
//         u.last_name,
//         u.email,
//         SUM((COALESCE(s.score, 0) / NULLIF(a.total_marks, 0)) * COALESCE(a.weight, 0)) as cumulative_score
//       FROM users u
//       JOIN student_submissions s ON u.id = s.student_id
//       JOIN assessments a ON s.assessment_id = a.id
//       WHERE s.status = 'graded'
//       GROUP BY u.id, u.first_name, u.last_name, u.email;
//     `
//     const performanceResult = await db.query(studentPerformanceQuery)

//     res.status(200).json({
//       status: 'success',
//       metrics: statsResult.rows[0],
//       student_aggregates: performanceResult.rows,
//     })
//   } catch (err) {
//     console.error('Grading Reports Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching grading reports.' })
//   }
// }

// // 9. Settings Tab
// const getSettings = async (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     settings: { platform: 'D Enskill Academy', maintenanceMode: false },
//   })
// }

// // Account Management Actions
// const toggleFreezeStudent = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { status } = req.body

//     const result = await db.query(
//       `UPDATE users SET scholarship_status = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, scholarship_status`,
//       [status, id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' })
//     }

//     res.status(200).json({
//       message: `User account status updated to ${status}`,
//       user: result.rows[0],
//     })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }

// const deleteStudentAccount = async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await db.query(
//       `DELETE FROM users WHERE id = $1 RETURNING id`,
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' })
//     }

//     res.status(200).json({ message: 'Student account deleted successfully' })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }

// const assignTutorToCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const { tutorId } = req.body

//     const courseResult = await db.query(
//       'UPDATE courses SET tutor_id = $1 WHERE id = $2 RETURNING *',
//       [tutorId, courseId],
//     )

//     if (courseResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Course not found.' })
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Tutor assigned to course successfully.',
//       course: courseResult.rows[0],
//     })
//   } catch (err) {
//     console.error('Assign Tutor Error:', err.message)
//     res.status(500).json({ error: 'Server error while assigning tutor.' })
//   }
// }

// // Grading & Attendance Supervisory Methods
// const executeGradeOverride = async (req, res) => {
//   try {
//     const { gradeId } = req.params
//     const { new_score, feedback } = req.body
//     const adminId = req.user ? req.user.id : 0

//     const query = `
//       UPDATE student_submissions
//       SET score = $1, feedback = CONCAT(COALESCE(feedback, ''), ' | [Admin Override ID: ', $2, '] - ', $3), graded_at = CURRENT_TIMESTAMP, status = 'graded'
//       WHERE id = $4
//       RETURNING *;
//     `
//     const result = await db.query(query, [
//       new_score,
//       adminId,
//       feedback || 'Grade adjusted by Admin',
//       gradeId,
//     ])

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Submission/Grade record not found.' })
//     }

//     res.status(200).json({ status: 'success', updated_submission: result.rows[0] })
//   } catch (err) {
//     console.error('Grade Override Error:', err.message)
//     res.status(500).json({ error: 'Server error executing grade override.' })
//   }
// }

// const getAttendanceOverview = async (req, res) => {
//   try {
//     const { courseId } = req.params

//     const query = `
//       SELECT
//         u.id as student_id,
//         u.first_name,
//         u.last_name,
//         u.email,
//         COUNT(a.id) as total_sessions_logged,
//         COUNT(a.id) FILTER (WHERE a.status = 'present') as present_count,
//         COUNT(a.id) FILTER (WHERE a.status = 'absent') as absent_count,
//         ROUND(
//           (COUNT(a.id) FILTER (WHERE a.status = 'present')::decimal / NULLIF(COUNT(a.id), 0)) * 100, 2
//         ) as attendance_percentage
//       FROM users u
//       JOIN attendance_logs a ON u.id = a.student_id
//       WHERE a.course_id = $1
//       GROUP BY u.id, u.first_name, u.last_name, u.email
//       ORDER BY attendance_percentage ASC;
//     `
//     const result = await db.query(query, [courseId])

//     res.status(200).json({
//       status: 'success',
//       course_id: courseId,
//       cohort_attendance: result.rows,
//     })
//   } catch (err) {
//     console.error('Attendance Overview Error:', err.message)
//     res.status(500).json({ error: 'Server error fetching attendance overview.' })
//   }
// }

// module.exports = {
//   adminLogin,
//   getAdminOverview,
//   getAllStudents,
//   manualOnboardStudent,
//   getAllPayments,
//   getAllCourses,
//   getAdminAnnouncements,
//   createAnnouncement,
//   getInstructors,
//   createInstructor,
//   updateInstructor,
//   deleteInstructor,
//   toggleFreezeStudent,
//   deleteStudentAccount,
//   assignTutorToCourse,
//   getReports,
//   getSettings,
//   executeGradeOverride,
//   getAttendanceOverview,
// }



// // src/controllers/adminController.js
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcryptjs')
// const db = require('../config/db')

// // Helper: Generate Short-lived Access Token (15 minutes)
// const generateAccessToken = (admin) => {
//   return jwt.sign(
//     { id: admin.id, email: admin.email, role: admin.role },
//     process.env.JWT_SECRET || 'fallback_secret',
//     { expiresIn: '15m' },
//   )
// }

// // Helper: Generate Long-lived Refresh Token (7 days) & Store in DB
// const generateRefreshToken = async (admin) => {
//   const refreshToken = jwt.sign(
//     { id: admin.id, email: admin.email, role: admin.role },
//     process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
//     { expiresIn: '7d' },
//   )

//   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

//   await db.query(
//     `INSERT INTO refresh_tokens (user_id, token, expires_at)
//      VALUES ($1, $2, $3)`,
//     [admin.id, refreshToken, expiresAt],
//   )

//   return refreshToken
// }

// // @desc   Admin login (Credentials loaded from environment variables)
// // @route   POST /api/admin/auth/login
// // @access  Public
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body

//     const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lluxury692@gmail.com'
//     const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin@denskill123'

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Please provide email and password' })
//     }

//     if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
//       return res
//         .status(401)
//         .json({ success: false, message: 'Invalid admin credentials' })
//     }

//     const adminUser = {
//       id: 0, // System Admin ID marker
//       email: ADMIN_EMAIL,
//       role: 'admin',
//     }

//     const accessToken = generateAccessToken(adminUser)
//     const refreshToken = await generateRefreshToken(adminUser)

//     return res.status(200).json({
//       success: true,
//       message: 'Admin logged in successfully',
//       accessToken,
//       refreshToken,
//       admin: {
//         name: 'System Admin',
//         email: ADMIN_EMAIL,
//         role: 'admin',
//       },
//     })
//   } catch (error) {
//     console.error('Admin login error:', error)
//     return res
//       .status(500)
//       .json({ success: false, message: 'Server error during admin login' })
//   }
// }

// // 1. GET /api/admin/dashboard (Unified Dashboard Metrics & Recent Enrollments)
// const getAdminOverview = async (req, res) => {
//   try {
//     const studentCount = await db.query(
//       'SELECT COUNT(*) FROM users WHERE role = $1 OR student_type = $2',
//       ['student', 'SCHOLARSHIP'],
//     )
//     const revenueResult = await db.query(
//       'SELECT SUM(amount_paid) AS total_revenue FROM enrollments',
//     )
//     const scholarshipRevenue = await db.query(
//       "SELECT SUM(amount) AS total_scholarship_revenue FROM scholarship_payments WHERE status = 'SUCCESS'",
//     )
//     const activeCourses = await db.query(
//       'SELECT COUNT(DISTINCT course) FROM enrollments',
//     )
//     const recentEnrollments = await db.query(
//       `SELECT e.id, u.first_name, u.last_name, e.course, e.amount_paid, e.payment_status, e.created_at
//        FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC LIMIT 5`,
//     )

//     const totalRev = parseFloat(revenueResult.rows[0].total_revenue || 0) +
//                      parseFloat(scholarshipRevenue.rows[0].total_scholarship_revenue || 0)

//     res.status(200).json({
//       status: 'success',
//       metrics: {
//         totalStudents: parseInt(studentCount.rows[0].count),
//         totalRevenue: totalRev,
//         activeCourses: parseInt(activeCourses.rows[0].count),
//       },
//       recentEnrollments: recentEnrollments.rows,
//     })
//   } catch (err) {
//     console.error('Admin Overview Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching admin overview...' })
//   }
// }

// // 2. GET /api/admin/students (Unified Students Tab - Regular & Scholarship)
// const getAllStudents = async (req, res) => {
//   try {
//     const { studentType, cohortId } = req.query
//     let query = `
//       SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.student_type, u.scholarship_status, u.cohort_id,
//              sc.name as cohort_name, sc.code as cohort_code, u.is_verified, u.created_at
//       FROM users u
//       LEFT JOIN scholarship_cohorts sc ON u.cohort_id = sc.id
//       WHERE u.role = 'student' OR u.student_type = 'SCHOLARSHIP'
//     `
//     let conditions = []
//     let params = []

//     if (studentType) {
//       params.push(studentType)
//       conditions.push(`u.student_type = $${params.length}`)
//     }
//     if (cohortId) {
//       params.push(cohortId)
//       conditions.push(`u.cohort_id = $${params.length}`)
//     }

//     if (conditions.length > 0) {
//       query += ` AND ` + conditions.join(' AND ')
//     }

//     query += ` ORDER BY u.created_at DESC`

//     const result = await db.query(query, params)
//     res.status(200).json({ status: 'success', count: result.rows.length, students: result.rows })
//   } catch (err) {
//     console.error('Admin Students Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching students.' })
//   }
// }

// // 3. POST /api/admin/enrollments/manual-onboard (Manual Student Onboarding)
// const manualOnboardStudent = async (req, res) => {
//   try {
//     const { firstName, middleName, lastName, country, phone, email, course, amountPaid, password, referredBy, reason } = req.body

//     if (!firstName || !lastName || !email || !course) {
//       return res.status(400).json({ success: false, message: 'First name, last name, email, and course are required.' })
//     }

//     const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
//     let userId

//     const rawPassword = password || 'denskill123'
//     const hashedPassword = await bcrypt.hash(rawPassword, 10)

//     if (existingUser.rows.length > 0) {
//       userId = existingUser.rows[0].id
//     } else {
//       const userResult = await db.query(
//         `INSERT INTO users (first_name, middle_name, last_name, country, phone, email, password, role, student_type, is_verified)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, 'student', 'REGULAR', true) RETURNING id`,
//         [firstName, middleName || null, lastName, country || 'Nigeria', phone || null, email, hashedPassword]
//       )
//       userId = userResult.rows[0].id
//     }

//     const enrollmentResult = await db.query(
//       `INSERT INTO enrollments (user_id, course, total_amount, amount_paid, payment_status, reference)
//        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//       [userId, course, amountPaid || 0, amountPaid || 0, 'COMPLETED', `MANUAL-${Date.now()}`]
//     )

//     return res.status(201).json({
//       success: true,
//       message: 'Student manually onboarded successfully.',
//       enrollment: enrollmentResult.rows[0],
//     })
//   } catch (err) {
//     console.error('Manual Onboard Error:', err.message)
//     return res.status(500).json({ success: false, error: 'Server error during manual student onboarding.' })
//   }
// }

// // 4. GET /api/admin/payments (Payments Tab)
// const getAllPayments = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT e.id, u.first_name, u.last_name, u.email, e.course, e.total_amount, e.amount_paid,
//               e.payment_status, e.reference, e.created_at
//        FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC`,
//     )
//     res.status(200).json({ status: 'success', payments: result.rows })
//   } catch (err) {
//     console.error('Admin Payments Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching payments.' })
//   }
// }

// // 5. GET /api/admin/courses (Courses Tab)
// const getAllCourses = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT course, COUNT(user_id) as enrolled_count FROM enrollments GROUP BY course',
//     )
//     res.status(200).json({ status: 'success', courses: result.rows })
//   } catch (err) {
//     console.error('Admin Courses Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching courses.' })
//   }
// }

// // 6. Announcements Tab
// const getAdminAnnouncements = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT * FROM announcements ORDER BY created_at DESC',
//     )
//     res.status(200).json({ status: 'success', announcements: result.rows })
//   } catch (err) {
//     res.status(500).json({ error: 'Server error while fetching announcements.' })
//   }
// }

// const createAnnouncement = async (req, res) => {
//   try {
//     const { title, content } = req.body
//     if (!title || !content) {
//       return res.status(400).json({ error: 'Title and content are required.' })
//     }
//     const result = await db.query(
//       'INSERT INTO announcements (title, content) VALUES ($1, $2) RETURNING *',
//       [title, content],
//     )
//     res.status(201).json({ status: 'success', announcement: result.rows[0] })
//   } catch (err) {
//     res.status(500).json({ error: 'Server error while creating announcement.' })
//   }
// }

// // 7. Instructors / Tutors Tab
// const getInstructors = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT id, name, email, specialty, role, created_at FROM instructors ORDER BY created_at DESC',
//     )
//     res.status(200).json({ status: 'success', instructors: result.rows })
//   } catch (err) {
//     console.error('Get Instructors Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching instructors.' })
//   }
// }

// const createInstructor = async (req, res) => {
//   try {
//     const { name, email, specialty, role, password } = req.body
//     if (!name || !email || !specialty) {
//       return res.status(400).json({ error: 'Name, email, and specialty are required.' })
//     }

//     const rawPassword = password || 'tutor123!'
//     const hashedPassword = await bcrypt.hash(rawPassword, 10)

//     const result = await db.query(
//       'INSERT INTO instructors (name, email, specialty, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, specialty, role, created_at',
//       [name, email, specialty, role || 'Instructor', hashedPassword],
//     )

//     res.status(201).json({
//       status: 'success',
//       message: 'Instructor/Tutor created successfully with login credentials.',
//       instructor: result.rows[0],
//       assignedPassword: rawPassword // Returned so admin can share it with the tutor if generated automatically
//     })
//   } catch (err) {
//     console.error('Create Instructor Error:', err.message)
//     res.status(500).json({ error: 'Server error while creating instructor.' })
//   }
// }

// const updateInstructor = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { name, email, specialty, role, password } = req.body

//     let queryParams = [name, email, specialty, role, id]
//     let updateQuery = `
//       UPDATE instructors
//       SET name = COALESCE($1, name),
//           email = COALESCE($2, email),
//           specialty = COALESCE($3, specialty),
//           role = COALESCE($4, role)
//     `

//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10)
//       updateQuery += `, password = $5 WHERE id = $6 RETURNING id, name, email, specialty, role, created_at`
//       queryParams = [name, email, specialty, role, hashedPassword, id]
//     } else {
//       updateQuery += ` WHERE id = $5 RETURNING id, name, email, specialty, role, created_at`
//     }

//     const result = await db.query(updateQuery, queryParams)

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Instructor not found.' })
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Instructor updated successfully.',
//       instructor: result.rows[0],
//     })
//   } catch (err) {
//     console.error('Update Instructor Error:', err.message)
//     res.status(500).json({ error: 'Server error while updating instructor.' })
//   }
// }

// const deleteInstructor = async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await db.query(
//       'DELETE FROM instructors WHERE id = $1 RETURNING id',
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Instructor not found.' })
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Instructor deleted successfully.',
//     })
//   } catch (err) {
//     console.error('Delete Instructor Error:', err.message)
//     res.status(500).json({ error: 'Server error while deleting instructor.' })
//   }
// }

// // 8. Reports Tab
// const getReports = async (req, res) => {
//   try {
//     const statsQuery = `
//       SELECT
//         (SELECT COUNT(*) FROM assessments) as total_assessments,
//         (SELECT COUNT(*) FROM student_submissions) as total_submissions,
//         (SELECT COUNT(*) FROM student_submissions WHERE status = 'graded') as total_graded,
//         (SELECT COUNT(*) FROM student_submissions WHERE status = 'submitted') as pending_grading;
//     `
//     const statsResult = await db.query(statsQuery)

//     const studentPerformanceQuery = `
//       SELECT
//         u.id as student_id,
//         u.first_name,
//         u.last_name,
//         u.email,
//         SUM((COALESCE(s.score, 0) / NULLIF(a.total_marks, 0)) * COALESCE(a.weight, 0)) as cumulative_score
//       FROM users u
//       JOIN student_submissions s ON u.id = s.student_id
//       JOIN assessments a ON s.assessment_id = a.id
//       WHERE s.status = 'graded'
//       GROUP BY u.id, u.first_name, u.last_name, u.email;
//     `
//     const performanceResult = await db.query(studentPerformanceQuery)

//     res.status(200).json({
//       status: 'success',
//       metrics: statsResult.rows[0],
//       student_aggregates: performanceResult.rows,
//     })
//   } catch (err) {
//     console.error('Grading Reports Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching grading reports.' })
//   }
// }

// // 9. Settings Tab
// const getSettings = async (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     settings: { platform: 'D Enskill Academy', maintenanceMode: false },
//   })
// }

// // Account Management Actions
// const toggleFreezeStudent = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { status } = req.body

//     const result = await db.query(
//       `UPDATE users SET scholarship_status = $1 WHERE id = $2 RETURNING id, first_name, last_name, email, scholarship_status`,
//       [status, id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' })
//     }

//     res.status(200).json({
//       message: `User account status updated to ${status}`,
//       user: result.rows[0],
//     })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }

// const deleteStudentAccount = async (req, res) => {
//   try {
//     const { id } = req.params
//     const result = await db.query(
//       `DELETE FROM users WHERE id = $1 RETURNING id`,
//       [id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' })
//     }

//     res.status(200).json({ message: 'Student account deleted successfully' })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }

// const assignTutorToCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const { tutorId } = req.body

//     const courseResult = await db.query(
//       'UPDATE courses SET tutor_id = $1 WHERE id = $2 RETURNING *',
//       [tutorId, courseId],
//     )

//     if (courseResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Course not found.' })
//     }

//     res.status(200).json({
//       status: 'success',
//       message: 'Tutor assigned to course successfully.',
//       course: courseResult.rows[0],
//     })
//   } catch (err) {
//     console.error('Assign Tutor Error:', err.message)
//     res.status(500).json({ error: 'Server error while assigning tutor.' })
//   }
// }

// // Grading & Attendance Supervisory Methods
// const executeGradeOverride = async (req, res) => {
//   try {
//     const { gradeId } = req.params
//     const { new_score, feedback } = req.body
//     const adminId = req.user ? req.user.id : 0

//     const query = `
//       UPDATE student_submissions
//       SET score = $1, feedback = CONCAT(COALESCE(feedback, ''), ' | [Admin Override ID: ', $2, '] - ', $3), graded_at = CURRENT_TIMESTAMP, status = 'graded'
//       WHERE id = $4
//       RETURNING *;
//     `
//     const result = await db.query(query, [
//       new_score,
//       adminId,
//       feedback || 'Grade adjusted by Admin',
//       gradeId,
//     ])

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Submission/Grade record not found.' })
//     }

//     res.status(200).json({ status: 'success', updated_submission: result.rows[0] })
//   } catch (err) {
//     console.error('Grade Override Error:', err.message)
//     res.status(500).json({ error: 'Server error executing grade override.' })
//   }
// }

// const getAttendanceOverview = async (req, res) => {
//   try {
//     const { courseId } = req.params

//     const query = `
//       SELECT
//         u.id as student_id,
//         u.first_name,
//         u.last_name,
//         u.email,
//         COUNT(a.id) as total_sessions_logged,
//         COUNT(a.id) FILTER (WHERE a.status = 'present') as present_count,
//         COUNT(a.id) FILTER (WHERE a.status = 'absent') as absent_count,
//         ROUND(
//           (COUNT(a.id) FILTER (WHERE a.status = 'present')::decimal / NULLIF(COUNT(a.id), 0)) * 100, 2
//         ) as attendance_percentage
//       FROM users u
//       JOIN attendance_logs a ON u.id = a.student_id
//       WHERE a.course_id = $1
//       GROUP BY u.id, u.first_name, u.last_name, u.email
//       ORDER BY attendance_percentage ASC;
//     `
//     const result = await db.query(query, [courseId])

//     res.status(200).json({
//       status: 'success',
//       course_id: courseId,
//       cohort_attendance: result.rows,
//     })
//   } catch (err) {
//     console.error('Attendance Overview Error:', err.message)
//     res.status(500).json({ error: 'Server error fetching attendance overview.' })
//   }
// }

// module.exports = {
//   adminLogin,
//   getAdminOverview,
//   getAllStudents,
//   manualOnboardStudent,
//   getAllPayments,
//   getAllCourses,
//   getAdminAnnouncements,
//   createAnnouncement,
//   getInstructors,
//   createInstructor,
//   updateInstructor,
//   deleteInstructor,
//   toggleFreezeStudent,
//   deleteStudentAccount,
//   assignTutorToCourse,
//   getReports,
//   getSettings,
//   executeGradeOverride,
//   getAttendanceOverview,
// }
















// src/controllers/adminController.js
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../config/db')
const emailService = require('../services/emailService')

// Helper: Normalize route params like "fullstack-dev" back to "Full Stack Development"
const normalizeCourseName = (courseParam) => {
  if (!courseParam) return ''
  const decoded = decodeURIComponent(courseParam).replace(/-/g, ' ').trim()
  return decoded
}

// Helper: Generate Short-lived Access Token (15 minutes)
const generateAccessToken = (admin) => {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '15m' },
  )
}

// Helper: Generate Long-lived Refresh Token (7 days) & Store in DB
const generateRefreshToken = async (admin) => {
  const refreshToken = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' },
  )

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at) 
     VALUES ($1, $2, $3)`,
    [admin.id, refreshToken, expiresAt],
  )

  return refreshToken
}

// @desc   Admin login (Credentials loaded from environment variables)
// @route   POST /api/admin/auth/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lluxury692@gmail.com'
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin@denskill123'

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide email and password' })
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid admin credentials' })
    }

    const adminUser = {
      id: 0, // System Admin ID marker
      email: ADMIN_EMAIL,
      role: 'admin',
    }

    const accessToken = generateAccessToken(adminUser)
    const refreshToken = await generateRefreshToken(adminUser)

    return res.status(200).json({
      success: true,
      message: 'Admin logged in successfully',
      accessToken,
      refreshToken,
      admin: {
        name: 'System Admin',
        email: ADMIN_EMAIL,
        role: 'admin',
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Server error during admin login' })
  }
}

// 1. GET /api/admin/dashboard (Unified Dashboard Metrics & Recent Enrollments)
const getAdminOverview = async (req, res) => {
  try {
    const studentCount = await db.query(
      'SELECT COUNT(*) FROM users WHERE role = $1 OR student_type = $2',
      ['student', 'SCHOLARSHIP'],
    )
    const revenueResult = await db.query(
      'SELECT SUM(amount_paid) AS total_revenue FROM enrollments',
    )
    const scholarshipRevenue = await db.query(
      "SELECT SUM(amount) AS total_scholarship_revenue FROM scholarship_payments WHERE status = 'SUCCESS'",
    )
    const activeCourses = await db.query(
      'SELECT COUNT(DISTINCT course) FROM enrollments',
    )
    
    // Updated query to include total_amount and calculated outstanding balance for recent activity
    const recentEnrollments = await db.query(
      `SELECT 
         e.id, 
         u.first_name, 
         u.middle_name, 
         u.last_name, 
         e.course, 
         e.total_amount, 
         e.amount_paid, 
         e.payment_status, 
         COALESCE(e.total_amount, 0) - COALESCE(e.amount_paid, 0) AS outstanding_balance,
         e.created_at 
       FROM enrollments e 
       JOIN users u ON e.user_id = u.id 
       ORDER BY e.created_at DESC 
       LIMIT 5`,
    )

    const totalRev = parseFloat(revenueResult.rows[0].total_revenue || 0) + 
                     parseFloat(scholarshipRevenue.rows[0].total_scholarship_revenue || 0)

    res.status(200).json({
      status: 'success',
      metrics: {
        totalStudents: parseInt(studentCount.rows[0].count),
        totalRevenue: totalRev,
        activeCourses: parseInt(activeCourses.rows[0].count),
      },
      recentEnrollments: recentEnrollments.rows,
    })
  } catch (err) {
    console.error('Admin Overview Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching admin overview...' })
  }
}

// 2. GET /api/admin/students (Unified Students Tab - Regular & Scholarship with Outstanding Balance Calculation)
const getAllStudents = async (req, res) => {
  try {
    const { studentType, cohortId } = req.query
    let query = `
      SELECT 
        u.id, 
        u.first_name,
        u.middle_name,
        u.last_name,
        u.country,
        u.password,
        TRIM(CONCAT(u.first_name, ' ', COALESCE(u.middle_name, ''), ' ', u.last_name)) AS name,
        u.email, 
        u.phone, 
        u.student_type, 
        u.scholarship_status, 
        u.cohort_id, 
        sc.name as cohort_name, 
        sc.code as cohort_code, 
        u.is_verified, 
        u.created_at,
        e.id as enrollment_id,
        e.course,
        e.reason,
        e.referred_by,
        e.total_amount,
        e.amount_paid,
        e.payment_status,
        e.reference,
        COALESCE(e.total_amount, 0) - COALESCE(e.amount_paid, 0) AS outstanding_balance
      FROM users u
      LEFT JOIN scholarship_cohorts sc ON u.cohort_id = sc.id
      LEFT JOIN enrollments e ON u.id = e.user_id
      WHERE u.role = 'student' OR u.student_type = 'SCHOLARSHIP'
    `
    let conditions = []
    let params = []

    if (studentType) {
      params.push(studentType)
      conditions.push(`u.student_type = $${params.length}`)
    }
    if (cohortId) {
      params.push(cohortId)
      conditions.push(`u.cohort_id = $${params.length}`)
    }

    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(' AND ')
    }

    query += ` ORDER BY u.created_at DESC`

    const result = await db.query(query, params)
    res.status(200).json({ status: 'success', count: result.rows.length, students: result.rows })
  } catch (err) {
    console.error('Admin Students Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching students.' })
  }
}

// 3. POST /api/admin/enrollments/manual-onboard (Manual Student Onboarding with Accurate Pricing & Scholarship Support)
const manualOnboardStudent = async (req, res) => {
  try {
    const { 
      firstName, 
      middleName, 
      lastName, 
      country, 
      phone, 
      email, 
      course, 
      amountPaid, 
      password, 
      referredBy, 
      reason,
      studentType = 'REGULAR' // Accepts 'REGULAR' or 'SCHOLARSHIP'
    } = req.body

    if (!firstName || !lastName || !email || !course) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, and course are required.' })
    }

    // 1. Define standard course prices matching your frontend PROGRAMMES list
    const coursePrices = {
      'Frontend Development': 80000,
      'Backend Development': 80000,
      'Full Stack Development': 200000,
      'Mobile Development': 100000,
      'Cybersecurity': 100000,
      'Data Science': 80000,
      'Data Analysis': 80000,
      'Product Design (UI/UX)': 80000,
      'Product Management': 80000,
      'Web3 and Blockchain Development': 200000,
      'AI / Machine Learning': 200000,
      'Graphics Design': 0, // Free
    }

    const standardPrice = coursePrices[course] ?? 80000

    // 2. Compute true total amount (Scholarship students pay 20% of the price)
    const totalAmount = studentType === 'SCHOLARSHIP' ? standardPrice * 0.20 : standardPrice
    const paidNum = Number(amountPaid) || 0

    // 3. Determine correct payment status dynamically
    let paymentStatus = 'PENDING'
    if (paidNum >= totalAmount && totalAmount > 0) {
      paymentStatus = 'COMPLETED'
    } else if (paidNum > 0) {
      paymentStatus = 'PARTIAL' // Correctly flags installments like 20k out of 80k as partial
    } else if (totalAmount === 0) {
      paymentStatus = 'COMPLETED' // For free courses like Graphics Design
    }

    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email])
    let userId

    const rawPassword = password || 'denskill123'
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id
      // Optional: Update user type if they were onboarded differently before
      await db.query('UPDATE users SET student_type = $1 WHERE id = $2', [studentType, userId])
    } else {
      const userResult = await db.query(
        `INSERT INTO users (first_name, middle_name, last_name, country, phone, email, password, role, student_type, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'student', $8, true) RETURNING id`,
        [firstName, middleName || null, lastName, country || 'Nigeria', phone || null, email, hashedPassword, studentType]
      )
      userId = userResult.rows[0].id
    }

    const enrollmentResult = await db.query(
      `INSERT INTO enrollments (user_id, first_name, middle_name, last_name, country, phone, email, course, reason, referred_by, total_amount, amount_paid, payment_status, reference) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        userId, 
        firstName, 
        middleName || null, 
        lastName, 
        country || 'Nigeria', 
        phone || null, 
        email, 
        course, 
        reason || null, 
        referredBy || null, 
        totalAmount,        // Now stores the real course total (e.g. 80000) instead of amount paid
        paidNum,            // Stores what they actually paid (e.g. 20000)
        paymentStatus,      // Correctly saved as 'PARTIAL' instead of forcing 'COMPLETED'
        `MANUAL-${Date.now()}`
      ]
    )

    return res.status(201).json({
      success: true,
      message: 'Student manually onboarded successfully with accurate pricing tracking.',
      enrollment: enrollmentResult.rows[0],
      balance_outstanding: totalAmount - paidNum,
    })
  } catch (err) {
    console.error('Manual Onboard Error:', err.message)
    return res.status(500).json({ success: false, error: 'Server error during manual student onboarding.' })
  }
}

// 4. GET /api/admin/payments (Payments Tab)
const getAllPayments = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.id, u.first_name, u.middle_name, u.last_name, u.email, e.course, e.total_amount, e.amount_paid, 
              e.payment_status, e.reference, e.created_at 
       FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC`,
    )
    res.status(200).json({ status: 'success', payments: result.rows })
  } catch (err) {
    console.error('Admin Payments Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching payments.' })
  }
}

// 5. GET /api/admin/courses (Courses Tab)
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

// 6. @desc    Get all announcements for admin view
// @route   GET /api/admin/announcements
const getAdminAnnouncements = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, title, message AS content, target, priority, created_at FROM announcements ORDER BY created_at DESC',
    )
    res.status(200).json({ status: 'success', announcements: result.rows })
  } catch (err) {
    console.error('Get Admin Announcements Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching announcements.' })
  }
}

// @desc    Create and broadcast an announcement
// @route   POST /api/admin/announcements
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, message, target, priority } = req.body
    const announcementText = content || message

    if (!title || !announcementText) {
      return res.status(400).json({ error: 'Title and content are required.' })
    }

    const result = await db.query(
      `INSERT INTO announcements (title, message, target, priority) 
       VALUES ($1, $2, $3, $4) RETURNING id, title, message AS content, target, priority, created_at`,
      [title, announcementText, target || 'all', priority || 'normal'],
    )

    res.status(201).json({
      status: 'success',
      message: 'Announcement created and broadcasted successfully.',
      announcement: result.rows[0],
    })
  } catch (err) {
    console.error('Create Announcement Error:', err.message)
    res.status(500).json({ error: 'Server error while creating announcement.' })
  }
}

// @desc    Update an announcement
// @route   PUT /api/admin/announcements/:id
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, message, target, priority } = req.body
    const announcementText = content || message

    const result = await db.query(
      `UPDATE announcements 
       SET title = COALESCE(NULLIF($1, ''), title), 
           message = COALESCE(NULLIF($2, ''), message),
           target = COALESCE(NULLIF($3, ''), target),
           priority = COALESCE(NULLIF($4, ''), priority)
       WHERE id = $5 RETURNING id, title, message AS content, target, priority, created_at`,
      [title, announcementText, target, priority, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found.' })
    }

    res.status(200).json({
      status: 'success',
      message: 'Announcement updated successfully.',
      announcement: result.rows[0],
    })
  } catch (err) {
    console.error('Update Announcement Error:', err.message)
    res.status(500).json({ error: 'Server error while updating announcement.' })
  }
}

// @desc    Delete an announcement
// @route   DELETE /api/admin/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      'DELETE FROM announcements WHERE id = $1 RETURNING id',
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found.' })
    }

    res.status(200).json({
      status: 'success',
      message: 'Announcement deleted successfully.',
    })
  } catch (err) {
    console.error('Delete Announcement Error:', err.message)
    res.status(500).json({ error: 'Server error while deleting announcement.' })
  }
}

// ==========================================
// 7. INSTRUCTORS / TUTORS MANAGEMENT BLOCK
// Grouped completely together: Fetch, Create, Update, Delete & Course Assignment
// ==========================================

// @desc   Fetch all registered instructors/tutors
// @route  GET /api/admin/instructors
const getInstructors = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, specialty, role, created_at FROM instructors ORDER BY created_at DESC',
    )
    res.status(200).json({ status: 'success', instructors: result.rows })
  } catch (err) {
    console.error('Get Instructors Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching instructors.' })
  }
}

// @desc   Create a new instructor/tutor with optional credential generation
// @route  POST /api/admin/instructors
const createInstructor = async (req, res) => {
  try {
    const { name, email, specialty, role, password } = req.body
    if (!name || !email || !specialty) {
      return res.status(400).json({ error: 'Name, email, and specialty are required.' })
    }

    const rawPassword = password || 'tutor123!'
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    const result = await db.query(
      'INSERT INTO instructors (name, email, specialty, role, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, specialty, role, created_at',
      [name, email, specialty, role || 'Instructor', hashedPassword],
    )

    res.status(201).json({
      status: 'success',
      message: 'Instructor/Tutor created successfully with login credentials.',
      instructor: result.rows[0],
      assignedPassword: rawPassword 
    })
  } catch (err) {
    console.error('Create Instructor Error:', err.message)
    res.status(500).json({ error: 'Server error while creating instructor.' })
  }
}

// @desc   Update existing instructor/tutor details
// @route  PUT /api/admin/instructors/:id
const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, specialty, role, password } = req.body

    let queryParams = [name, email, specialty, role, id]
    let updateQuery = `
      UPDATE instructors 
      SET name = COALESCE($1, name), 
          email = COALESCE($2, email), 
          specialty = COALESCE($3, specialty), 
          role = COALESCE($4, role)
    `

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateQuery += `, password = $5 WHERE id = $6 RETURNING id, name, email, specialty, role, created_at`
      queryParams = [name, email, specialty, role, hashedPassword, id]
    } else {
      updateQuery += ` WHERE id = $5 RETURNING id, name, email, specialty, role, created_at`
    }

    const result = await db.query(updateQuery, queryParams)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instructor not found.' })
    }

    res.status(200).json({
      status: 'success',
      message: 'Instructor updated successfully.',
      instructor: result.rows[0],
    })
  } catch (err) {
    console.error('Update Instructor Error:', err.message)
    res.status(500).json({ error: 'Server error while updating instructor.' })
  }
}

// @desc   Delete an instructor/tutor record
// @route  DELETE /api/admin/instructors/:id
const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      'DELETE FROM instructors WHERE id = $1 RETURNING id',
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Instructor not found.' })
    }

    res.status(200).json({
      status: 'success',
      message: 'Instructor deleted successfully.',
    })
  } catch (err) {
    console.error('Delete Instructor Error:', err.message)
    res.status(500).json({ error: 'Server error while deleting instructor.' })
  }
}

// @desc   Assign a tutor/instructor to a course (handles both tutorId and instructorId parameters seamlessly)
// @route  PUT /api/admin/courses/:courseId/assign-tutor
const assignTutorToCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    // Support both tutorId or instructorId payload names seamlessly
    const tutorId = req.body.tutorId || req.body.instructorId
    const courseName = normalizeCourseName(courseId)

    if (!tutorId) {
      return res.status(400).json({ error: 'tutorId or instructorId is required.' })
    }

    let courseResult
    if (!isNaN(courseId)) {
      courseResult = await db.query(
        'UPDATE courses SET tutor_id = $1 WHERE id = $2 RETURNING *',
        [tutorId, courseId],
      )
    }

    if (!courseResult || courseResult.rows.length === 0) {
      courseResult = await db.query(
        'UPDATE courses SET tutor_id = $1 WHERE LOWER(name) = LOWER($2) OR LOWER(name) = LOWER($3) RETURNING *',
        [tutorId, courseId, courseName],
      )
    }

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found.' })
    }

    res.status(200).json({
      status: 'success',
      message: 'Tutor assigned to course successfully.',
      course: courseResult.rows[0],
    })
  } catch (err) {
    console.error('Assign Tutor Error:', err.message)
    res.status(500).json({ error: 'Server error while assigning tutor.' })
  }
}

// ==========================================
// 8. Reports Tab
// ==========================================
const getReports = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM assessments) as total_assessments,
        (SELECT COUNT(*) FROM student_submissions) as total_submissions,
        (SELECT COUNT(*) FROM student_submissions WHERE status = 'graded') as total_graded,
        (SELECT COUNT(*) FROM student_submissions WHERE status = 'submitted') as pending_grading;
    `
    const statsResult = await db.query(statsQuery)

    const studentPerformanceQuery = `
      SELECT 
        u.id as student_id,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.email,
        SUM((COALESCE(s.score, 0) / NULLIF(a.total_marks, 0)) * COALESCE(a.weight, 0)) as cumulative_score
      FROM users u
      JOIN student_submissions s ON u.id = s.student_id
      JOIN assessments a ON s.assessment_id = a.id
      WHERE s.status = 'graded'
      GROUP BY u.id, u.first_name, u.middle_name, u.last_name, u.email;
    `
    const performanceResult = await db.query(studentPerformanceQuery)

    res.status(200).json({
      status: 'success',
      metrics: statsResult.rows[0],
      student_aggregates: performanceResult.rows,
    })
  } catch (err) {
    console.error('Grading Reports Error:', err.message)
    res.status(500).json({ error: 'Server error while fetching grading reports.' })
  }
}

// 9. Settings Tab
const getSettings = async (req, res) => {
  res.status(200).json({
    status: 'success',
    settings: { platform: 'D Enskill Academy', maintenanceMode: false },
  })
}

// Account Management Actions
const toggleFreezeStudent = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const result = await db.query(
      `UPDATE users SET scholarship_status = $1 WHERE id = $2 RETURNING id, first_name, middle_name, last_name, email, scholarship_status`,
      [status, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({
      message: `User account status updated to ${status}`,
      user: result.rows[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const deleteStudentAccount = async (req, res) => {
  try {
    const { id } = req.params
    const result = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json({ message: 'Student account deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Grading & Attendance Supervisory Methods
const executeGradeOverride = async (req, res) => {
  try {
    const { gradeId } = req.params
    const { new_score, feedback } = req.body
    const adminId = req.user ? req.user.id : 0

    const query = `
      UPDATE student_submissions 
      SET score = $1, feedback = CONCAT(COALESCE(feedback, ''), ' | [Admin Override ID: ', $2, '] - ', $3), graded_at = CURRENT_TIMESTAMP, status = 'graded'
      WHERE id = $4
      RETURNING *;
    `
    const result = await db.query(query, [
      new_score,
      adminId,
      feedback || 'Grade adjusted by Admin',
      gradeId,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Submission/Grade record not found.' })
    }

    res.status(200).json({ status: 'success', updated_submission: result.rows[0] })
  } catch (err) {
    console.error('Grade Override Error:', err.message)
    res.status(500).json({ error: 'Server error executing grade override.' })
  }
}

const getAttendanceOverview = async (req, res) => {
  try {
    const { courseId } = req.params
    const courseName = normalizeCourseName(courseId)

    const query = `
      SELECT 
        u.id as student_id,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.email,
        COUNT(a.id) as total_sessions_logged,
        COUNT(a.id) FILTER (WHERE a.status = 'present') as present_count,
        COUNT(a.id) FILTER (WHERE a.status = 'absent') as absent_count,
        ROUND(
          (COUNT(a.id) FILTER (WHERE a.status = 'present')::decimal / NULLIF(COUNT(a.id), 0)) * 100, 2
        ) as attendance_percentage
      FROM users u
      JOIN attendance_logs a ON u.id = a.student_id
      WHERE LOWER(a.course_id) = LOWER($1) OR LOWER(a.course_id) = LOWER($2)
      GROUP BY u.id, u.first_name, u.middle_name, u.last_name, u.email
      ORDER BY attendance_percentage ASC;
    `
    const result = await db.query(query, [courseId, courseName])

    res.status(200).json({
      status: 'success',
      course_id: courseId,
      cohort_attendance: result.rows,
    })
  } catch (err) {
    console.error('Attendance Overview Error:', err.message)
    res
      .status(500)
      .json({ error: 'Server error fetching attendance overview.' })
  }
}

// Admin Direct Email Dispatch Method
const sendDirectEmailToUsers = async (req, res) => {
  try {
    const { emails, subject, message, html, attachments, cc, bcc } = req.body

    // Validation checks (must have recipients, subject, and either plain text or HTML content)
    if (!emails || !subject || (!message && !html)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient emails, subject, and message content (or HTML).',
      })
    }

    // Normalize emails safely into an array, filtering out empty values or trailing commas
    const recipientList = Array.isArray(emails)
      ? emails.filter(Boolean)
      : emails.split(',').map((email) => email.trim()).filter(Boolean)

    // Payload configuration for the email service
    const emailPayload = {
      to: recipientList,
      subject,
      text: message,       // Plain text fallback
      html: html || message, // Renders full HTML links, formatting, images if provided
      attachments: attachments || [], // Array of attachment objects (filename, content/path)
      cc: cc || undefined,
      bcc: bcc || undefined,
    }

    // Call the service
    const result = await emailService.sendCustomAdminEmail(emailPayload)

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to deliver emails via Resend.',
        error: result.error,
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Email(s) successfully sent with all assets and attachments!',
      data: result.data,
    })
  } catch (error) {
    console.error('Admin Email Controller Error:', error)
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error while sending email.' })
  }
}

module.exports = {
  adminLogin,
  getAdminOverview,
  getAllStudents,
  manualOnboardStudent,
  getAllPayments,
  getAllCourses,
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement, 
  deleteAnnouncement, 
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  toggleFreezeStudent,
  deleteStudentAccount,
  assignTutorToCourse,
  getReports,
  getSettings,
  executeGradeOverride,
  getAttendanceOverview,
  sendDirectEmailToUsers,
}