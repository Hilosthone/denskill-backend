// const db = require('../config/db')
// const axios = require('axios')
// const bcrypt = require('bcryptjs')
// const { COURSE_PRICES } = require('../utils/courses')

// // @desc    Register student details & initialize Paystack payment
// // @route   POST /api/enrollments/initialize
// // @access  Public
// exports.initializeEnrollment = async (req, res) => {
//   try {
//     const {
//       firstName,
//       middleName,
//       lastName,
//       country,
//       phone,
//       email,
//       course,
//       reason,
//       referredBy,
//       amountPaid, // Amount the student is paying right now
//       callback_url,
//     } = req.body

//     // 1. Validate required fields
//     if (!firstName || !lastName || !country || !phone || !email || !course) {
//       return res
//         .status(400)
//         .json({ error: 'Please fill in all required registration fields.' })
//     }

//     // 2. Validate course existence and get price
//     if (!(course in COURSE_PRICES)) {
//       return res.status(400).json({ error: 'Invalid course selected.' })
//     }

//     const totalAmount = COURSE_PRICES[course]
//     const paidAmount = Number(amountPaid) || totalAmount

//     // 3. Handle Free courses (e.g., Graphics Design)
//     if (totalAmount === 0) {
//       let userResult = await db.query('SELECT * FROM users WHERE email = $1', [
//         email,
//       ])
//       let userId

//       if (userResult.rows.length === 0) {
//         const newUser = await db.query(
//           'INSERT INTO users (name, email, password, is_verified) VALUES ($1, $2, $3, $4) RETURNING id',
//           [`${firstName} ${lastName}`, email, null, false],
//         )
//         userId = newUser.rows[0].id
//       } else {
//         userId = userResult.rows[0].id
//       }

//       await db.query(
//         `INSERT INTO enrollments (user_id, first_name, middle_name, last_name, country, phone, email, course, reason, referred_by, total_amount, amount_paid, payment_status)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
//         [
//           userId,
//           firstName,
//           middleName || '',
//           lastName,
//           country,
//           phone,
//           email,
//           course,
//           reason,
//           referredBy,
//           0,
//           0,
//           'completed',
//         ],
//       )

//       return res.status(200).json({
//         status: 'success',
//         message:
//           'Free course registration successful! Please set your password to log in.',
//         freeCourse: true,
//       })
//     }

//     // 4. Enforce minimum installment rule for paid courses
//     const minInstallment = totalAmount >= 20000 ? 20000 : totalAmount
//     if (paidAmount < minInstallment) {
//       return res.status(400).json({
//         error: `The minimum initial payment for this course is ₦${minInstallment.toLocaleString()}.`,
//       })
//     }

//     if (paidAmount > totalAmount) {
//       return res
//         .status(400)
//         .json({ error: 'Amount paid cannot exceed the total course price.' })
//     }

//     // 5. Ensure user placeholder exists or create one
//     let userResult = await db.query('SELECT * FROM users WHERE email = $1', [
//       email,
//     ])
//     let userId

//     if (userResult.rows.length === 0) {
//       const newUser = await db.query(
//         'INSERT INTO users (name, email, password, is_verified) VALUES ($1, $2, $3, $4) RETURNING id',
//         [`${firstName} ${lastName}`, email, null, false],
//       )
//       userId = newUser.rows[0].id
//     } else {
//       userId = userResult.rows[0].id
//     }

//     // 6. Initialize transaction with Paystack (Convert amount to kobo)
//     const amountInKobo = Math.round(paidAmount * 100)

//     const paystackResponse = await axios.post(
//       'https://api.paystack.co/transaction/initialize',
//       {
//         email,
//         amount: amountInKobo,
//         callback_url,
//         metadata: {
//           course,
//           userId,
//           firstName,
//           lastName,
//           phone,
//           paymentType: 'initial',
//           paidAmount,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       },
//     )

//     const { authorization_url, reference } = paystackResponse.data.data

//     // 7. Calculate installment expiration (4 weeks from now if partial)
//     let expiresAt = null
//     let paymentStatus = 'partial'
//     if (paidAmount === totalAmount) {
//       paymentStatus = 'completed'
//     } else {
//       const fourWeeksFromNow = new Date()
//       fourWeeksFromNow.setDate(fourWeeksFromNow.getDate() + 28)
//       expiresAt = fourWeeksFromNow
//     }

