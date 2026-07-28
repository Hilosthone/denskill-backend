// require('dotenv').config()
// const db = require('./db') // Imports the pool configuration from db.js

// const setupDatabase = async () => {
//   try {
//     console.log('🔄 Initializing database tables...')

//     // Add this to your database setup script or execute via migration
//     await db.query(`
//   CREATE TABLE IF NOT EXISTS enrollments (
//     id SERIAL PRIMARY KEY,
//     user_id INT REFERENCES users(id) ON DELETE CASCADE,
//     first_name VARCHAR(100) NOT NULL,
//     middle_name VARCHAR(100),
//     last_name VARCHAR(100) NOT NULL,
//     country VARCHAR(100) NOT NULL,
//     phone VARCHAR(50) NOT NULL,
//     email VARCHAR(255) NOT NULL,
//     course VARCHAR(150) NOT NULL,
//     reason TEXT,
//     referred_by VARCHAR(100),
//     total_amount DECIMAL(10, 2) NOT NULL,
//     amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
//     payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'partial', 'completed'
//     reference VARCHAR(255) UNIQUE,
//     expires_at TIMESTAMP, -- 4 weeks deadline for installments
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   );
// `)

//     console.log('✨ All PostgreSQL tables and indexes created successfully!')
//     process.exit(0)
//   } catch (err) {
//     console.error('❌ Error creating database tables:', err.message)
//     process.exit(1)
//   }
// }

// setupDatabase()

require('dotenv').config()
const db = require('./db') // Imports the pool configuration from db.js

const setupDatabase = async () => {
  try {
    console.log('🔄 Initializing database tables...')

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255), -- Nullable initially until they set a password after payment
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Create enrollments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        last_name VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        course VARCHAR(150) NOT NULL,
        reason TEXT,
        referred_by VARCHAR(100),
        total_amount DECIMAL(10, 2) NOT NULL,
        amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
        payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'partial', 'completed'
        reference VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP, -- 4 weeks deadline for installments
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    console.log('✨ All PostgreSQL tables and indexes created successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error creating database tables:', err.message)
    process.exit(1)
  }
}

setupDatabase()