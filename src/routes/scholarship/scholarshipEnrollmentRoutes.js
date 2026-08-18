const express = require('express')
const router = express.Router()
const scholarshipEnrollmentController = require('../../controllers/scholarship/scholarshipEnrollmentController')

// Public routes for applicants
router.get('/cohorts/active', scholarshipEnrollmentController.getActiveCohorts)
router.post('/apply', scholarshipEnrollmentController.submitApplication)
router.get('/status', scholarshipEnrollmentController.getApplicationStatus)

module.exports = router