//     // 8. Save or update pending enrollment record
//     const existingEnrollment = await db.query(
//       'SELECT * FROM enrollments WHERE email = $1 AND course = $2',
//       [email, course],
//     )

//     if (existingEnrollment.rows.length > 0) {
//       await db.query(
//         `UPDATE enrollments SET reference = $1, amount_paid = $2, total_amount = $3, payment_status = $4, expires_at = $5 WHERE email = $6 AND course = $7`,
//         [
//           reference,
//           paidAmount,
//           totalAmount,
//           paymentStatus,
//           expiresAt,
//           email,
//           course,
//         ],
//       )
//     } else {
//       await db.query(
//         `INSERT INTO enrollments (user_id, first_name, middle_name, last_name, country, phone, email, course, reason, referred_by, total_amount, amount_paid, payment_status, reference, expires_at)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
//         [
//           userId,
//           firstName,
//           middleName || '',
//           lastName,
//           country,
//           phone,
//           email,
//           course,
//           reason,
//           referredBy,
//           totalAmount,
//           paidAmount,
//           paymentStatus,
//           reference,
//           expiresAt,
//         ],
//       )
//     }

//     res.status(200).json({
//       status: 'success',
//       authorization_url,
//       reference,
//     })
//   } catch (err) {
//     console.error(
//       'Enrollment Initialization Error:',
//       err.response?.data || err.message,
//     )
//     res
//       .status(500)
//       .json({ error: 'Failed to initialize course registration payment.' })
//   }
// }

// // @desc    Initialize subsequent/installment payment for logged-in user
// // @route   POST /api/enrollments/pay-installment
// // @access  Private (Requires authentication middleware attaching req.user)
// exports.initializeInstallmentPayment = async (req, res) => {
//   try {
//     const userId = req.user?.id
//     const { course, amountPayable, callback_url } = req.body

//     if (!userId || !course || !amountPayable) {
//       return res
//         .status(400)
//         .json({ error: 'Course and payment amount are required.' })
//     }

//     // 1. Fetch user enrollment
//     const enrollmentResult = await db.query(
//       'SELECT * FROM enrollments WHERE user_id = $1 AND course = $2',
//       [userId, course],
//     )

//     if (enrollmentResult.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ error: 'Enrollment record not found for this course.' })
//     }

//     const enrollment = enrollmentResult.rows[0]

//     if (enrollment.payment_status === 'completed') {
//       return res
//         .status(400)
//         .json({ error: 'This course is already fully paid.' })
//     }

//     const totalAmount = Number(enrollment.total_amount)
//     const currentPaid = Number(enrollment.amount_paid)
//     const remainingBalance = totalAmount - currentPaid
//     const installmentAmount = Number(amountPayable)

//     if (installmentAmount > remainingBalance) {
//       return res.status(400).json({
//         error: `Amount exceeds remaining balance. You only owe ₦${remainingBalance.toLocaleString()}`,
//       })
//     }

//     // 2. Initialize Paystack transaction for installment
//     const amountInKobo = Math.round(installmentAmount * 100)

//     const paystackResponse = await axios.post(
//       'https://api.paystack.co/transaction/initialize',
//       {
//         email: enrollment.email,
//         amount: amountInKobo,
//         callback_url: callback_url || 'https://denskill.com/dashboard',
//         metadata: {
//           course,
//           userId,
//           paymentType: 'installment',
//           installmentAmount,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       },
//     )

//     const { authorization_url, reference } = paystackResponse.data.data

//     // 3. Update active reference in database so verification hooks onto it
//     await db.query(
//       'UPDATE enrollments SET reference = $1 WHERE user_id = $2 AND course = $3',
//       [reference, userId, course],
//     )

//     res.status(200).json({
//       status: 'success',
//       authorization_url,
//       reference,
//       remainingBalance: remainingBalance - installmentAmount,
//     })
//   } catch (err) {
//     console.error(
//       'Installment Initialization Error:',
//       err.response?.data || err.message,
//     )
//     res.status(500).json({ error: 'Failed to initialize installment payment.' })
//   }
// }

