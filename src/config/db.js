// // src/config/db.js
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

// // Automatically ensure first_name, middle_name, last_name, and phone columns exist on users table
// pool
//   .query(
//     `
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255);
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
//   `,
//   )
//   .then(() =>
//     console.log(
//       '✅ Database migration checked: user profile name & phone columns verified.',
//     ),
//   )
//   .catch((err) => console.error('❌ Migration error (user columns):', err.message))

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

// // Automatically ensure refresh_tokens table exists on startup
// pool
//   .query(
//     `
//     CREATE TABLE IF NOT EXISTS refresh_tokens (
//       id SERIAL PRIMARY KEY,
//       user_id INT NOT NULL,
//       token TEXT NOT NULL,
//       expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
//       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
//     );
//     CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
//   `,
//   )
//   .then(() =>
//     console.log(
//       '✅ Database migration checked: refresh_tokens table verified.',
//     ),
//   )
//   .catch((err) =>
//     console.error('❌ Migration error (refresh_tokens):', err.message),
//   )

// // Automatically ensure scholarship tables and user columns exist on startup
// pool
//   .query(
//     `
//     -- 1. Update users table columns for student tagging & IDs
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS student_type VARCHAR(50) DEFAULT 'REGULAR';
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS scholarship_status VARCHAR(50) DEFAULT NULL;
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS cohort_id INT DEFAULT NULL;
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id_number VARCHAR(100) UNIQUE DEFAULT NULL;
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

//     -- 2. Scholarship Cohorts
//     CREATE TABLE IF NOT EXISTS scholarship_cohorts (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         code VARCHAR(50) UNIQUE NOT NULL,
//         start_date DATE NOT NULL,
//         end_date DATE NOT NULL,
//         application_open_date DATE NOT NULL,
//         application_close_date DATE NOT NULL,
//         status VARCHAR(50) DEFAULT 'UPCOMING',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

//     -- 3. Scholarship Applications
//     CREATE TABLE IF NOT EXISTS scholarship_applications (
//         id SERIAL PRIMARY KEY,
//         cohort_id INT REFERENCES scholarship_cohorts(id) ON DELETE CASCADE,
//         first_name VARCHAR(100) NOT NULL,
//         last_name VARCHAR(100) NOT NULL,
//         email VARCHAR(255) NOT NULL,
//         phone VARCHAR(50) NOT NULL,
//         country VARCHAR(100) NOT NULL,
//         course VARCHAR(150) NOT NULL,
//         educational_background TEXT,
//         technical_background TEXT,
//         reason_for_applying TEXT,
//         motivation TEXT,
//         portfolio_url TEXT,
//         status VARCHAR(50) DEFAULT 'PENDING',
//         admin_notes TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

//     -- 4. Scholarship Awards
//     CREATE TABLE IF NOT EXISTS scholarship_awards (
//         id SERIAL PRIMARY KEY,
//         application_id INT REFERENCES scholarship_applications(id) ON DELETE CASCADE,
//         original_amount DECIMAL(10,2) DEFAULT 80000.00,
//         student_contribution_percentage INT DEFAULT 20,
//         student_amount DECIMAL(10,2) DEFAULT 16000.00,
//         scholarship_amount DECIMAL(10,2) DEFAULT 64000.00,
//         currency VARCHAR(10) DEFAULT 'NGN',
//         payment_reference VARCHAR(100) UNIQUE,
//         payment_status VARCHAR(50) DEFAULT 'PENDING',
//         expires_at TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

//     -- 5. Scholarship Payments
//     CREATE TABLE IF NOT EXISTS scholarship_payments (
//         id SERIAL PRIMARY KEY,
//         application_id INT REFERENCES scholarship_applications(id) ON DELETE CASCADE,
//         cohort_id INT REFERENCES scholarship_cohorts(id) ON DELETE CASCADE,
//         reference VARCHAR(150) UNIQUE NOT NULL,
//         amount DECIMAL(10,2) NOT NULL,
//         currency VARCHAR(10) DEFAULT 'NGN',
//         provider VARCHAR(50) DEFAULT 'FLUTTERWAVE',
//         status VARCHAR(50) DEFAULT 'PENDING',
//         payment_type VARCHAR(50) DEFAULT 'SCHOLARSHIP_CONTRIBUTION',
//         paid_at TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `,
//   )
//   .then(() =>
//     console.log(
//       '✅ Database migration checked: scholarship tables & user ID columns verified.',
//     ),
//   )
//   .catch((err) =>
//     console.error('❌ Migration error (scholarship):', err.message),
//   )

// // Automatically ensure instructors, assessments, student_submissions, and attendance_logs tables exist on startup
// pool
//   .query(
//     `
//     -- 1. Instructors Table
//     CREATE TABLE IF NOT EXISTS instructors (
//       id SERIAL PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) UNIQUE NOT NULL,
//       specialty VARCHAR(255) NOT NULL,
//       role VARCHAR(100) DEFAULT 'Instructor',
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

//     -- 2. Assessments Table
//     CREATE TABLE IF NOT EXISTS assessments (
//       id SERIAL PRIMARY KEY,
//       title VARCHAR(255) NOT NULL,
//       total_marks INTEGER DEFAULT 100,
//       weight NUMERIC DEFAULT 1.0,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

