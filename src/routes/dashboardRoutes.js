// const express = require('express')
// const router = express.Router()
// const { getStudentOverview } = require('../controllers/dashboardController')
// const { protect } = require('../middleware/authMiddleware')

// /**
//  * @swagger
//  * /api/dashboard:
//  *   get:
//  *     summary: Get full student portal overview (profile, courses, payments, receipts, announcements)
//  *     tags: [Dashboard]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Student dashboard data retrieved successfully.
//  *       401:
//  *         description: Unauthorized.
//  */
// router.get('/', protect, getStudentOverview)

// module.exports = router

//src/routes/dashboardRoutes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware') // Changed from verifyToken to protect
const {
  getStudentOverview,
  getStudentProfile,
  getStudentCourses,
  getStudentPayments,
  getStudentAnnouncements,
} = require('../controllers/dashboardController')

// Protect all routes with auth
router.use(protect)

router.get('/overview', getStudentOverview)
router.get('/profile', getStudentProfile)
router.get('/courses', getStudentCourses)
router.get('/payments', getStudentPayments)
router.get('/receipts', getStudentPayments)
router.get('/announcements', getStudentAnnouncements)

router.get('/community', (req, res) => {
  res.status(200).json({ status: 'success', posts: [] })
})

module.exports = router