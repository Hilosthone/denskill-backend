// // src/controllers/scholarship/scholarshipTutorController.js
// const db = require('../../config/db')

// /**
//  * @swagger
//  * /api/scholarship/tutor/students:
//  *   get:
//  *     summary: Get students assigned to scholarship cohort
//  *     tags: [Scholarship Tutor]
//  *     parameters:
//  *       - in: query
//  *         name: cohortId
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Students retrieved successfully
//  *       500:
//  *         description: Server error
//  */
// exports.getAssignedCohortStudents = async (req, res) => {
//   try {
//     const { cohortId } = req.query
//     let query = `SELECT id, first_name, last_name, email, phone, scholarship_status FROM users WHERE student_type = 'SCHOLARSHIP'`
//     let params = []

//     if (cohortId) {
//       query += ` AND cohort_id = $1`
//       params.push(cohortId)
//     }

//     const result = await db.query(query, params)
//     res.status(200).json({ success: true, students: result.rows })
//   } catch (error) {
//     console.error('Error fetching tutor students:', error)
//     res.status(500).json({ success: false, message: 'Server error' })
//   }
// }
