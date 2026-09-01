// // src/controllers/leaderboardController.js
// const { query } = require('../config/db')

// const getLeaderboard = async (req, res) => {
//   try {
//     const { limit = 20, page = 1, courseId } = req.query
//     const limitVal = parseInt(limit)
//     const offsetVal = (parseInt(page) - 1) * limitVal

//     let queryText = `
//       SELECT
//           u.id AS student_id,
//           u.first_name,
//           u.last_name,
//           COUNT(sub.id) AS total_quizzes_taken,
//           SUM(sub.score) AS total_marks_earned,
//           SUM(a.total_marks) AS total_marks_possible,
//           ROUND(
//               (SUM(sub.score)::numeric / NULLIF(SUM(a.total_marks), 0)) * 100,
//               2
//           ) AS percentage_score
//       FROM users u
//       JOIN student_submissions sub ON u.id = sub.student_id
//       JOIN assessments a ON sub.assessment_id = a.id
//       WHERE u.role = 'student'
//     `

//     const queryParams = []

//     // Optional filter if you want to view leaderboard per course track
//     if (courseId) {
//       queryText += ` AND a.course_id = $1`
//       queryParams.push(courseId)
//     }

//     queryText += `
//       GROUP BY u.id, u.first_name, u.last_name
//       HAVING SUM(a.total_marks) > 0
//       ORDER BY percentage_score DESC, total_quizzes_taken DESC
//       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
//     `

//     queryParams.push(limitVal, offsetVal)

//     const result = await query(queryText, queryParams)

//     // Add dynamic rank indexing to results
//     const rankedData = result.rows.map((row, index) => ({
//       rank: offsetVal + index + 1,
//       studentId: row.student_id,
//       name:
//         `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
//         'Anonymous Student',
//       quizzesTaken: parseInt(row.total_quizzes_taken),
//       percentageScore: parseFloat(row.percentage_score),
//     }))

//     res.status(200).json({
//       success: true,
//       count: rankedData.length,
//       data: rankedData,
//     })
//   } catch (error) {
//     console.error('Error fetching leaderboard:', error.message)
//     res.status(500).json({ success: false, error: 'Internal server error' })
//   }
// }

// module.exports = { getLeaderboard }



// src/controllers/leaderboardController.js
const pool = require('../config/db')

const normalizeCourseName = (courseParam) => {
  if (!courseParam) return ''
  return decodeURIComponent(courseParam).replace(/-/g, ' ').trim()
}

const resolveCourseId = async (client, courseIdentifier) => {
  if (!courseIdentifier) return null
  if (!isNaN(courseIdentifier)) {
    return Number(courseIdentifier)
  }
  const normalizedName = normalizeCourseName(courseIdentifier)
  const query = `
    SELECT id FROM courses 
    WHERE id::text = $1 
       OR LOWER(title) = LOWER($1) 
       OR LOWER(title) = LOWER($2) 
       OR LOWER(REPLACE(title, ' ', '-')) = LOWER($1)
    LIMIT 1;
  `
  const result = await client.query(query, [courseIdentifier, normalizedName])
  return result.rows.length > 0 ? result.rows[0].id : courseIdentifier
}

