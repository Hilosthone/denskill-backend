const pool = require('./db')

const createTables = async () => {
  try {
    console.log('🔄 Initializing database tables...')

    // Enable UUID extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    // Create ENUM types safely (check if exists first or use DO blocks)
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE transaction_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    // 1. Courses Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          price NUMERIC(12, 2) NOT NULL,
          duration VARCHAR(100),
          instructor_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 2. Students Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          student_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(50) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
          role user_role DEFAULT 'STUDENT',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 3. Payments (Financial Summary Master Record)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
          total_fee NUMERIC(12, 2) NOT NULL,
          amount_paid NUMERIC(12, 2) DEFAULT 0.00,
          outstanding_balance NUMERIC(12, 2) NOT NULL,
          payment_status payment_status DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 4. Payment Installments (Individual Transaction Logs)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_installments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
          amount NUMERIC(12, 2) NOT NULL,
          reference VARCHAR(255) UNIQUE NOT NULL,
          gateway VARCHAR(50) DEFAULT 'PAYSTACK',
          status transaction_status DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 5. Receipts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS receipts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          student_id UUID REFERENCES students(id) ON DELETE CASCADE,
          payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
          receipt_number VARCHAR(100) UNIQUE NOT NULL,
          pdf_url TEXT NOT NULL,
          issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 6. Announcements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          target_course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 7. Community Links
    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_links (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE UNIQUE,
          whatsapp VARCHAR(255),
          telegram VARCHAR(255),
          discord VARCHAR(255),
          meet VARCHAR(255)
      );
    `)

    // Performance Indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
      CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
      CREATE INDEX IF NOT EXISTS idx_installments_ref ON payment_installments(reference);
    `)

    console.log('✨ All PostgreSQL tables and indexes created successfully!')
  } catch (error) {
    console.error('❌ Error initializing database tables:', error)
    process.exit(1)
  }
}

module.exports = createTables
