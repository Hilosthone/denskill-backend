// // src/controllers/scholarship/scholarshipDashboardController.js
// const db = require('../../config/db')
// const bcrypt = require('bcryptjs')

// /**
//  * @swagger
//  * /api/scholarship/dashboard/payment/verify:
//  *   post:
//  *     summary: Verify scholarship contribution payment & provision account
//  *     tags: [Scholarship Dashboard]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - paymentReference
//  *             properties:
//  *               paymentReference:
//  *                 type: string
//  *               transactionId:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Payment verified and account provisioned successfully
//  *       400:
//  *         description: Payment reference missing or already paid
//  *       404:
//  *         description: Scholarship award record not found
//  *       500:
//  *         description: Server error processing payment verification
//  */
// exports.verifyContributionPayment = async (req, res) => {
//   const { paymentReference, transactionId } = req.body

//   if (!paymentReference) {
//     return res
//       .status(400)
//       .json({ success: false, message: 'Payment reference is required' })
//   }

//   try {
//     // 1. Fetch award details using the payment reference
//     const awardResult = await db.query(
//       `SELECT sa.*, app.* FROM scholarship_awards sa
//        JOIN scholarship_applications app ON sa.application_id = app.id
//        WHERE sa.payment_reference = $1`,
//       [paymentReference],
//     )

//     if (awardResult.rows.length === 0) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message: 'Scholarship award record not found for this reference.',
//         })
//     }

//     const award = awardResult.rows[0]

//     if (award.payment_status === 'PAID') {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: 'This scholarship contribution has already been paid.',
//         })
//     }

//     // TODO: Optional - Call Flutterwave/Paystack API to verify transactionId if needed

//     // 2. Mark award as PAID
//     await db.query(
//       `UPDATE scholarship_awards SET payment_status = 'PAID', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
//       [award.id],
//     )

//     // 3. Record payment transaction
//     await db.query(
//       `INSERT INTO scholarship_payments (application_id, cohort_id, reference, amount, currency, provider, status, payment_type, paid_at)
//        VALUES ($1, $2, $3, $4, $5, 'FLUTTERWAVE', 'SUCCESS', 'SCHOLARSHIP_CONTRIBUTION', CURRENT_TIMESTAMP)
//        ON CONFLICT (reference) DO UPDATE SET status = 'SUCCESS', paid_at = CURRENT_TIMESTAMP`,
//       [
//         award.application_id,
//         award.cohort_id,
//         paymentReference,
//         award.student_amount,
//         award.currency,
//       ],
//     )

//     // 4. Update application status to ENROLLED
//     await db.query(
//       `UPDATE scholarship_applications SET status = 'ENROLLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
//       [award.application_id],
//     )

//     // 5. Create or update user account in the main users table as a SCHOLARSHIP student
//     let userResult = await db.query(`SELECT * FROM users WHERE email = $1`, [
//       award.email,
//     ])
//     let generatedPassword = null
//     let userId

//     if (userResult.rows.length === 0) {
//       // Generate a secure temporary password for the student
//       generatedPassword = Math.random().toString(36).slice(-8) + 'Ab1!'
//       const salt = await bcrypt.genSalt(10)
//       const hashedPassword = await bcrypt.hash(generatedPassword, salt)

//       const newUser = await db.query(
//         `INSERT INTO users (first_name, last_name, email, phone, password, student_type, scholarship_status, cohort_id, is_verified)
//          VALUES ($1, $2, $3, $4, $5, 'SCHOLARSHIP', 'ACTIVE', $6, true)
//          RETURNING id, email, first_name, last_name;`,
//         [
//           award.first_name,
//           award.last_name,
//           award.email,
//           award.phone,
//           hashedPassword,
//           award.cohort_id,
//         ],
//       )
//       userId = newUser.rows[0].id
//     } else {
//       userId = userResult.rows[0].id
//       await db.query(
//         `UPDATE users SET student_type = 'SCHOLARSHIP', scholarship_status = 'ACTIVE', cohort_id = $1 WHERE id = $2`,
//         [award.cohort_id, userId],
//       )
//     }

//     res.status(200).json({
//       success: true,
//       message:
//         'Payment verified and scholarship student account successfully provisioned!',
//       studentCredentials: generatedPassword
//         ? { email: award.email, tempPassword: generatedPassword }
//         : null,
//     })
//   } catch (error) {
//     console.error('Error verifying scholarship contribution payment:', error)
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error processing payment verification',
//       })
//   }
// }

// /**
//  * @swagger
//  * /api/scholarship/dashboard/profile:
//  *   get:
//  *     summary: Get student scholarship profile details
//  *     tags: [Scholarship Dashboard]
//  *     parameters:
//  *       - in: query
//  *         name: email
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Scholarship profile retrieved successfully
//  *       400:
//  *         description: Email parameter required
//  *       404:
//  *         description: No scholarship profile found
//  *       500:
//  *         description: Server error retrieving profile
//  */
// exports.getStudentScholarshipProfile = async (req, res) => {
//   const { email } = req.query

//   if (!email) {
//     return res
//       .status(400)
//       .json({ success: false, message: 'Email parameter required' })
//   }

//   try {
//     const result = await db.query(
//       `SELECT sa.*, sc.name as cohort_name, sc.code as cohort_code, sc.start_date, sc.end_date, saw.payment_reference, saw.payment_status, saw.student_amount, saw.scholarship_amount
//        FROM scholarship_applications sa
//        JOIN scholarship_cohorts sc ON sa.cohort_id = sc.id
//        LEFT JOIN scholarship_awards saw ON sa.id = saw.application_id
//        WHERE sa.email = $1 ORDER BY sa.created_at DESC LIMIT 1`,
//       [email],
//     )

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({
//           success: false,
//           message: 'No scholarship profile found for this email.',
//         })
//     }

//     res.status(200).json({ success: true, scholarshipProfile: result.rows[0] })
//   } catch (error) {
//     console.error('Error fetching student scholarship profile:', error)
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: 'Server error retrieving scholarship profile',
//       })
//   }
// }
