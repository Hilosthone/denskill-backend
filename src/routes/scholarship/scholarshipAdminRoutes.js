// const express = require('express')
// const router = express.Router()
// const scholarshipAdminController = require('../../controllers/scholarship/scholarshipAdminController')
// // Note: You can plug in your existing admin authentication middleware here if desired

// // Metrics & Reports
// router.get(
//   '/dashboard',
//   scholarshipAdminController.getScholarshipDashboardMetrics,
// )

// // Applications Management
// router.get('/applications', scholarshipAdminController.getAllApplications)
// router.patch(
//   '/applications/:id/approve',
//   scholarshipAdminController.approveApplication,
// )
// router.patch(
//   '/applications/:id/reject',
//   scholarshipAdminController.rejectApplication,
// )

// // Cohorts Management
// router.get('/cohorts', scholarshipAdminController.getAllCohorts)
// router.post('/cohorts', scholarshipAdminController.createCohort)
// router.patch(
//   '/cohorts/:id/status',
//   scholarshipAdminController.updateCohortStatus,
// )

// module.exports = router




// src/routes/scholarship/scholarshipAdminRoutes.js
const express = require('express')
const router = express.Router()

const { protect } = require('../../middleware/authMiddleware')
const { isAdmin } = require('../../middleware/adminMiddleware')

const {
  getScholarshipDashboardMetrics,
  getAllApplications,
  approveApplication,
  rejectApplication,
  manualOnboardScholarshipStudent,
  createCohort,
  updateCohortStatus,
  getAllCohorts,
} = require('../../controllers/scholarship/scholarshipAdminController')

// ==========================================
// PROTECTED SCHOLARSHIP ADMIN ROUTES
// ==========================================
router.use(protect, isAdmin)

// Dashboard Metrics
router.get('/metrics', getScholarshipDashboardMetrics)

// Scholarship Applications Management
router.get('/applications', getAllApplications)
router.put('/applications/:id/approve', approveApplication)
router.put('/applications/:id/reject', rejectApplication)

// Manual Student Onboarding
router.post('/students/manual-onboard', manualOnboardScholarshipStudent)

// Cohort Management
router.get('/cohorts', getAllCohorts)
router.post('/cohorts', createCohort)
router.put('/cohorts/:id/status', updateCohortStatus)

module.exports = router