//     -- 3. Student Submissions Table
//     CREATE TABLE IF NOT EXISTS student_submissions (
//       id SERIAL PRIMARY KEY,
//       student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//       assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
//       score NUMERIC,
//       status VARCHAR(50) DEFAULT 'submitted',
//       feedback TEXT,
//       graded_at TIMESTAMP,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );

//     -- 4. Attendance Logs Table
//     CREATE TABLE IF NOT EXISTS attendance_logs (
//       id SERIAL PRIMARY KEY,
//       student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//       course_id VARCHAR(255),
//       status VARCHAR(50) DEFAULT 'present',
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `,
//   )
//   .then(() =>
//     console.log(
//       '✅ Database migration checked: instructors, assessments, submissions & attendance tables verified.',
//     ),
//   )
//   .catch((err) =>
//     console.error('❌ Migration error (extra admin tables):', err.message),
//   )

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   getClient: () => pool.connect(),
// }


// src/config/db.js
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

// Automatically ensure first_name, middle_name, last_name, and phone columns exist on users table
pool
  .query(
    `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
  `,
  )
  .then(() =>
    console.log(
      '✅ Database migration checked: user profile name & phone columns verified.',
    ),
  )
  .catch((err) => console.error('❌ Migration error (user columns):', err.message))

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
    console.log(
      '✅ Database migration checked: refresh_tokens table verified.',
    ),
  )
  .catch((err) =>
    console.error('❌ Migration error (refresh_tokens):', err.message),
  )

// Automatically ensure scholarship tables and user columns exist on startup
pool
  .query(
    `
    -- 1. Update users table columns for student tagging & IDs
    ALTER TABLE users ADD COLUMN IF NOT EXISTS student_type VARCHAR(50) DEFAULT 'REGULAR';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS scholarship_status VARCHAR(50) DEFAULT NULL;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS cohort_id INT DEFAULT NULL;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id_number VARCHAR(100) UNIQUE DEFAULT NULL;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

    -- 2. Scholarship Cohorts
    CREATE TABLE IF NOT EXISTS scholarship_cohorts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        application_open_date DATE NOT NULL,
        application_close_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'UPCOMING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Scholarship Applications
    CREATE TABLE IF NOT EXISTS scholarship_applications (
        id SERIAL PRIMARY KEY,
        cohort_id INT REFERENCES scholarship_cohorts(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL,
        course VARCHAR(150) NOT NULL,
        educational_background TEXT,
        technical_background TEXT,
        reason_for_applying TEXT,
        motivation TEXT,
        portfolio_url TEXT,
        referred_by VARCHAR(255),
        status VARCHAR(50) DEFAULT 'PENDING',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Safety check: Ensure column exists if table was previously created without it
    ALTER TABLE scholarship_applications ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255);

    -- 4. Scholarship Awards
    CREATE TABLE IF NOT EXISTS scholarship_awards (
        id SERIAL PRIMARY KEY,
        application_id INT REFERENCES scholarship_applications(id) ON DELETE CASCADE,
        original_amount DECIMAL(10,2) DEFAULT 80000.00,
        student_contribution_percentage INT DEFAULT 20,
        student_amount DECIMAL(10,2) DEFAULT 16000.00,
        scholarship_amount DECIMAL(10,2) DEFAULT 64000.00,
        currency VARCHAR(10) DEFAULT 'NGN',
        payment_reference VARCHAR(100) UNIQUE,
        payment_status VARCHAR(50) DEFAULT 'PENDING',
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Scholarship Payments
    CREATE TABLE IF NOT EXISTS scholarship_payments (
        id SERIAL PRIMARY KEY,
        application_id INT REFERENCES scholarship_applications(id) ON DELETE CASCADE,
        cohort_id INT REFERENCES scholarship_cohorts(id) ON DELETE CASCADE,
        reference VARCHAR(150) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'NGN',
        provider VARCHAR(50) DEFAULT 'FLUTTERWAVE',
        status VARCHAR(50) DEFAULT 'PENDING',
        payment_type VARCHAR(50) DEFAULT 'SCHOLARSHIP_CONTRIBUTION',
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  )
  .then(() =>
    console.log(
      '✅ Database migration checked: scholarship tables & user ID columns verified.',
    ),
  )
  .catch((err) =>
    console.error('❌ Migration error (scholarship):', err.message),
  )

// Automatically ensure instructors, assessments, student_submissions, and attendance_logs tables exist on startup
pool
  .query(
    `
    -- 1. Instructors Table
    CREATE TABLE IF NOT EXISTS instructors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      specialty VARCHAR(255) NOT NULL,
      role VARCHAR(100) DEFAULT 'Instructor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Assessments Table
    CREATE TABLE IF NOT EXISTS assessments (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      total_marks INTEGER DEFAULT 100,
      weight NUMERIC DEFAULT 1.0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Student Submissions Table
    CREATE TABLE IF NOT EXISTS student_submissions (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
      score NUMERIC,
      status VARCHAR(50) DEFAULT 'submitted',
      feedback TEXT,
      graded_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Attendance Logs Table
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'present',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  )
  .then(() =>
    console.log(
      '✅ Database migration checked: instructors, assessments, submissions & attendance tables verified.',
    ),
  )
  .catch((err) =>
    console.error('❌ Migration error (extra admin tables):', err.message),
  )

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
}