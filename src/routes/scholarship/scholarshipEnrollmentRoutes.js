// // src/routes/scholarship/scholarshipEnrollmentRoutes.js
// const express = require('express')
// const router = express.Router()
// const scholarshipEnrollmentController = require('../../controllers/scholarship/scholarshipEnrollmentController')

// /**
//  * @swagger
//  * tags:
//  *   name: Scholarship Enrollment
//  *   description: Public scholarship applications and pre-admission tracking
//  */

// /**
//  * @swagger
//  * /api/scholarship/enrollment/cohorts/active:
//  *   get:
//  *     summary: Get active scholarship cohorts
//  *     tags: [Scholarship Enrollment]
//  *     responses:
//  *       200:
//  *         description: Active cohorts retrieved successfully
//  */
// router.get('/cohorts/active', scholarshipEnrollmentController.getActiveCohorts)

// /**
//  * @swagger
//  * /api/scholarship/enrollment/apply:
//  *   post:
//  *     summary: Submit a new scholarship application
//  *     tags: [Scholarship Enrollment]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - cohortId
//  *               - firstName
//  *               - lastName
//  *               - email
//  *               - phone
//  *               - course
//  *               - statement
//  *             properties:
//  *               cohortId:
//  *                 type: string
//  *                 example: "123e4567-e89b-12d3-a456-426614174000"
//  *               firstName:
//  *                 type: string
//  *                 example: "Hilosthone"
//  *               lastName:
//  *                 type: string
//  *                 example: "John"
//  *               email:
//  *                 type: string
//  *                 example: "hilosthone@example.com"
//  *               phone:
//  *                 type: string
//  *                 example: "+2348000000000"
//  *               course:
//  *                 type: string
//  *                 example: "Full Stack Development"
//  *               statement:
//  *                 type: string
//  *                 example: "I am passionate about technology and want to build a career in software development."
//  *               referredBy:
//  *                 type: string
//  *                 example: "Friend / Social Media / Jane Doe"
//  *     responses:
//  *       201:
//  *         description: Scholarship application submitted successfully
//  */
// router.post('/apply', scholarshipEnrollmentController.submitApplication)

// /**
//  * @swagger
//  * /api/scholarship/enrollment/status:
//  *   get:
//  *     summary: Check scholarship application status
//  *     tags: [Scholarship Enrollment]
//  *     parameters:
//  *       - in: query
//  *         name: email
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Applicant email address
//  *     responses:
//  *       200:
//  *         description: Application status retrieved successfully
//  */
// router.get('/status', scholarshipEnrollmentController.getApplicationStatus)

// /**
//  * @swagger
//  * /api/scholarship/enrollment/payment/initialize:
//  *   post:
//  *     summary: Initialize Flutterwave payment for scholarship student contribution (80% scholarship coverage)
//  *     tags: [Scholarship Enrollment]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - applicationId
//  *             properties:
//  *               applicationId:
//  *                 type: string
//  *                 example: "123e4567-e89b-12d3-a456-426614174000"
//  *     responses:
//  *       200:
//  *         description: Payment initialized successfully
//  */
// router.post('/payment/initialize', scholarshipEnrollmentController.initializeScholarshipPayment)

// /**
//  * @swagger
//  * /api/scholarship/enrollment/payment/verify:
//  *   post:
//  *     summary: Verify Flutterwave transaction and update payment status
//  *     tags: [Scholarship Enrollment]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - reference
//  *             properties:
//  *               reference:
//  *                 type: string
//  *                 example: "SCH-COH1-ABC123XYZ"
//  *     responses:
//  *       200:
//  *         description: Payment verified successfully
//  */
// router.post('/payment/verify', scholarshipEnrollmentController.verifyScholarshipPayment)

