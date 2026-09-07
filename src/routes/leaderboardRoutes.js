// src/routes/leaderboardRoutes.js
const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/authMiddleware')
const { 
  getLeaderboard, 
  getMyRank, 
  getTopPerformers,
  toggleStudentExclusion,
  toggleCourseFreeze,
  overrideStudentScore,
  deleteStudentSubmission
} = require('../controllers/leaderboardController')

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Global and course-specific student percentage-based ranking system, analytics, and admin/tutor controls
 */

// All routes require authentication
router.use(protect)

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get global or course-specific student leaderboard ranked by percentage score
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter by student name
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
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Leaderboard successfully retrieved
 */
router.get('/', getLeaderboard)

/**
 * @swagger
 * /api/leaderboard/me:
 *   get:
 *     summary: Get authenticated student's current rank and score profile
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course filter context
 *     responses:
 *       200:
 *         description: Student ranking retrieved successfully
 */
router.get('/me', getMyRank)

/**
 * @swagger
 * /api/leaderboard/podium:
 *   get:
 *     summary: Get top 3 podium performers (Gold, Silver, Bronze)
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Optional course filter context
 *     responses:
 *       200:
 *         description: Podium performers retrieved successfully
 */
router.get('/podium', getTopPerformers)

/**
 * @swagger
 * /api/leaderboard/admin/users/{studentId}/exclusion:
 *   patch:
 *     summary: Exclude or restore a student from the leaderboard (Restricted to Admins and Tutors)
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID of the student
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exclude:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Student exclusion status updated successfully
 */
router.patch('/admin/users/:studentId/exclusion', authorize('ADMIN', 'TUTOR'), toggleStudentExclusion)

/**
 * @swagger
 * /api/leaderboard/admin/courses/{courseId}/freeze:
 *   patch:
 *     summary: Freeze or unfreeze a course leaderboard (Restricted to Admins and Tutors)
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID or identifier
 *     responses:
 *       200:
 *         description: Course freeze status toggled successfully
 */
router.patch('/admin/courses/:courseId/freeze', authorize('ADMIN', 'TUTOR'), toggleCourseFreeze)

/**
 * @swagger
 * /api/leaderboard/admin/submissions/{submissionId}:
 *   put:
 *     summary: Edit/Override a student's submission score (Restricted to Admins and Tutors)
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newScore
 *             properties:
 *               newScore:
 *                 type: number
 *                 example: 85
 *     responses:
 *       200:
 *         description: Submission score overridden successfully
 *   delete:
 *     summary: Delete a student's submission record (Restricted to Admins and Tutors)
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Submission ID
 *     responses:
 *       200:
 *         description: Submission deleted successfully
 */
router.route('/admin/submissions/:submissionId')
  .put(authorize('ADMIN', 'TUTOR'), overrideStudentScore)
  .delete(authorize('ADMIN', 'TUTOR'), deleteStudentSubmission)

module.exports = router