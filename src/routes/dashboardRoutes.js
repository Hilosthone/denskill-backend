// //src/routes/dashboardRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect } = require('../middleware/authMiddleware')
// const {
//   getStudentOverview,
//   getStudentProfile,
//   getStudentCourses,
//   getStudentPayments,
//   getStudentAnnouncements,
// } = require('../controllers/dashboardController')

// // Protect all routes with auth
// router.use(protect)

// router.get('/overview', getStudentOverview)
// router.get('/profile', getStudentProfile)
// router.get('/courses', getStudentCourses)
// router.get('/payments', getStudentPayments)
// router.get('/receipts', getStudentPayments)
// router.get('/announcements', getStudentAnnouncements)

// router.get('/community', (req, res) => {
//   res.status(200).json({ status: 'success', posts: [] })
// })

// module.exports = router



// src/routes/dashboardRoutes.js
const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware') 
const {
  getStudentOverview,
  getStudentProfile,
  getStudentCourses,
  getStudentPayments,
  getStudentAnnouncements,
  getCourseAssessments,
  submitAssessmentContent,
  getStudentGradesAndAttendance,
  getStudentCourseModules,
  getStudentLiveSessions,
} = require('../controllers/dashboardController')

// Protect all routes with auth
router.use(protect)

router.get('/overview', getStudentOverview)
router.get('/profile', getStudentProfile)
router.get('/courses', getStudentCourses)
router.get('/payments', getStudentPayments)
router.get('/receipts', getStudentPayments)
router.get('/announcements', getStudentAnnouncements)

// New Assessment, Submission, and Grade/Attendance Routes
router.get('/assessments/:courseId', getCourseAssessments)
router.post('/assessments/:assessmentId/submit', submitAssessmentContent)
router.get('/grades', getStudentGradesAndAttendance)

// New Course Content & Live Session Routes
router.get('/modules/:courseId', getStudentCourseModules)
router.get('/sessions/:courseId', getStudentLiveSessions)

router.get('/community', (req, res) => {
  res.status(200).json({ status: 'success', posts: [] })
})

module.exports = router