// 1. Get global or course-specific leaderboard with search and pagination
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 20, page = 1, courseId, search } = req.query
    const limitVal = parseInt(limit)
    const offsetVal = (parseInt(page) - 1) * limitVal

    const resolvedCourseId = await resolveCourseId(pool, courseId)
    const courseName = normalizeCourseName(courseId)

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

    if (courseId) {
      queryParams.push(resolvedCourseId, courseId, courseName)
      queryText += ` AND (a.course_id = $${queryParams.length - 2} OR a.course_id::text = $${queryParams.length - 1} OR LOWER(a.course_id::text) = LOWER($${queryParams.length - 1}) OR LOWER(a.course_id::text) = LOWER($${queryParams.length}))`
    }

    if (search) {
      queryParams.push(`%${search.toLowerCase()}%`)
      queryText += ` AND (LOWER(u.first_name) LIKE $${queryParams.length} OR LOWER(u.last_name) LIKE $${queryParams.length} OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE $${queryParams.length})`
    }

    queryText += `
      GROUP BY u.id, u.first_name, u.last_name
      HAVING SUM(a.total_marks) > 0
      ORDER BY percentage_score DESC, total_quizzes_taken DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limitVal, offsetVal)

    const result = await pool.query(queryText, queryParams)

    const rankedData = result.rows.map((row, index) => ({
      rank: offsetVal + index + 1,
      studentId: row.student_id,
      name:
        `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
        'Anonymous Student',
      quizzesTaken: parseInt(row.total_quizzes_taken),
      percentageScore: parseFloat(row.percentage_score),
    }))

    return res.status(200).json({
      success: true,
      count: rankedData.length,
      data: rankedData,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// 2. Get the authenticated student's own rank and score profile
const getMyRank = async (req, res) => {
  try {
    const studentId = req.user.id
    const { courseId } = req.query

    const resolvedCourseId = await resolveCourseId(pool, courseId)
    const courseName = normalizeCourseName(courseId)

    // Subquery to rank all students, then select the logged-in student's position
    let rankingSubQuery = `
      SELECT 
          u.id AS student_id,
          ROUND(
              (SUM(sub.score)::numeric / NULLIF(SUM(a.total_marks), 0)) * 100, 
              2
          ) AS percentage_score,
          ROW_NUMBER() OVER (ORDER BY ROUND((SUM(sub.score)::numeric / NULLIF(SUM(a.total_marks), 0)) * 100, 2) DESC) AS calculated_rank
      FROM users u
      JOIN student_submissions sub ON u.id = sub.student_id
      JOIN assessments a ON sub.assessment_id = a.id
      WHERE u.role = 'student'
    `

    const queryParams = [studentId]

    if (courseId) {
      queryParams.push(resolvedCourseId, courseId, courseName)
      rankingSubQuery += ` AND (a.course_id = $2 OR a.course_id::text = $3 OR LOWER(a.course_id::text) = LOWER($3) OR LOWER(a.course_id::text) = LOWER($4))`
    }

    rankingSubQuery += ` GROUP BY u.id HAVING SUM(a.total_marks) > 0`

    const finalQuery = `
      SELECT * FROM (${rankingSubQuery}) ranked_users
      WHERE student_id = $1;
    `

    const result = await pool.query(finalQuery, queryParams)

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No ranking data found for your account yet. Complete quizzes to get ranked!',
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        rank: parseInt(result.rows[0].calculated_rank),
        percentageScore: parseFloat(result.rows[0].percentage_score),
      },
    })
  } catch (error) {
    console.error('Error fetching student rank:', error.message)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// 3. Get Top Performers (Podium - Top 3) for dashboard widgets
const getTopPerformers = async (req, res) => {
  try {
    const { courseId } = req.query
    const resolvedCourseId = await resolveCourseId(pool, courseId)
    const courseName = normalizeCourseName(courseId)

    let queryText = `
      SELECT 
          u.id AS student_id,
          u.first_name,
          u.last_name,
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

    if (courseId) {
      queryParams.push(resolvedCourseId, courseId, courseName)
      queryText += ` AND (a.course_id = $1 OR a.course_id::text = $2 OR LOWER(a.course_id::text) = LOWER($2) OR LOWER(a.course_id::text) = LOWER($3))`
    }

    queryText += `
      GROUP BY u.id, u.first_name, u.last_name
      HAVING SUM(a.total_marks) > 0
      ORDER BY percentage_score DESC
      LIMIT 3;
    `

    const result = await pool.query(queryText, queryParams)

    const podium = result.rows.map((row, index) => ({
      medal: index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze',
      rank: index + 1,
      studentId: row.student_id,
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Anonymous',
      percentageScore: parseFloat(row.percentage_score),
    }))

    return res.status(200).json({
      success: true,
      data: podium,
    })
  } catch (error) {
    console.error('Error fetching podium:', error.message)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

module.exports = { getLeaderboard, getMyRank, getTopPerformers }