// // @desc    Verify Paystack transaction & finalize enrollment tracking
// // @route   GET /api/enrollments/verify/:reference?
// // @access  Public
// exports.verifyEnrollmentPayment = async (req, res) => {
//   try {
//     const reference =
//       req.params.reference || req.query.reference || req.query.trxref

//     if (!reference) {
//       return res
//         .status(400)
//         .json({ error: 'Transaction reference is missing.' })
//     }

//     const response = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       },
//     )

//     const paymentData = response.data.data

//     if (paymentData.status === 'success') {
//       const metadata = paymentData.metadata || {}
//       const paymentType = metadata.paymentType || 'initial'

//       if (paymentType === 'installment') {
//         const installmentPaid = Number(metadata.installmentAmount) || 0

//         // Increment amount_paid and clear expiry if balance is fully paid
//         await db.query(
//           `UPDATE enrollments
//            SET amount_paid = amount_paid + $1,
//                payment_status = CASE WHEN (amount_paid + $1) >= total_amount THEN 'completed' ELSE 'partial' END,
//                expires_at = CASE WHEN (amount_paid + $1) >= total_amount THEN NULL ELSE expires_at END
//            WHERE reference = $2`,
//           [installmentPaid, reference],
//         )
//       } else {
//         // Initial registration payment
//         await db.query(
//           `UPDATE enrollments SET payment_status = CASE WHEN amount_paid >= total_amount THEN 'completed' ELSE 'partial' END WHERE reference = $1`,
//           [reference],
//         )
//       }
//           return res.redirect(
//             `https://denskill.com/student/dashboard?payment=success&reference=${reference}`,
//           )
//         } else {
//           return res.redirect(
//             `https://denskill.com/student/dashboard?payment=failed&reference=${reference}`,
//           )
//         }
//       } catch (err) {
//         console.error('Verification Error:', err.response?.data || err.message)
//         return res.redirect('https://denskill.com/student/dashboard?payment=error')
//       }
// }

// // @desc    Set password after successful enrollment payment
// // @route   POST /api/enrollments/set-password
// // @access  Public
// exports.setPassword = async (req, res) => {
//   try {
//     const { email, password, confirmPassword } = req.body

//     if (!email || !password || !confirmPassword) {
//       return res
//         .status(400)
//         .json({ error: 'Please provide email, password, and confirmation.' })
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ error: 'Passwords do not match.' })
//     }

//     const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
//       email,
//     ])
//     if (userResult.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ error: 'User account not found for this email.' })
//     }

//     const salt = await bcrypt.genSalt(10)
//     const hashedPassword = await bcrypt.hash(password, salt)

//     await db.query(
//       'UPDATE users SET password = $1, is_verified = TRUE WHERE email = $2',
//       [hashedPassword, email],
//     )

//     res.status(200).json({
//       status: 'success',
//       message:
//         'Password set successfully! You can now log in to your dashboard.',
//     })
//   } catch (err) {
//     console.error('Set Password Error:', err.message)
//     res.status(500).json({ error: 'Server error while setting password.' })
//   }
// }

const db = require('../config/db')
const axios = require('axios')
const bcrypt = require('bcryptjs')
const { COURSE_PRICES } = require('../utils/courses')

