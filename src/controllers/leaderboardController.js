// // src/controllers/leaderboardController.js
// const pool = require('../config/db')

// const normalizeCourseName = (courseParam) => {
//   if (!courseParam) return ''
//   return decodeURIComponent(courseParam).replace(/-/g, ' ').trim()
// }

// const resolveCourseId = async (client, courseIdentifier) => {
//   if (!courseIdentifier) return null
//   if (!isNaN(courseIdentifier)) {
//     return Number(courseIdentifier)
//   }
//   const normalizedName = normalizeCourseName(courseIdentifier)
//   const query = `
//     SELECT id FROM courses 
//     WHERE id::text = $1 
//        OR LOWER(title) = LOWER($1) 
//        OR LOWER(title) = LOWER($2) 
//        OR LOWER(REPLACE(title, ' ', '-')) = LOWER($1)
//     LIMIT 1;
//   `
//   const result = await client.query(query, [courseIdentifier, normalizedName])
//   return result.rows.length > 0 ? result.rows[0].id : courseIdentifier
// }

// // 1. Get global or course-specific leaderboard with search and pagination
// const getLeaderboard = async (req, res) => {
//   try {
//     const { limit = 20, page = 1, courseId, search } = req.query
//     const limitVal = parseInt(limit)
//     const offsetVal = (parseInt(page) - 1) * limitVal

//     const resolvedCourseId = await resolveCourseId(pool, courseId)
//     const courseName = normalizeCourseName(courseId)

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
//       WHERE LOWER(u.role) = 'student'
//     `

//     const queryParams = []

//     if (courseId) {
//       queryParams.push(resolvedCourseId, courseId, courseName)
//       queryText += ` AND (a.course_id = $${queryParams.length - 2} OR a.course_id::text = $${queryParams.length - 1} OR LOWER(a.course_id::text) = LOWER($${queryParams.length - 1}) OR LOWER(a.course_id::text) = LOWER($${queryParams.length}))`
//     }

//     if (search) {
//       queryParams.push(`%${search.toLowerCase()}%`)
//       queryText += ` AND (LOWER(u.first_name) LIKE $${queryParams.length} OR LOWER(u.last_name) LIKE $${queryParams.length} OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE $${queryParams.length})`
//     }

//     queryText += `
//       GROUP BY u.id, u.first_name, u.last_name
//       HAVING SUM(a.total_marks) > 0
//       ORDER BY percentage_score DESC, total_quizzes_taken DESC
//       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
//     `

//     queryParams.push(limitVal, offsetVal)

//     const result = await pool.query(queryText, queryParams)

//     const rankedData = result.rows.map((row, index) => ({
//       rank: offsetVal + index + 1,
//       studentId: row.student_id,
//       name:
//         `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
//         'Anonymous Student',
//       quizzesTaken: parseInt(row.total_quizzes_taken),
//       percentageScore: parseFloat(row.percentage_score),
//     }))

//     return res.status(200).json({
//       success: true,
//       count: rankedData.length,
//       data: rankedData,
//     })
//   } catch (error) {
//     console.error('Error fetching leaderboard:', error.message)
//     return res.status(500).json({ success: false, error: 'Internal server error' })
//   }
// }

// // 2. Get the authenticated student's own rank and score profile
// const getMyRank = async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ success: false, message: 'Not authorized, token missing or invalid' })
//     }

//     const studentId = req.user.id
//     const { courseId } = req.query

//     const resolvedCourseId = await resolveCourseId(pool, courseId)
//     const courseName = normalizeCourseName(courseId)

//     let rankingSubQuery = `
//       SELECT 
//           u.id AS student_id,
//           ROUND(
//               (SUM(sub.score)::numeric / NULLIF(SUM(a.total_marks), 0)) * 100, 
//               2
//           ) AS percentage_score,
//           ROW_NUMBER() OVER (ORDER BY ROUND((SUM(sub.score)::numeric / NULLIF(SUM(a.total_marks), 0)) * 100, 2) DESC) AS calculated_rank
//       FROM users u
//       JOIN student_submissions sub ON u.id = sub.student_id
//       JOIN assessments a ON sub.assessment_id = a.id
//       WHERE LOWER(u.role) = 'student'
//     `

//     const queryParams = [studentId]

