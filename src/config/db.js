// // src/config/db.js
// const { Pool } = require('pg')
// require('dotenv').config()

// // DEBUG: Let's see what values are actually loading
// console.log(
//   'DEBUG DB CONFIG -> DATABASE_URL present:',
//   process.env.DATABASE_URL ? 'YES (Length: ' + process.env.DATABASE_URL.length + ')' : 'NO',
//   '| Node Env:',
//   process.env.NODE_ENV
// )

// const poolConfig = process.env.DATABASE_URL
//   ? {
//       connectionString: process.env.DATABASE_URL,
//       ssl: { rejectUnauthorized: false }, // Required for cloud Postgres on serverless/production
//     }
//   : {
//       user: process.env.DB_USER,
//       host: process.env.DB_HOST || '127.0.0.1',
//       database: process.env.DB_NAME,
//       password: process.env.DB_PASSWORD,
//       port: process.env.DB_PORT || 5432,
//       ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
//     }

// const pool = new Pool(poolConfig)

// pool.on('connect', () => {
//   console.log('📦 Connected to PostgreSQL Database')
// })

// // Run sequential migrations to avoid race conditions and foreign key conflicts
// const runMigrations = async () => {
//   try {
//     // 0. Ensure base users table exists first with role included so subsequent inserts never fail
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255),
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         role VARCHAR(50) DEFAULT 'student',
//         exclude_from_leaderboard BOOLEAN DEFAULT FALSE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `)
//     console.log(
//       '✅ Database migration checked: base users table & role verified.',
//     )

//     // 1. Automatically ensure the status column exists on users table
//     await pool.query(
//       `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`,
//     )
//     console.log('✅ Database migration checked: status column verified.')

//     // 2. Automatically ensure first_name, middle_name, last_name, country, phone, role, and leaderboard exclusion columns exist on users table
//     await pool.query(`
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255);
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS exclude_from_leaderboard BOOLEAN DEFAULT FALSE;
//     `)
//     console.log(
//       '✅ Database migration checked: user profile name, country, phone, role & leaderboard exclusion columns verified.',
//     )

