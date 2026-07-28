const db = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide name, email, and password.' })
    }

    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ])
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'User already exists with this email.' })
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert user into database
    const newUser = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword],
    )

    res.status(201).json({
      message: 'User registered successfully!',
      user: newUser.rows[0],
    })
  } catch (err) {
    console.error('Signup Error:', err.message)
    res.status(500).json({ error: 'Server error during registration.' })
  }
}

// @desc    Authenticate user & get token
// @route   POST /api/auth/signin
// @access  Public
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide email and password.' })
    }

    // Find user by email
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email])
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' })
    }

    // Compare submitted password with hashed password
    const isMatch = await bcrypt.compare(password, user.rows[0].password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    )

    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
      },
    })
  } catch (err) {
    console.error('Signin Error:', err.message)
    res.status(500).json({ error: 'Server error during login.' })
  }
}
