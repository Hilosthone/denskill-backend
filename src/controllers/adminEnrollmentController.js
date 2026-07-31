// Inside your adminEnrollmentController.js
const bcrypt = require('bcryptjs')
const db = require('../config/db')
const { COURSE_PRICES } = require('../utils/courses')

exports.manualOnboardStudent = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      country,
      phone,
      email,
      course,
      amountPaid,
      referredBy,
      reason,
      password, 
    } = req.body

    // 2. Validate required fields (including password)
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !course ||
      amountPaid === undefined ||
      !password
    ) {
      return res
        .status(400)
        .json({
          error:
            'Please provide all required student details, amount paid, and a login password.',
        })
    }

    // 3. Validate course and get pricing
    if (!(course in COURSE_PRICES)) {
      return res.status(400).json({ error: 'Invalid course selected.' })
    }

    const courseObj = COURSE_PRICES[course]
    const totalAmount = courseObj.price
    const totalWeeks = courseObj.weeks
    const paidAmount = Number(amountPaid)

    if (paidAmount > totalAmount) {
      return res
        .status(400)
        .json({ error: 'Amount paid cannot exceed the total course price.' })
    }

    // 4. Calculate payment status and expiry date if partial
    let paymentStatus = 'partial'
    let expiresAt = null

    if (paidAmount >= totalAmount) {
      paymentStatus = 'completed'
    } else if (totalAmount > 0) {
      const expiryDays = totalWeeks * 7
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + expiryDays)
      expiresAt = futureDate
    } else {
      paymentStatus = 'completed'
    }

    // 5. Check if user already exists in users table
    let userResult = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    let userId

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    if (userResult.rows.length === 0) {
      const newUser = await db.query(
        'INSERT INTO users (name, email, password, is_verified, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [`${firstName} ${lastName}`, email, hashedPassword, true, 'student'],
      )
      userId = newUser.rows[0].id
    } else {
      // If user account exists but they are being manually enrolled in a new course
      userId = userResult.rows[0].id
      // Optional: update their password if provided, or leave existing
    }

    // 6. Check if enrollment already exists for this course
    const existingEnrollment = await db.query(
      'SELECT * FROM enrollments WHERE email = $1 AND course = $2',
      [email, course],
    )

    if (existingEnrollment.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'Student is already enrolled in this course.' })
    }

    // 7. Insert manual enrollment record
    await db.query(
      `INSERT INTO enrollments (user_id, first_name, middle_name, last_name, country, phone, email, course, reason, referred_by, total_amount, amount_paid, payment_status, reference, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        userId,
        firstName,
        middleName || '',
        lastName,
        country || 'Nigeria',
        phone,
        email,
        course,
        reason || 'Manual offline onboarding by admin',
        referredBy || 'Admin',
        totalAmount,
        paidAmount,
        paymentStatus,
        `manual_${Date.now()}`,
        expiresAt,
      ],
    )

    res.status(200).json({
      status: 'success',
      message: `Student successfully onboarded with login credentials! They can now log in directly with (${email}).`,
    })
  } catch (err) {
    console.error('Manual Onboard Error:', err.message)
    res
      .status(500)
      .json({ error: 'Server error while manually onboarding student.' })
  }
}
