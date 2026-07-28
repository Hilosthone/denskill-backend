const db = require('../config/db')
const axios = require('axios')
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
      // Check or create user account directly
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

      // Save enrollment as completed
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

    // 4. Enforce minimum installment rule for paid courses (Minimum ₦20,000 unless full amount is less)
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


// @desc    Verify Paystack transaction & finalize enrollment tracking
// @route   GET /api/enrollments/verify/:reference
// @access  Public
exports.verifyEnrollmentPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status === 'success') {
      // Update enrollment status if needed
      await db.query(
        `UPDATE enrollments SET payment_status = CASE WHEN amount_paid >= total_amount THEN 'completed' ELSE 'partial' END WHERE reference = $1`,
        [reference]
      );

      return res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully! You can now set up your password.',
        email: paymentData.customer.email,
      });
    } else {
      return res.status(400).json({ status: 'failed', message: 'Payment verification failed.' });
    }
  } catch (err) {
    console.error('Verification Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error verifying payment.' });
  }
};

// @desc    Set password after successful enrollment payment
// @route   POST /api/auth/set-password
// @access  Public
const bcrypt = require('bcryptjs');

exports.setPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Please provide email, password, and confirmation.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found for this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and set verified flag
    await db.query('UPDATE users SET password = $1, is_verified = TRUE WHERE email = $2', [hashedPassword, email]);

    res.status(200).json({
      status: 'success',
      message: 'Password set successfully! You can now log in to your dashboard.',
    });
  } catch (err) {
    console.error('Set Password Error:', err.message);
    res.status(500).json({ error: 'Server error while setting password.' });
  }
};