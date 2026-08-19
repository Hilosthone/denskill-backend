// const express = require('express')
// const router = express.Router()
// const scholarshipEnrollmentController = require('../../controllers/scholarship/scholarshipEnrollmentController')

// // Public routes for applicants
// router.get('/cohorts/active', scholarshipEnrollmentController.getActiveCohorts)
// router.post('/apply', scholarshipEnrollmentController.submitApplication)
// router.get('/status', scholarshipEnrollmentController.getApplicationStatus)

// module.exports = router




// src/routes/scholarship/scholarshipEnrollmentRoutes.js
const express = require('express')
const router = express.Router()
const scholarshipEnrollmentController = require('../../controllers/scholarship/scholarshipEnrollmentController')

// Public routes for scholarship applicants
router.get('/cohorts/active', scholarshipEnrollmentController.getActiveCohorts)
router.post('/apply', scholarshipEnrollmentController.submitApplication)
router.get('/status', scholarshipEnrollmentController.getApplicationStatus)

// Scholarship payment routes via Flutterwave (for ₦16,000 student contribution)
router.post('/payment/initialize', scholarshipEnrollmentController.initializeScholarshipPayment)
router.post('/payment/verify', scholarshipEnrollmentController.verifyScholarshipPayment)

// Scholarship offer claim and account activation route (post-approval/payment)
router.post('/claim', scholarshipEnrollmentController.claimScholarship)

module.exports = router