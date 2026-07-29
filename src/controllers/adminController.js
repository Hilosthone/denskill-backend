// const db = require('../config/db')

// // 1. GET /api/admin/dashboard (Dashboard Metrics & Recent Enrollments)
// const getAdminOverview = async (req, res) => {
//   try {
//     const studentCount = await db.query(
//       'SELECT COUNT(*) FROM users WHERE role = $1',
//       ['student'],
//     )
//     const revenueResult = await db.query(
//       'SELECT SUM(amount_paid) AS total_revenue FROM enrollments',
//     )
//     const activeCourses = await db.query(
//       'SELECT COUNT(DISTINCT course) FROM enrollments',
//     )
//     const recentEnrollments = await db.query(
//       `SELECT e.id, u.name, e.course, e.amount_paid, e.payment_status, e.created_at
//        FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC LIMIT 5`,
//     )

//     res.status(200).json({
//       status: 'success',
//       metrics: {
//         totalStudents: parseInt(studentCount.rows[0].count),
//         totalRevenue: parseFloat(revenueResult.rows[0].total_revenue || 0),
//         activeCourses: parseInt(activeCourses.rows[0].count),
//       },
//       recentEnrollments: recentEnrollments.rows,
//     })
//   } catch (err) {
//     console.error('Admin Overview Error:', err.message)
//     res
//       .status(500)
//       .json({ error: 'Server error while fetching admin overview.' })
//   }
// }

// // 2. GET /api/admin/students (Students Tab)
// const getAllStudents = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT id, name, email, is_verified, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
//       ['student'],
//     )
//     res.status(200).json({ status: 'success', students: result.rows })
//   } catch (err) {
//     console.error('Admin Students Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching students.' })
//   }
// }

// // 3. GET /api/admin/payments (Payments Tab)
// const getAllPayments = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT e.id, u.name as student_name, u.email, e.course, e.total_amount, e.amount_paid,
//               e.payment_status, e.reference, e.created_at
//        FROM enrollments e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC`,
//     )
//     res.status(200).json({ status: 'success', payments: result.rows })
//   } catch (err) {
//     console.error('Admin Payments Error:', err.message)
//     res.status(500).json({ error: 'Server error while fetching payments.' })
//   }
// }

// // 4. GET /api/admin/courses (Courses Tab)
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

// // 5. Announcements (Announcements Tab)
// const getAdminAnnouncements = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT * FROM announcements ORDER BY created_at DESC',
//     )
//     res.status(200).json({ status: 'success', announcements: result.rows })
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: 'Server error while fetching announcements.' })
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

// // 6. Instructors Tab Placeholder
// const getInstructors = async (req, res) => {
//   res.status(200).json({ status: 'success', instructors: [] })
// }

// // 7. Reports Tab Placeholder
// const getReports = async (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     reports: { summary: 'System performance normal' },
//   })
// }

// // 8. Settings Tab Placeholder
// const getSettings = async (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     settings: { platform: 'D Enskill Academy', maintenanceMode: false },
//   })
// }

// // PUT /api/admin/users/:id/freeze - Freeze or Unfreeze account
// const toggleFreezeStudent = async (req, res) => {
//   try {
//     const { id } = req.params
//     const { status } = req.body // e.g., 'frozen' or 'active'

//     const result = await db.query(
//       `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status`,
//       [status, id],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' })
//     }

//     res
//       .status(200)
//       .json({
//         message: `User account status updated to ${status}`,
//         user: result.rows[0],
//       })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }

// // DELETE /api/admin/users/:id - Delete student account
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

// // PUT /api/admin/courses/:courseId/assign-tutor - Assign Tutor to a Course
// const assignTutorToCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const { tutor_id } = req.body

//     const result = await db.query(
//       `UPDATE courses SET tutor_id = $1 WHERE id = $2 RETURNING *`,
//       [tutor_id, courseId],
//     )

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Course not found.' })
//     }

//     res
//       .status(200)
//       .json({ message: 'Tutor assigned successfully', course: result.rows[0] })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }

// /**
//  * @swagger
//  * /api/admin/courses/{courseId}/assign-tutor:
//  *   patch:
//  *     summary: Assign a tutor to a course
//  *     tags: [Admin]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               tutorId:
//  *                 type: integer
//  *     responses:
//  *       200:
//  *         description: Tutor assigned successfully
//  */
// const assignTutorToCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params
//     const { tutorId } = req.body

//     const courseResult = await db.query(
//       'UPDATE courses SET tutor_id = $1 WHERE id = $2 RETURNING *',
//       [tutorId, courseId]
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

// module.exports = {
//   getAdminOverview,
//   getAllStudents,
//   getAllPayments,
//   getAllCourses,
//   getAdminAnnouncements,
//   createAnnouncement,
//   getInstructors,
//   toggleFreezeStudent,
//   deleteStudentAccount,
//   assignTutorToCourse,
//   getReports,
//   getSettings,
// }

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

// 6. Instructors Tab (Fully Implemented)
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

const createInstructor = async (req, res) => {
  try {
    const { name, email, specialty, role } = req.body
    if (!name || !email || !specialty) {
      return res
        .status(400)
        .json({ error: 'Name, email, and specialty are required.' })
    }

    const result = await db.query(
      'INSERT INTO instructors (name, email, specialty, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, specialty, role || 'Instructor'],
    )

    res.status(201).json({
      status: 'success',
      message: 'Instructor created successfully.',
      instructor: result.rows[0],
    })
  } catch (err) {
    console.error('Create Instructor Error:', err.message)
    res.status(500).json({ error: 'Server error while creating instructor.' })
  }
}

const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, specialty, role } = req.body

    const result = await db.query(
      `UPDATE instructors 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           specialty = COALESCE($3, specialty), 
           role = COALESCE($4, role) 
       WHERE id = $5 RETURNING *`,
      [name, email, specialty, role, id],
    )

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

// 7. Reports Tab Placeholder
const getReports = async (req, res) => {
  res.status(200).json({
    status: 'success',
    reports: { summary: 'System performance normal' },
  })
}

// 8. Settings Tab Placeholder
const getSettings = async (req, res) => {
  res.status(200).json({
    status: 'success',
    settings: { platform: 'D Enskill Academy', maintenanceMode: false },
  })
}

// PUT /api/admin/users/:id/freeze - Freeze or Unfreeze account
const toggleFreezeStudent = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // e.g., 'frozen' or 'active'

    const result = await db.query(
      `UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status`,
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

// DELETE /api/admin/users/:id - Delete student account
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

/**
 * @swagger
 * /api/admin/courses/{courseId}/assign-tutor:
 *   patch:
 *     summary: Assign a tutor to a course
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tutorId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tutor assigned successfully
 */
const assignTutorToCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const { tutorId } = req.body

    const courseResult = await db.query(
      'UPDATE courses SET tutor_id = $1 WHERE id = $2 RETURNING *',
      [tutorId, courseId],
    )

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

module.exports = {
  getAdminOverview,
  getAllStudents,
  getAllPayments,
  getAllCourses,
  getAdminAnnouncements,
  createAnnouncement,
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  toggleFreezeStudent,
  deleteStudentAccount,
  assignTutorToCourse,
  getReports,
  getSettings,
}