//     if (courseId) {
//       queryParams.push(resolvedCourseId, courseId, courseName)
//       rankingSubQuery += ` AND (a.course_id = $2 OR a.course_id::text = $3 OR LOWER(a.course_id::text) = LOWER($3) OR LOWER(a.course_id::text) = LOWER($4))`
//     }

//     rankingSubQuery += ` GROUP BY u.id HAVING SUM(a.total_marks) > 0`

//     const finalQuery = `
//       SELECT * FROM (${rankingSubQuery}) ranked_users
//       WHERE student_id = $1;
//     `

//     const result = await pool.query(finalQuery, queryParams)

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'No ranking data found for your account yet. Complete quizzes to get ranked!',
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         rank: parseInt(result.rows[0].calculated_rank),
//         percentageScore: parseFloat(result.rows[0].percentage_score),
//       },
//     })
//   } catch (error) {
//     console.error('Error fetching student rank:', error.message)
//     return res.status(500).json({ success: false, error: 'Internal server error' })
//   }
// }

// // 3. Get Top Performers (Podium - Top 3) for dashboard widgets
// const getTopPerformers = async (req, res) => {
//   try {
//     const { courseId } = req.query
//     const resolvedCourseId = await resolveCourseId(pool, courseId)
//     const courseName = normalizeCourseName(courseId)

//     let queryText = `
//       SELECT 
//           u.id AS student_id,
//           u.first_name,
//           u.last_name,
//           ROUND(
//               (SUM(sub.score)::numeric / NULLIF(SUM(a.total_marks), 0)) * 100, 
//               2
//           ) AS percentage_score
//       FROM users u
//       JOIN student_submissions sub ON u.id = sub.student_id
//       JOIN assessments a ON sub.assessment_id = a.id
//       WHERE LOWER(u.role) = 'student'
//     `

//     const queryParams = []

//     if (courseId) {
//       queryParams.push(resolvedCourseId, courseId, courseName)
//       queryText += ` AND (a.course_id = $1 OR a.course_id::text = $2 OR LOWER(a.course_id::text) = LOWER($2) OR LOWER(a.course_id::text) = LOWER($3))`
//     }

//     queryText += `
//       GROUP BY u.id, u.first_name, u.last_name
//       HAVING SUM(a.total_marks) > 0
//       ORDER BY percentage_score DESC
//       LIMIT 3;
//     `

//     const result = await pool.query(queryText, queryParams)

//     const podium = result.rows.map((row, index) => ({
//       medal: index === 0 ? 'Gold' : index === 1 ? 'Silver' : 'Bronze',
//       rank: index + 1,
//       studentId: row.student_id,
//       name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Anonymous',
//       percentageScore: parseFloat(row.percentage_score),
//     }))

//     return res.status(200).json({
//       success: true,
//       data: podium,
//     })
//   } catch (error) {
//     console.error('Error fetching podium:', error.message)
//     return res.status(500).json({ success: false, error: 'Internal server error' })
//   }
// }

// module.exports = { getLeaderboard, getMyRank, getTopPerformers }


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

// Check if a course leaderboard is frozen
const checkCourseFreezeStatus = async (client, resolvedCourseId) => {
  if (!resolvedCourseId) return false
  const result = await client.query(
    'SELECT is_leaderboard_frozen FROM courses WHERE id = $1',
    [resolvedCourseId]
  )
  return result.rows.length > 0 ? !!result.rows[0].is_leaderboard_frozen : false
}

