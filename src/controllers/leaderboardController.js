// src/controllers/leaderboardController.js
const { query } = require('../config/db')

const getLeaderboard = async (req, res) => {
  try {
    const { limit = 20, page = 1, courseId } = req.query
    const limitVal = parseInt(limit)
    const offsetVal = (parseInt(page) - 1) * limitVal

    let queryText = `
      SELECT 
          u.id AS student_id,
          u.first_name,
          u.last_name,
          COUNT(sub.id) AS total_quizzes_taken,
          SUM(sub.score) AS total_marks_earned,
          SUM(a.total_marks) AS total_marks_possible,
          ROUND(
              (SUM(sub.score)::numeric / NULLIF(SUM(a.total_marks), 0)) * 100, 
              2
          ) AS percentage_score
      FROM users u
      JOIN student_submissions sub ON u.id = sub.student_id
      JOIN assessments a ON sub.assessment_id = a.id
      WHERE u.role = 'student'
    `

    const queryParams = []

    // Optional filter if you want to view leaderboard per course track
    if (courseId) {
      queryText += ` AND a.course_id = $1`
      queryParams.push(courseId)
    }

    queryText += `
      GROUP BY u.id, u.first_name, u.last_name
      HAVING SUM(a.total_marks) > 0
      ORDER BY percentage_score DESC, total_quizzes_taken DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limitVal, offsetVal)

    const result = await query(queryText, queryParams)

    // Add dynamic rank indexing to results
    const rankedData = result.rows.map((row, index) => ({
      rank: offsetVal + index + 1,
      studentId: row.student_id,
      name:
        `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
        'Anonymous Student',
      quizzesTaken: parseInt(row.total_quizzes_taken),
      percentageScore: parseFloat(row.percentage_score),
    }))

    res.status(200).json({
      success: true,
      count: rankedData.length,
      data: rankedData,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

module.exports = { getLeaderboard }
