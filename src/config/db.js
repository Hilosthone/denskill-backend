// // config/db.js
// const { Pool } = require('pg')
// require('dotenv').config()

// // DEBUG: Let's see what values are actually loading
// console.log(
//   'DEBUG DB CONFIG -> User:',
//   process.env.DB_USER,
//   '| Port:',
//   process.env.DB_PORT,
//   '| Password Length:',
//   process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'UNDEFINED',
// )

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST || '127.0.0.1',
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT || 5432,
//   // Only use SSL if running in production (Render)
//   ssl:
//     process.env.NODE_ENV === 'production'
//       ? { rejectUnauthorized: false }
//       : false,
// })

// pool.on('connect', () => {
//   console.log('📦 Connected to PostgreSQL Database')
// })

// // Automatically ensure the status column exists on startup
// pool
//   .query(
//     `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`,
//   )
//   .then(() =>
//     console.log('✅ Database migration checked: status column verified.'),
//   )
//   .catch((err) => console.error('❌ Migration error:', err.message))

// // Automatically ensure courses table exists and has tutor_id column
// pool
//   .query(
//     `
//     CREATE TABLE IF NOT EXISTS courses (
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       description TEXT,
//       tutor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `,
//   )
//   .then(() => {
//     // Also ensure tutor_id column exists if table was already there without it
//     return pool.query(
//       `ALTER TABLE courses ADD COLUMN IF NOT EXISTS tutor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`,
//     )
//   })
//   .then(() =>
//     console.log(
//       '✅ Database migration checked: courses table and tutor relationship verified.',
//     ),
//   )
//   .catch((err) => console.error('❌ Migration error:', err.message))

// // Automatically ensure enrollments table exists on startup
// pool
//   .query(
//     `
//     CREATE TABLE IF NOT EXISTS enrollments (
//       id SERIAL PRIMARY KEY,
//       user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//       first_name VARCHAR(100) NOT NULL,
//       middle_name VARCHAR(100),
//       last_name VARCHAR(100) NOT NULL,
//       country VARCHAR(100) NOT NULL,
//       phone VARCHAR(50) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       course VARCHAR(100) NOT NULL,
//       reason TEXT,
//       referred_by VARCHAR(100),
//       total_amount NUMERIC DEFAULT 0,
//       amount_paid NUMERIC DEFAULT 0,
//       payment_status VARCHAR(20) DEFAULT 'pending',
//       reference VARCHAR(255),
//       expires_at TIMESTAMP,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `,
//   )
//   .then(() =>
//     console.log('✅ Database migration checked: enrollments table verified.'),
//   )
//   .catch((err) =>
//     console.error('❌ Migration error (enrollments):', err.message),
//   )

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   getClient: () => pool.connect(),
// }


// config/db.js
const { Pool } = require('pg')
require('dotenv').config()

// DEBUG: Let's see what values are actually loading
console.log(
  'DEBUG DB CONFIG -> User:',
  process.env.DB_USER,
  '| Port:',
  process.env.DB_PORT,
  '| Password Length:',
  process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'UNDEFINED',
)

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  // Only use SSL if running in production (Render)
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
})

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL Database')
})

// Automatically ensure the status column exists on startup
pool
  .query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`,
  )
  .then(() =>
    console.log('✅ Database migration checked: status column verified.'),
  )
  .catch((err) => console.error('❌ Migration error:', err.message))

// Automatically ensure courses table exists and has tutor_id column
pool
  .query(
    `
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      tutor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  )
  .then(() => {
    // Also ensure tutor_id column exists if table was already there without it
    return pool.query(
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS tutor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`,
    )
  })
  .then(() =>
    console.log(
      '✅ Database migration checked: courses table and tutor relationship verified.',
    ),
  )
  .catch((err) => console.error('❌ Migration error:', err.message))

// Automatically ensure enrollments table exists on startup
pool
  .query(
    `
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(100) NOT NULL,
      middle_name VARCHAR(100),
      last_name VARCHAR(100) NOT NULL,
      country VARCHAR(100) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      course VARCHAR(100) NOT NULL,
      reason TEXT,
      referred_by VARCHAR(100),
      total_amount NUMERIC DEFAULT 0,
      amount_paid NUMERIC DEFAULT 0,
      payment_status VARCHAR(20) DEFAULT 'pending',
      reference VARCHAR(255),
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  )
  .then(() =>
    console.log('✅ Database migration checked: enrollments table verified.'),
  )
  .catch((err) =>
    console.error('❌ Migration error (enrollments):', err.message),
  )

// Automatically ensure refresh_tokens table exists on startup
pool
  .query(
    `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      token TEXT NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
  `,
  )
  .then(() =>
    console.log('✅ Database migration checked: refresh_tokens table verified.'),
  )
  .catch((err) =>
    console.error('❌ Migration error (refresh_tokens):', err.message),
  )

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
}