//     // 3. Automatically ensure courses table exists and has tutor_id, category, and leaderboard freeze columns
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS courses (
//         id SERIAL PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         description TEXT,
//         category VARCHAR(100),
//         tutor_id INTEGER,
//         is_leaderboard_frozen BOOLEAN DEFAULT FALSE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//       ALTER TABLE courses ADD COLUMN IF NOT EXISTS tutor_id INTEGER;
//       ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100);
//       ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_leaderboard_frozen BOOLEAN DEFAULT FALSE;
//     `)
//     console.log(
//       '✅ Database migration checked: courses table, category, tutor relationship & leaderboard freeze status verified.',
//     )

//     // 4. Automatically ensure enrollments table exists and make key columns optional to prevent onboarding crashes
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS enrollments (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER,
//         course_id INTEGER,
//         first_name VARCHAR(100),
//         middle_name VARCHAR(100),
//         last_name VARCHAR(100),
//         country VARCHAR(100),
//         phone VARCHAR(50),
//         email VARCHAR(255),
//         course VARCHAR(100),
//         reason TEXT,
//         referred_by VARCHAR(100),
//         total_amount NUMERIC DEFAULT 0,
//         amount_paid NUMERIC DEFAULT 0,
//         payment_status VARCHAR(20) DEFAULT 'pending',
//         reference VARCHAR(255) UNIQUE,
//         expires_at TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
      
//       -- Ensure columns exist and drop strict NOT NULL constraints so manual onboarding never crashes
//       ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_id INTEGER;
//       ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
//       ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
//       ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS country VARCHAR(100);
//       ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
//       ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS email VARCHAR(255);
//       ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course VARCHAR(100);

//       ALTER TABLE enrollments ALTER COLUMN first_name DROP NOT NULL;
//       ALTER TABLE enrollments ALTER COLUMN last_name DROP NOT NULL;
//       ALTER TABLE enrollments ALTER COLUMN country DROP NOT NULL;
//       ALTER TABLE enrollments ALTER COLUMN phone DROP NOT NULL;
//       ALTER TABLE enrollments ALTER COLUMN email DROP NOT NULL;
//       ALTER TABLE enrollments ALTER COLUMN course DROP NOT NULL;

//       -- Ensure reference unique index exists if the table was previously created without it
//       CREATE UNIQUE INDEX IF NOT EXISTS enrollments_reference_idx ON enrollments (reference);
//     `)
//     console.log('✅ Database migration checked: enrollments table verified.')

//     // 5. Automatically ensure refresh_tokens table exists on startup
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS refresh_tokens (
//         id SERIAL PRIMARY KEY,
//         user_id INT NOT NULL,
//         token TEXT NOT NULL,
//         expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
//         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
//       );
//       CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
//     `)
//     console.log('✅ Database migration checked: refresh_tokens table verified.')

//     // 6. Automatically ensure scholarship tables and user columns exist on startup
//     await pool.query(`
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS student_type VARCHAR(50) DEFAULT 'REGULAR';
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS scholarship_status VARCHAR(50) DEFAULT NULL;
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS cohort_id INT DEFAULT NULL;
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id_number VARCHAR(100) UNIQUE DEFAULT NULL;
//       ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

//       CREATE TABLE IF NOT EXISTS scholarship_cohorts (
//           id SERIAL PRIMARY KEY,
//           name VARCHAR(100) NOT NULL,
//           code VARCHAR(50) UNIQUE NOT NULL,
//           start_date DATE NOT NULL,
//           end_date DATE NOT NULL,
//           application_open_date DATE NOT NULL,
//           application_close_date DATE NOT NULL,
//           status VARCHAR(50) DEFAULT 'UPCOMING',
//           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//       CREATE TABLE IF NOT EXISTS scholarship_applications (
//           id SERIAL PRIMARY KEY,
//           cohort_id INT REFERENCES scholarship_cohorts(id) ON DELETE CASCADE,
//           first_name VARCHAR(100) NOT NULL,
//           last_name VARCHAR(100) NOT NULL,
//           email VARCHAR(255) NOT NULL,
//           phone VARCHAR(50) NOT NULL,
//           country VARCHAR(100) NOT NULL,
//           course VARCHAR(150) NOT NULL,
//           educational_background TEXT,
//           technical_background TEXT,
//           reason_for_applying TEXT,
//           motivation TEXT,
//           portfolio_url TEXT,
//           referred_by VARCHAR(255),
//           status VARCHAR(50) DEFAULT 'PENDING',
//           admin_notes TEXT,
//           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//       CREATE TABLE IF NOT EXISTS scholarship_awards (
//           id SERIAL PRIMARY KEY,
//           application_id INT REFERENCES scholarship_applications(id) ON DELETE CASCADE,
//           original_amount DECIMAL(10,2) DEFAULT 80000.00,
//           student_contribution_percentage INT DEFAULT 20,
//           student_amount DECIMAL(10,2) DEFAULT 16000.00,
//           scholarship_amount DECIMAL(10,2) DEFAULT 64000.00,
//           currency VARCHAR(10) DEFAULT 'NGN',
//           payment_reference VARCHAR(100) UNIQUE,
//           payment_status VARCHAR(50) DEFAULT 'PENDING',
//           expires_at TIMESTAMP,
//           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//       CREATE TABLE IF NOT EXISTS scholarship_payments (
//           id SERIAL PRIMARY KEY,
//           application_id INT REFERENCES scholarship_applications(id) ON DELETE CASCADE,
//           cohort_id INT REFERENCES scholarship_cohorts(id) ON DELETE CASCADE,
//           reference VARCHAR(150) UNIQUE NOT NULL,
//           amount DECIMAL(10,2) NOT NULL,
//           currency VARCHAR(10) DEFAULT 'NGN',
//           provider VARCHAR(50) DEFAULT 'FLUTTERWAVE',
//           status VARCHAR(50) DEFAULT 'PENDING',
//           payment_type VARCHAR(50) DEFAULT 'SCHOLARSHIP_CONTRIBUTION',
//           paid_at TIMESTAMP,
//           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//     `)
//     console.log(
//       '✅ Database migration checked: scholarship tables & user ID columns verified.',
//     )

//     // 7. Automatically ensure instructors table is created BEFORE dependent tables like question_banks
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS instructors (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         specialty VARCHAR(255) NOT NULL,
//         role VARCHAR(100) DEFAULT 'Instructor',
//         password VARCHAR(255),
//         phone VARCHAR(50),
//         avatar_url TEXT,
//         status VARCHAR(20) DEFAULT 'active',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
//       ALTER TABLE instructors ADD COLUMN IF NOT EXISTS password VARCHAR(255);
//       ALTER TABLE instructors ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
//       ALTER TABLE instructors ADD COLUMN IF NOT EXISTS avatar_url TEXT;
//       ALTER TABLE instructors ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
//     `)
//     console.log('✅ Database migration checked: instructors table verified.')

//     // 8. Automatically ensure assessments, student_submissions, attendance, modules, sessions & announcements tables verified
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS assessments (
//         id SERIAL PRIMARY KEY,
//         course_id VARCHAR(100),
//         title VARCHAR(255) NOT NULL,
//         description TEXT,
//         type VARCHAR(50) DEFAULT 'assignment',
//         total_marks INTEGER DEFAULT 100,
//         weight NUMERIC DEFAULT 0,
//         tutor_id INTEGER,
//         created_by INTEGER,
//         due_date TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
      
//       DO $$ 
//       BEGIN 
//         IF EXISTS (
//           SELECT 1 FROM information_schema.columns 
//           WHERE table_name = 'assessments' AND column_name = 'course_id' AND data_type = 'integer'
//         ) THEN
//           ALTER TABLE assessments ALTER COLUMN course_id TYPE VARCHAR(100) USING course_id::VARCHAR;
//         END IF;
//       END $$;

//       CREATE TABLE IF NOT EXISTS student_submissions (
//         id SERIAL PRIMARY KEY,
//         student_id INTEGER,
//         assessment_id INTEGER,
//         score NUMERIC,
//         status VARCHAR(50) DEFAULT 'submitted',
//         feedback TEXT,
//         submission_url TEXT,
//         submission_text TEXT,
//         graded_by INTEGER,
//         graded_at TIMESTAMP,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//       CREATE TABLE IF NOT EXISTS attendance_logs (
//         id SERIAL PRIMARY KEY,
//         student_id INTEGER,
//         course_id VARCHAR(100),
//         session_date DATE NOT NULL DEFAULT CURRENT_DATE,
//         status VARCHAR(50) DEFAULT 'present',
//         logged_by INTEGER,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         CONSTRAINT unique_student_course_date UNIQUE (student_id, course_id, session_date)
//       );

//       CREATE TABLE IF NOT EXISTS course_modules (
//         id SERIAL PRIMARY KEY,
//         course_id VARCHAR(100),
//         title VARCHAR(255) NOT NULL,
//         week_number INTEGER DEFAULT 1,
//         content_type VARCHAR(50) DEFAULT 'video',
//         content TEXT,
//         resource_url TEXT,
//         description TEXT,
//         tutor_id INTEGER,
//         created_by INTEGER,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//       CREATE TABLE IF NOT EXISTS live_sessions (
//         id SERIAL PRIMARY KEY,
//         course_id VARCHAR(100),
//         title VARCHAR(255) NOT NULL,
//         session_type VARCHAR(50) DEFAULT 'lecture',
//         meeting_link TEXT NOT NULL,
//         scheduled_at TIMESTAMP NOT NULL,
//         description TEXT,
//         tutor_id INTEGER,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//       CREATE TABLE IF NOT EXISTS course_announcements (
//         id SERIAL PRIMARY KEY,
//         course_id VARCHAR(100),
//         title VARCHAR(255) NOT NULL,
//         content TEXT NOT NULL,
//         tutor_id INTEGER,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//       CREATE TABLE IF NOT EXISTS announcements (
//         id SERIAL PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         date VARCHAR(100),
//         content TEXT NOT NULL,
//         tag VARCHAR(100) DEFAULT 'Bulletin',
//         target VARCHAR(100) DEFAULT 'all',
//         priority VARCHAR(50) DEFAULT 'normal',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
      
//       -- Ensure priority column exists if announcements table was created previously without it
//       ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'normal';
//     `)
//     console.log(
//       '✅ Database migration checked: announcements & additional tables verified.',
//     )

//     // 9. Automatically ensure question_banks, questions, and question_options tables exist
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS question_banks (
//         id SERIAL PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         description TEXT,
//         course_id VARCHAR(100),
//         subjects TEXT[],
//         duration_minutes INTEGER DEFAULT 30,
//         expires_at TIMESTAMP WITH TIME ZONE,
//         start_time TIMESTAMP WITH TIME ZONE,
//         max_attempts INTEGER DEFAULT 1,
//         created_by INTEGER REFERENCES instructors(id) ON DELETE SET NULL,
//         created_by_role VARCHAR(50) DEFAULT 'TUTOR',
//         status VARCHAR(50) DEFAULT 'DRAFT',
//         review_comment TEXT,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );
      
//       ALTER TABLE question_banks ADD COLUMN IF NOT EXISTS course_id VARCHAR(100);

//       CREATE TABLE IF NOT EXISTS questions (
//         id SERIAL PRIMARY KEY,
//         question_bank_id INTEGER REFERENCES question_banks(id) ON DELETE CASCADE,
//         subject_id VARCHAR(100) NOT NULL,
//         course_id VARCHAR(100),
//         question_text TEXT NOT NULL,
//         question_type VARCHAR(50) DEFAULT 'MCQ',
//         image_url TEXT,
//         marks INTEGER DEFAULT 1,
//         difficulty VARCHAR(20) DEFAULT 'MEDIUM',
//         tags TEXT[],
//         order_index INTEGER DEFAULT 0,
//         created_by INTEGER REFERENCES instructors(id) ON DELETE SET NULL,
//         created_by_role VARCHAR(50) DEFAULT 'TUTOR',
//         status VARCHAR(50) DEFAULT 'ACTIVE',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//       CREATE TABLE IF NOT EXISTS question_options (
//         id SERIAL PRIMARY KEY,
//         question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
//         text TEXT NOT NULL,
//         is_correct BOOLEAN DEFAULT FALSE,
//         explanation TEXT
//       );
//     `)
//     console.log('✅ Database migration checked: question_banks, questions, question_options tables verified.')

//     // 10. Automatically ensure assessment_submissions table exists and has matching columns
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS assessment_submissions (
//         id SERIAL PRIMARY KEY,
//         assessment_id INTEGER REFERENCES question_banks(id) ON DELETE CASCADE,
//         student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
//         score NUMERIC DEFAULT 0,
//         total_marks NUMERIC DEFAULT 0,
//         status VARCHAR(50) DEFAULT 'SUBMITTED',
//         answers JSONB,
//         submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
//       );

//       -- Ensure columns referenced in questionController queries exist safely
//       ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS student_id INTEGER;
//       ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS user_id INTEGER;
//       ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS course_id VARCHAR(100);
//     `)
//     console.log('✅ Database migration checked: assessment_submissions table verified.')

//   } catch (err) {
//     console.error('❌ Migration execution error:', err.message)
//   }
// }

// // Execute migrations on startup
// runMigrations()

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   connect: () => pool.connect(),
//   getClient: () => pool.connect(),
//   ...pool,
//   pool,
// }



// src/config/db.js
const { Pool } = require('pg')
require('dotenv').config()

// DEBUG: Let's see what values are actually loading
console.log(
  'DEBUG DB CONFIG -> DATABASE_URL present:',
  process.env.DATABASE_URL ? 'YES (Length: ' + process.env.DATABASE_URL.length + ')' : 'NO',
  '| Node Env:',
  process.env.NODE_ENV
)

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for cloud Postgres on serverless/production
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }

const pool = new Pool(poolConfig)

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL Database')
})

// Run sequential migrations to avoid race conditions and foreign key conflicts
const runMigrations = async () => {
  try {
    // 0. Ensure base users table exists first with role and exclusion columns included
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        exclude_from_leaderboard BOOLEAN DEFAULT FALSE,
        is_excluded BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log(
      '✅ Database migration checked: base users table & role verified.',
    )

    // 1. Automatically ensure the status column exists on users table
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`,
    )
    console.log('✅ Database migration checked: status column verified.')

    // 2. Automatically ensure profile name, country, phone, role, and leaderboard exclusion columns exist on users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS exclude_from_leaderboard BOOLEAN DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_excluded BOOLEAN DEFAULT FALSE;
    `)
    console.log(
      '✅ Database migration checked: user profile name, country, phone, role & leaderboard exclusion columns verified.',
    )

    // 3. Automatically ensure courses table exists and has tutor_id, category, and leaderboard freeze columns (with safe aliases)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        tutor_id INTEGER,
        is_leaderboard_frozen BOOLEAN DEFAULT FALSE,
        is_frozen BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS tutor_id INTEGER;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100);
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_leaderboard_frozen BOOLEAN DEFAULT FALSE;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT FALSE;
    `)
    console.log(
      '✅ Database migration checked: courses table, category, tutor relationship & leaderboard freeze status verified.',
    )

    // 4. Automatically ensure enrollments table exists and make key columns optional to prevent onboarding crashes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        course_id INTEGER,
        first_name VARCHAR(100),
        middle_name VARCHAR(100),
        last_name VARCHAR(100),
        country VARCHAR(100),
        phone VARCHAR(50),
        email VARCHAR(255),
        course VARCHAR(100),
        reason TEXT,
        referred_by VARCHAR(100),
        total_amount NUMERIC DEFAULT 0,
        amount_paid NUMERIC DEFAULT 0,
        payment_status VARCHAR(20) DEFAULT 'pending',
        reference VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Ensure columns exist and drop strict NOT NULL constraints so manual onboarding never crashes
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_id INTEGER;
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS country VARCHAR(100);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course VARCHAR(100);

      ALTER TABLE enrollments ALTER COLUMN first_name DROP NOT NULL;
      ALTER TABLE enrollments ALTER COLUMN last_name DROP NOT NULL;
      ALTER TABLE enrollments ALTER COLUMN country DROP NOT NULL;
      ALTER TABLE enrollments ALTER COLUMN phone DROP NOT NULL;
      ALTER TABLE enrollments ALTER COLUMN email DROP NOT NULL;
      ALTER TABLE enrollments ALTER COLUMN course DROP NOT NULL;

      -- Ensure reference unique index exists if the table was previously created without it
      CREATE UNIQUE INDEX IF NOT EXISTS enrollments_reference_idx ON enrollments (reference);
    `)
    console.log('✅ Database migration checked: enrollments table verified.')

    // 5. Automatically ensure refresh_tokens table exists on startup
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    `)
    console.log('✅ Database migration checked: refresh_tokens table verified.')

    // 6. Automatically ensure scholarship tables and user columns exist on startup
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS student_type VARCHAR(50) DEFAULT 'REGULAR';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS scholarship_status VARCHAR(50) DEFAULT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS cohort_id INT DEFAULT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id_number VARCHAR(100) UNIQUE DEFAULT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

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
    `)
    console.log(
      '✅ Database migration checked: scholarship tables & user ID columns verified.',
    )

    // 7. Automatically ensure instructors table is created BEFORE dependent tables like question_banks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        specialty VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'Instructor',
        password VARCHAR(255),
        phone VARCHAR(50),
        avatar_url TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS password VARCHAR(255);
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE instructors ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
    `)
    console.log('✅ Database migration checked: instructors table verified.')

    // 8. Automatically ensure assessments, student_submissions, attendance, modules, sessions & announcements tables verified
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        course_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'assignment',
        total_marks INTEGER DEFAULT 100,
        weight NUMERIC DEFAULT 0,
        tutor_id INTEGER,
        created_by INTEGER,
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'assessments' AND column_name = 'course_id' AND data_type = 'integer'
        ) THEN
          ALTER TABLE assessments ALTER COLUMN course_id TYPE VARCHAR(100) USING course_id::VARCHAR;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS student_submissions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER,
        assessment_id INTEGER,
        score NUMERIC,
        status VARCHAR(50) DEFAULT 'submitted',
        feedback TEXT,
        submission_url TEXT,
        submission_text TEXT,
        graded_by INTEGER,
        graded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS attendance_logs (
        id SERIAL PRIMARY KEY,
        student_id INTEGER,
        course_id VARCHAR(100),
        session_date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'present',
        logged_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_student_course_date UNIQUE (student_id, course_id, session_date)
      );

      CREATE TABLE IF NOT EXISTS course_modules (
        id SERIAL PRIMARY KEY,
        course_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        week_number INTEGER DEFAULT 1,
        content_type VARCHAR(50) DEFAULT 'video',
        content TEXT,
        resource_url TEXT,
        description TEXT,
        tutor_id INTEGER,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS live_sessions (
        id SERIAL PRIMARY KEY,
        course_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        session_type VARCHAR(50) DEFAULT 'lecture',
        meeting_link TEXT NOT NULL,
        scheduled_at TIMESTAMP NOT NULL,
        description TEXT,
        tutor_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS course_announcements (
        id SERIAL PRIMARY KEY,
        course_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tutor_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100),
        content TEXT NOT NULL,
        tag VARCHAR(100) DEFAULT 'Bulletin',
        target VARCHAR(100) DEFAULT 'all',
        priority VARCHAR(50) DEFAULT 'normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Ensure priority column exists if announcements table was created previously without it
      ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'normal';
    `)
    console.log(
      '✅ Database migration checked: announcements & additional tables verified.',
    )

    // 9. Automatically ensure question_banks, questions, and question_options tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_banks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        course_id VARCHAR(100),
        subjects TEXT[],
        duration_minutes INTEGER DEFAULT 30,
        expires_at TIMESTAMP WITH TIME ZONE,
        start_time TIMESTAMP WITH TIME ZONE,
        max_attempts INTEGER DEFAULT 1,
        created_by INTEGER REFERENCES instructors(id) ON DELETE SET NULL,
        created_by_role VARCHAR(50) DEFAULT 'TUTOR',
        status VARCHAR(50) DEFAULT 'DRAFT',
        review_comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      ALTER TABLE question_banks ADD COLUMN IF NOT EXISTS course_id VARCHAR(100);

      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_bank_id INTEGER REFERENCES question_banks(id) ON DELETE CASCADE,
        subject_id VARCHAR(100) NOT NULL,
        course_id VARCHAR(100),
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'MCQ',
        image_url TEXT,
        marks INTEGER DEFAULT 1,
        difficulty VARCHAR(20) DEFAULT 'MEDIUM',
        tags TEXT[],
        order_index INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES instructors(id) ON DELETE SET NULL,
        created_by_role VARCHAR(50) DEFAULT 'TUTOR',
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS question_options (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        explanation TEXT
      );
    `)
    console.log('✅ Database migration checked: question_banks, questions, question_options tables verified.')

    // 10. Automatically ensure assessment_submissions table exists and has matching columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessment_submissions (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER REFERENCES question_banks(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        score NUMERIC DEFAULT 0,
        total_marks NUMERIC DEFAULT 0,
        status VARCHAR(50) DEFAULT 'SUBMITTED',
        answers JSONB,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure columns referenced in questionController queries exist safely
      ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS student_id INTEGER;
      ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS user_id INTEGER;
      ALTER TABLE assessment_submissions ADD COLUMN IF NOT EXISTS course_id VARCHAR(100);
    `)
    console.log('✅ Database migration checked: assessment_submissions table verified.')

    // 11. Automatically ensure leaderboard course mapping and columns exist on enrollments
    await pool.query(`
      ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS course_name VARCHAR(255);
      CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments (user_id, course_id);
    `)
    console.log('✅ Database migration checked: leaderboard enrollment mappings verified.')

  } catch (err) {
    console.error('❌ Migration execution error:', err.message)
  }
}

// Execute migrations on startup
runMigrations()

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
  getClient: () => pool.connect(),
  ...pool,
  pool,
}