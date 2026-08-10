-- 1. Assessments Table (Handles Quizzes, Mid-term Assessments, and Assignments)
CREATE TYPE assessment_type AS ENUM ('quiz', 'assessment', 'assignment');

CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type assessment_type NOT NULL,
    total_marks INT NOT NULL DEFAULT 100,
    weight DECIMAL(5,2) NOT NULL, -- e.g., 25.00 for 25%
    created_by INT REFERENCES users(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Submissions Table (Handles student answers, code repos, or links)
CREATE TYPE submission_status AS ENUM ('submitted', 'graded', 'pending');

CREATE TABLE IF NOT EXISTS student_submissions (
    id SERIAL PRIMARY KEY,
    assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT, -- Stores quiz JSON answers, text notes, or GitHub/Vercel URLs
    score DECIMAL(5,2) DEFAULT NULL,
    feedback TEXT,
    graded_by INT REFERENCES users(id) ON DELETE SET NULL,
    status submission_status DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    CONSTRAINT unique_student_assessment UNIQUE (assessment_id, student_id)
);

-- 3. Attendance Tracking Table
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');

CREATE TABLE IF NOT EXISTS attendance_logs (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    logged_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_session_date UNIQUE (student_id, course_id, session_date)
);

-- 4. Instructors Table (Handles Tutor Authentication and Roles)
CREATE TABLE IF NOT EXISTS instructors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    role VARCHAR(100) DEFAULT 'Instructor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Courses Table (Core Course Catalog)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INT REFERENCES instructors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Enrollments Table (Tracks Student Course Memberships & Payment Status)
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    payment_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_course UNIQUE (user_id, course_id)
);

-- 7. Course Modules Table (Lecture Resources & Weekly Materials)
CREATE TYPE content_type_enum AS ENUM ('video', 'pdf', 'document', 'link', 'code');

CREATE TABLE IF NOT EXISTS course_modules (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    week_number INT NOT NULL,
    content_type content_type_enum NOT NULL DEFAULT 'video',
    resource_url TEXT NOT NULL,
    description TEXT,
    created_by INT REFERENCES instructors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Live Sessions Table (Virtual Office Hours & Live Lectures)
CREATE TYPE session_type_enum AS ENUM ('lecture', 'office_hours', 'workshop', 'seminar');

CREATE TABLE IF NOT EXISTS live_sessions (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    session_type session_type_enum NOT NULL DEFAULT 'lecture',
    meeting_link TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    tutor_id INT REFERENCES instructors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Course Announcements Table (Class Updates & Broadcasts)
CREATE TABLE IF NOT EXISTS course_announcements (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tutor_id INT REFERENCES instructors(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance querying on dashboards
CREATE INDEX idx_assessments_course ON assessments(course_id);
CREATE INDEX idx_submissions_student ON student_submissions(student_id);
CREATE INDEX idx_attendance_student_course ON attendance_logs(student_id, course_id);

-- Additional Performance Indexes for Foreign Keys & Joins
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_modules_course ON course_modules(course_id);
CREATE INDEX idx_live_sessions_course ON live_sessions(course_id);
CREATE INDEX idx_announcements_course ON course_announcements(course_id);

