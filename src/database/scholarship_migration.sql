-- 1. Update existing users table to support scholarship tagging
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_type VARCHAR(50) DEFAULT 'NORMAL'; -- NORMAL | SCHOLARSHIP
ALTER TABLE users ADD COLUMN IF NOT EXISTS scholarship_status VARCHAR(50) DEFAULT NULL; -- PENDING | ACTIVE | COMPLETED | SUSPENDED
ALTER TABLE users ADD COLUMN IF NOT EXISTS cohort_id INT DEFAULT NULL;

-- 2. Create Scholarship Cohorts Table
CREATE TABLE IF NOT EXISTS scholarship_cohorts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Cohort 1"
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., "COHORT-1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    application_open_date DATE NOT NULL,
    application_close_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'UPCOMING', -- UPCOMING | APPLICATION_OPEN | APPLICATION_CLOSED | ACTIVE | COMPLETED | CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Scholarship Applications Table
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
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING | UNDER_REVIEW | APPROVED | REJECTED | AWAITING_PAYMENT | PAYMENT_COMPLETED | ENROLLED
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Scholarship Awards Table (Financial tracking)
CREATE TABLE IF NOT EXISTS scholarship_awards (
    id SERIAL PRIMARY KEY,
    application_id INT REFERENCES scholarship_applications(id) ON DELETE CASCADE,
    original_amount DECIMAL(10,2) DEFAULT 80000.00,
    student_contribution_percentage INT DEFAULT 20,
    student_amount DECIMAL(10,2) DEFAULT 16000.00,
    scholarship_amount DECIMAL(10,2) DEFAULT 64000.00,
    currency VARCHAR(10) DEFAULT 'NGN',
    payment_reference VARCHAR(100) UNIQUE,
    payment_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING | PAID | EXPIRED
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Scholarship Payments Table
CREATE TABLE IF NOT EXISTS scholarship_payments (
    id SERIAL PRIMARY KEY,
    application_id INT REFERENCES scholarship_applications(id) ON DELETE CASCADE,
    cohort_id INT REFERENCES scholarship_cohorts(id) ON DELETE CASCADE,
    reference VARCHAR(150) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    provider VARCHAR(50) DEFAULT 'FLUTTERWAVE',
    status VARCHAR(50) DEFAULT 'PENDING', -- SUCCESS | FAILED | PENDING
    payment_type VARCHAR(50) DEFAULT 'SCHOLARSHIP_CONTRIBUTION',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);