// 1. Get global or course-specific leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 20, page = 1, courseId, search } = req.query
    const limitVal = parseInt(limit)
    const offsetVal = (parseInt(page) - 1) * limitVal

    const resolvedCourseId = await resolveCourseId(pool, courseId)
    const courseName = normalizeCourseName(courseId)

    // Optional: If course leaderboard is frozen, you can optionally notify or fetch accordingly
    const isFrozen = await checkCourseFreezeStatus(pool, resolvedCourseId)

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
      WHERE LOWER(u.role) = 'student'
        AND (u.exclude_from_leaderboard IS NOT TRUE)
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
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Anonymous Student',
      quizzesTaken: parseInt(row.total_quizzes_taken),
      percentageScore: parseFloat(row.percentage_score),
    }))

    return res.status(200).json({
      success: true,
      isLeaderboardFrozen: isFrozen,
      count: rankedData.length,
      data: rankedData,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// 2. Get the authenticated student's own rank
const getMyRank = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing or invalid' })
    }

    const studentId = req.user.id
    const { courseId } = req.query

    const resolvedCourseId = await resolveCourseId(pool, courseId)
    const courseName = normalizeCourseName(courseId)

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
      WHERE LOWER(u.role) = 'student'
        AND (u.exclude_from_leaderboard IS NOT TRUE)
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

// 3. Get Top Performers (Podium)
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
      WHERE LOWER(u.role) = 'student'
        AND (u.exclude_from_leaderboard IS NOT TRUE)
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

// 4. ADMIN/TUTOR: Toggle student exclusion status (exclude/disqualify from leaderboard)
const toggleStudentExclusion = async (req, res) => {
  try {
    const { studentId } = req.params
    const { exclude } = req.body // Boolean (true/false)

    const userCheck = await pool.query('SELECT id, role, exclude_from_leaderboard FROM users WHERE id = $1', [studentId])
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const newExcludeStatus = exclude !== undefined ? exclude : !userCheck.rows[0].exclude_from_leaderboard

    const updateResult = await pool.query(
      'UPDATE users SET exclude_from_leaderboard = $1 WHERE id = $2 RETURNING id, first_name, last_name, exclude_from_leaderboard',
      [newExcludeStatus, studentId]
    )

    return res.status(200).json({
      success: true,
      message: `Student successfully ${newExcludeStatus ? 'excluded from' : 'restored to'} the leaderboard.`,
      data: updateResult.rows[0],
    })
  } catch (error) {
    console.error('Error toggling student exclusion:', error.message)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// 5. ADMIN/TUTOR: Toggle course leaderboard freeze state
const toggleCourseFreeze = async (req, res) => {
  try {
    const { courseId } = req.params
    const resolvedCourseId = await resolveCourseId(pool, courseId)

    const courseCheck = await pool.query('SELECT id, title, is_leaderboard_frozen FROM courses WHERE id::text = $1', [resolvedCourseId])
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }

    const currentFreeze = courseCheck.rows[0].is_leaderboard_frozen || false
    const newFreezeStatus = !currentFreeze

    const updateResult = await pool.query(
      'UPDATE courses SET is_leaderboard_frozen = $1 WHERE id::text = $2 RETURNING id, title, is_leaderboard_frozen',
      [newFreezeStatus, resolvedCourseId]
    )

    return res.status(200).json({
      success: true,
      message: `Course leaderboard successfully ${newFreezeStatus ? 'frozen' : 'unfrozen'}.`,
      data: updateResult.rows[0],
    })
  } catch (error) {
    console.error('Error toggling course freeze:', error.message)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// 6. ADMIN/TUTOR: Manually override or edit a student's quiz submission score
const overrideStudentScore = async (req, res) => {
  try {
    const { submissionId } = req.params
    const { newScore } = req.body

    if (newScore === undefined || isNaN(newScore)) {
      return res.status(400).json({ success: false, message: 'A valid numeric score is required' })
    }

    const subCheck = await pool.query('SELECT * FROM student_submissions WHERE id = $1', [submissionId])
    if (subCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student submission record not found' })
    }

    const updateResult = await pool.query(
      'UPDATE student_submissions SET score = $1 WHERE id = $2 RETURNING *',
      [Number(newScore), submissionId]
    )

    return res.status(200).json({
      success: true,
      message: 'Student submission score successfully updated. Leaderboard rankings will automatically reflect this change.',
      data: updateResult.rows[0],
    })
  } catch (error) {
    console.error('Error overriding student score:', error.message)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

// 7. ADMIN/TUTOR: Delete a student's quiz submission (removes score from leaderboard calculation)
const deleteStudentSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params

    const subCheck = await pool.query('SELECT * FROM student_submissions WHERE id = $1', [submissionId])
    if (subCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student submission record not found' })
    }

    await pool.query('DELETE FROM student_submissions WHERE id = $1', [submissionId])

    return res.status(200).json({
      success: true,
      message: 'Student submission deleted successfully.',
    })
  } catch (error) {
    console.error('Error deleting submission:', error.message)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

module.exports = {
  getLeaderboard,
  getMyRank,
  getTopPerformers,
  toggleStudentExclusion,
  toggleCourseFreeze,
  overrideStudentScore,
  deleteStudentSubmission,
}