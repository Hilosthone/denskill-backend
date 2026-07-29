

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