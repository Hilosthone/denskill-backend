// src/routes/leaderboardRoutes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getLeaderboard } = require('../controllers/leaderboardController')

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Global student percentage-based ranking system
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

module.exports = router