// /**
//  * @swagger
//  * /api/scholarship/enrollment/claim:
//  *   post:
//  *     summary: Claim scholarship offer and activate student account with password
//  *     tags: [Scholarship Enrollment]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *asis:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - applicationId
//  *               - password
//  *             properties:
//  *               applicationId:
//  *                 type: string
//  *                 example: "123e4567-e89b-12d3-a456-426614174000"
//  *               password:
//  *                 type: string
//  *                 example: "SecurePassword123!"
//  *     responses:
//  *       200:
//  *         description: Scholarship claimed and account activated successfully
//  */
// router.post('/claim', scholarshipEnrollmentController.claimScholarship)

// module.exports = router



// src/routes/scholarship/scholarshipEnrollmentRoutes.js
const express = require('express')
const router = express.Router()
const scholarshipEnrollmentController = require('../../controllers/scholarship/scholarshipEnrollmentController')

/**
 * @swagger
 * tags:
 *   name: Scholarship Enrollment
 *   description: Public scholarship applications and pre-admission tracking
 */

/**
 * @swagger
 * /api/scholarship/enrollment/cohorts/active:
 *   get:
 *     summary: Get active scholarship cohorts
 *     tags: [Scholarship Enrollment]
 *     responses:
 *       200:
 *         description: Active cohorts retrieved successfully
 */
router.get('/cohorts/active', scholarshipEnrollmentController.getActiveCohorts)

/**
 * @swagger
 * /api/scholarship/enrollment/apply:
 *   post:
 *     summary: Submit a new scholarship application
 *     tags: [Scholarship Enrollment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cohortId
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - course
 *               - statement
 *             properties:
 *               cohortId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               firstName:
 *                 type: string
 *                 example: "Hilosthone"
 *               lastName:
 *                 type: string
 *                 example: "John"
 *               email:
 *                 type: string
 *                 example: "hilosthone@example.com"
 *               phone:
 *                 type: string
 *                 example: "+2348000000000"
 *               course:
 *                 type: string
 *                 example: "Full Stack Development"
 *               statement:
 *                 type: string
 *                 example: "I am passionate about technology and want to build a career in software development."
 *               referredBy:
 *                 type: string
 *                 example: "Friend / Social Media / Jane Doe"
 *     responses:
 *       201:
 *         description: Scholarship application submitted successfully
 */
router.post('/apply', scholarshipEnrollmentController.submitApplication)

/**
 * @swagger
 * /api/scholarship/enrollment/status:
 *   get:
 *     summary: Check scholarship application status
 *     tags: [Scholarship Enrollment]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant email address
 *     responses:
 *       200:
 *         description: Application status retrieved successfully
 */
router.get('/status', scholarshipEnrollmentController.getApplicationStatus)

/**
 * @swagger
 * /api/scholarship/enrollment/payment/initialize:
 *   post:
 *     summary: Initialize Flutterwave payment for scholarship student contribution (80% scholarship coverage)
 *     tags: [Scholarship Enrollment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *             properties:
 *               applicationId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 */
router.post('/payment/initialize', scholarshipEnrollmentController.initializeScholarshipPayment)

/**
 * @swagger
 * /api/scholarship/enrollment/payment/verify:
 *   post:
 *     summary: Verify Flutterwave transaction and update payment status
 *     tags: [Scholarship Enrollment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference
 *             properties:
 *               reference:
 *                 type: string
 *                 example: "SCH-COH1-ABC123XYZ"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 */
router.post('/payment/verify', scholarshipEnrollmentController.verifyScholarshipPayment)

/**
 * @swagger
 * /api/scholarship/enrollment/claim:
 *   post:
 *     summary: Claim scholarship offer and activate student account with password
 *     tags: [Scholarship Enrollment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - password
 *             properties:
 *               applicationId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               password:
 *                 type: string
 *                 example: "SecurePassword123!"
 *     responses:
 *       200:
 *         description: Scholarship claimed and account activated successfully
 */
router.post('/claim', scholarshipEnrollmentController.claimScholarship)

module.exports = router