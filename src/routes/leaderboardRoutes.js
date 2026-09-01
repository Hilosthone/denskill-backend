// // src/routes/leaderboardRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect } = require('../middleware/authMiddleware')
// const { getLeaderboard } = require('../controllers/leaderboardController')

// /**
//  * @swagger
//  * tags:
//  *   name: Leaderboard
//  *   description: Global student percentage-based ranking system
//  */

// router.use(protect)

// /**
//  * @swagger
//  * /api/leaderboard:
//  *   get:
//  *     summary: Get global or course-specific student leaderboard ranked by percentage score
//  *     tags: [Leaderboard]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: courseId
//  *         schema:
//  *           type: string
//  *         description: Optional course filter (e.g., MERN_STACK_PRO)
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 20
//  *         description: Number of students to return
//  *     responses:
//  *       200:
//  *         description: Leaderboard successfully computed and retrieved
//  */
// router.get('/', getLeaderboard)

// module.exports = router



// src/routes/leaderboardRoutes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { 
  getLeaderboard, 
  getMyRank, 
  getTopPerformers 
} = require('../controllers/leaderboardController')

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Global student percentage-based ranking system and analytics
 */

router.use(protect)

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get global or course-specific student leaderboard ranked by percentage score
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course filter (e.g., MERN_STACK_PRO)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter leaderboard by student name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of students to return
 *     responses:
 *       200:
 *         description: Leaderboard successfully computed and retrieved
 */
router.get('/', getLeaderboard)

/**
 * @swagger
 * /api/leaderboard/me:
 *   get:
 *     summary: Get the authenticated student's current rank and percentage score
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course filter context
 *     responses:
 *       200:
 *         description: Student ranking retrieved successfully
 *       404:
 *         description: No ranking data found for the student yet
 */
router.get('/me', getMyRank)

/**
 * @swagger
 * /api/leaderboard/podium:
 *   get:
 *     summary: Get top 3 podium performers (Gold, Silver, Bronze) for dashboard display
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course filter context
 *     responses:
 *       200:
 *         description: Podium top performers retrieved successfully
 */
router.get('/podium', getTopPerformers)

module.exports = router