// @desc    Register student details & initialize Paystack payment
// @route   POST /api/enrollments/initialize
// @access  Public
exports.initializeEnrollment = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      country,
      phone,
      email,
      course,
      reason,
      referredBy,
      amountPaid, // Amount the student is paying right now
      callback_url,
    } = req.body

    // 1. Validate required fields
    if (!firstName || !lastName || !country || !phone || !email || !course) {
      return res
        .status(400)
        .json({ error: 'Please fill in all required registration fields.' })
    }

    // 2. Validate course existence and get price
    if (!(course in COURSE_PRICES)) {
      return res.status(400).json({ error: 'Invalid course selected.' })
    }

    const totalAmount = COURSE_PRICES[course]
    const paidAmount = Number(amountPaid) || totalAmount

    // 3. Handle Free courses (e.g., Graphics Design)
    if (totalAmount === 0) {
      let userResult = await db.query('SELECT * FROM users WHERE email = $1', [
        email,
      ])
      let userId

      if (userResult.rows.length === 0) {
        const newUser = await db.query(
          'INSERT INTO users (name, email, password, is_verified) VALUES ($1, $2, $3, $4) RETURNING id',
          [`${firstName} ${lastName}`, email, null, false],
        )
        userId = newUser.rows[0].id
      } else {
        userId = userResult.rows[0].id
      }

      await db.query(
        `INSERT INTO enrollments (user_id, first_name, middle_name, last_name, country, phone, email, course, reason, referred_by, total_amount, amount_paid, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          userId,
          firstName,
          middleName || '',
          lastName,
          country,
          phone,
          email,
          course,
          reason,
          referredBy,
          0,
          0,
          'completed',
        ],
      )

      return res.status(200).json({
        status: 'success',
        message:
          'Free course registration successful! Please set your password to log in.',
        freeCourse: true,
      })
    }

    // 4. Enforce minimum installment rule for paid courses
    const minInstallment = totalAmount >= 20000 ? 20000 : totalAmount
    if (paidAmount < minInstallment) {
      return res.status(400).json({
        error: `The minimum initial payment for this course is ₦${minInstallment.toLocaleString()}.`,
      })
    }

    if (paidAmount > totalAmount) {
      return res
        .status(400)
        .json({ error: 'Amount paid cannot exceed the total course price.' })
    }

    // 5. Ensure user placeholder exists or create one
    let userResult = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    let userId

    if (userResult.rows.length === 0) {
      const newUser = await db.query(
        'INSERT INTO users (name, email, password, is_verified) VALUES ($1, $2, $3, $4) RETURNING id',
        [`${firstName} ${lastName}`, email, null, false],
      )
      userId = newUser.rows[0].id
    } else {
      userId = userResult.rows[0].id
    }

    // 6. Initialize transaction with Paystack (Convert amount to kobo)
    const amountInKobo = Math.round(paidAmount * 100)

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
        callback_url,
        metadata: {
          course,
          userId,
          firstName,
          lastName,
          phone,
          paymentType: 'initial',
          paidAmount,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const { authorization_url, reference } = paystackResponse.data.data

    // 7. Calculate installment expiration (4 weeks from now if partial)
    let expiresAt = null
    let paymentStatus = 'partial'
    if (paidAmount === totalAmount) {
      paymentStatus = 'completed'
    } else {
      const fourWeeksFromNow = new Date()
      fourWeeksFromNow.setDate(fourWeeksFromNow.getDate() + 28)
      expiresAt = fourWeeksFromNow
    }

    // 8. Save or update pending enrollment record
    const existingEnrollment = await db.query(
      'SELECT * FROM enrollments WHERE email = $1 AND course = $2',
      [email, course],
    )

    if (existingEnrollment.rows.length > 0) {
      await db.query(
        `UPDATE enrollments SET reference = $1, amount_paid = $2, total_amount = $3, payment_status = $4, expires_at = $5 WHERE email = $6 AND course = $7`,
        [
          reference,
          paidAmount,
          totalAmount,
          paymentStatus,
          expiresAt,
          email,
          course,
        ],
      )
    } else {
      await db.query(
        `INSERT INTO enrollments (user_id, first_name, middle_name, last_name, country, phone, email, course, reason, referred_by, total_amount, amount_paid, payment_status, reference, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          userId,
          firstName,
          middleName || '',
          lastName,
          country,
          phone,
          email,
          course,
          reason,
          referredBy,
          totalAmount,
          paidAmount,
          paymentStatus,
          reference,
          expiresAt,
        ],
      )
    }

    res.status(200).json({
      status: 'success',
      authorization_url,
      reference,
    })
  } catch (err) {
    console.error(
      'Enrollment Initialization Error:',
      err.response?.data || err.message,
    )
    res
      .status(500)
      .json({ error: 'Failed to initialize course registration payment.' })
  }
}

