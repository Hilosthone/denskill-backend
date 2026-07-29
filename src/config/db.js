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
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL connections
  },
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

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
}