// @desc    Initialize subsequent/installment payment for logged-in user
// @route   POST /api/enrollments/pay-installment
// @access  Private (Requires authentication middleware attaching req.user)
exports.initializeInstallmentPayment = async (req, res) => {
  try {
    const userId = req.user?.id
    const { course, amountPayable, callback_url } = req.body

    if (!userId || !course || !amountPayable) {
      return res
        .status(400)
        .json({ error: 'Course and payment amount are required.' })
    }

    // 1. Fetch user enrollment
    const enrollmentResult = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course = $2',
      [userId, course],
    )

    if (enrollmentResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Enrollment record not found for this course.' })
    }

    const enrollment = enrollmentResult.rows[0]

    if (enrollment.payment_status === 'completed') {
      return res
        .status(400)
        .json({ error: 'This course is already fully paid.' })
    }

    const totalAmount = Number(enrollment.total_amount)
    const currentPaid = Number(enrollment.amount_paid)
    const remainingBalance = totalAmount - currentPaid
    const installmentAmount = Number(amountPayable)

    if (installmentAmount > remainingBalance) {
      return res.status(400).json({
        error: `Amount exceeds remaining balance. You only owe ₦${remainingBalance.toLocaleString()}`,
      })
    }

    // 2. Initialize Paystack transaction for installment
    const amountInKobo = Math.round(installmentAmount * 100)

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: enrollment.email,
        amount: amountInKobo,
        callback_url: callback_url || 'https://www.denskill.com/dashboard',
        metadata: {
          course,
          userId,
          paymentType: 'installment',
          installmentAmount,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const { authorization_url, reference } = paystackResponse.data.data

    // 3. Update active reference in database so verification hooks onto it
    await db.query(
      'UPDATE enrollments SET reference = $1 WHERE user_id = $2 AND course = $3',
      [reference, userId, course],
    )

    res.status(200).json({
      status: 'success',
      authorization_url,
      reference,
      remainingBalance: remainingBalance - installmentAmount,
    })
  } catch (err) {
    console.error(
      'Installment Initialization Error:',
      err.response?.data || err.message,
    )
    res.status(500).json({ error: 'Failed to initialize installment payment.' })
  }
}

// @desc    Verify Paystack transaction & finalize enrollment tracking
// @route   GET /api/enrollments/verify/:reference?
// @access  Public
exports.verifyEnrollmentPayment = async (req, res) => {
  try {
    const reference =
      req.params.reference || req.query.reference || req.query.trxref

    if (!reference) {
      return res
        .status(400)
        .json({ success: false, error: 'Transaction reference is missing.' })
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    )

    const paymentData = response.data.data

    if (paymentData.status === 'success') {
      const metadata = paymentData.metadata || {}
      const paymentType = metadata.paymentType || 'initial'

      if (paymentType === 'installment') {
        const installmentPaid = Number(metadata.installmentAmount) || 0

        // Increment amount_paid and clear expiry if balance is fully paid
        await db.query(
          `UPDATE enrollments 
           SET amount_paid = amount_paid + $1,
               payment_status = CASE WHEN (amount_paid + $1) >= total_amount THEN 'completed' ELSE 'partial' END,
               expires_at = CASE WHEN (amount_paid + $1) >= total_amount THEN NULL ELSE expires_at END
            WHERE reference = $2`,
          [installmentPaid, reference],
        )
      } else {
        // Initial registration payment
        await db.query(
          `UPDATE enrollments SET payment_status = CASE WHEN amount_paid >= total_amount THEN 'completed' ELSE 'partial' END WHERE reference = $1`,
          [reference],
        )
      }

      // Return JSON instead of redirecting (Fixes the CORS error!)
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        reference,
        customerEmail: paymentData.customer?.email,
        metadata: paymentData.metadata,
      })
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        reference,
      })
    }
  } catch (err) {
    console.error('Verification Error:', err.response?.data || err.message)
    return res.status(500).json({
      success: false,
      error: 'Server error during payment verification.',
    })
  }
}

// @desc    Set password after successful enrollment payment
// @route   POST /api/enrollments/set-password
// @access  Public
exports.setPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body

    if (!email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ error: 'Please provide email, password, and confirmation.' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' })
    }

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'User account not found for this email.' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await db.query(
      'UPDATE users SET password = $1, is_verified = TRUE WHERE email = $2',
      [hashedPassword, email],
    )

    res.status(200).json({
      status: 'success',
      message:
        'Password set successfully! You can now log in to your dashboard...',
    })
  } catch (err) {
    console.error('Set Password Error:', err.message)
    res.status(500).json({ error: 'Server error while setting password.' })
  }
}