-- AylaHR Database Schema for NeonDB
-- Run this SQL in your NeonDB console to create all tables

-- ================================
-- USERS TABLE (Synced with Clerk)
-- ================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    department_id BIGINT REFERENCES departments(id),
    position_id BIGINT REFERENCES positions(id),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- DEPARTMENTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- POSITIONS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS positions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    department_id BIGINT REFERENCES departments(id),
    access_level VARCHAR(50) NOT NULL DEFAULT 'own_only',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- LEAVE TYPES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS leave_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    annual_limit INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- LEAVE REQUESTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS leaves (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    attachment TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approved_by BIGINT REFERENCES users(id),
    approved_at TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================
-- LEAVE BALANCES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS leave_balances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    total_days INTEGER NOT NULL DEFAULT 0,
    used_days INTEGER NOT NULL DEFAULT 0,
    remaining_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, leave_type, year)
);

-- ================================
-- INDEXES
-- ================================
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leaves_user_id ON leaves(user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_positions_department ON positions(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);

-- ================================
-- DEFAULT DATA
-- ================================

-- Insert default leave types
INSERT INTO leave_types (name, code, is_paid, annual_limit) VALUES
    ('Cuti Tahunan', 'annual', true, 12),
    ('Cuti Sakit', 'sick', true, 10),
    ('Cuti Melahirkan', 'maternity', true, 90),
    ('Cuti Pernikahan', 'marriage', true, 3),
    ('Cuti Kematian', 'bereavement', true, 3),
    ('Cuti Baptis/Sunatan', 'baptism', true, 2),
    ('Cuti Berbayar', 'paid_leave', true, 5),
    ('Cuti Tidak Berbayar', 'unpaid_leave', false, 0)
ON CONFLICT (code) DO NOTHING;

-- Insert default departments
INSERT INTO departments (name, code, description) VALUES
    ('Human Resources', 'HR', 'Human Resources Department'),
    ('Engineering', 'ENG', 'Engineering Department'),
    ('Marketing', 'MKT', 'Marketing Department'),
    ('Sales', 'SLS', 'Sales Department'),
    ('Finance', 'FIN', 'Finance Department'),
    ('Operations', 'OPS', 'Operations Department')
ON CONFLICT (code) DO NOTHING;

-- Insert default positions
INSERT INTO positions (name, level, department_id, access_level) VALUES
    ('HR Manager', 1, (SELECT id FROM departments WHERE code = 'HR'), 'full'),
    ('HR Staff', 2, (SELECT id FROM departments WHERE code = 'HR'), 'manage_team'),
    ('Software Engineer', 2, (SELECT id FROM departments WHERE code = 'ENG'), 'own_only'),
    ('Senior Software Engineer', 1, (SELECT id FROM departments WHERE code = 'ENG'), 'manage_team'),
    ('Engineering Manager', 1, (SELECT id FROM departments WHERE code = 'ENG'), 'full'),
    ('Marketing Manager', 1, (SELECT id FROM departments WHERE code = 'MKT'), 'full'),
    ('Marketing Staff', 2, (SELECT id FROM departments WHERE code = 'MKT'), 'own_only'),
    ('Sales Manager', 1, (SELECT id FROM departments WHERE code = 'SLS'), 'full'),
    ('Sales Executive', 2, (SELECT id FROM departments WHERE code = 'SLS'), 'own_only')
ON CONFLICT DO NOTHING;

-- ================================
-- VIEWS (Optional)
-- ================================

-- View for employee list with department and position
CREATE OR REPLACE VIEW v_employees AS
SELECT 
    u.id,
    u.clerk_id,
    u.email,
    u.name,
    u.role,
    u.language,
    u.is_active,
    u.created_at,
    d.name AS department,
    p.name AS position,
    p.level AS position_level
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN positions p ON u.position_id = p.id;

-- View for leave requests with user details
CREATE OR REPLACE VIEW v_leave_requests AS
SELECT 
    l.id,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.total_days,
    l.reason,
    l.status,
    l.created_at,
    u.name AS employee_name,
    u.email AS employee_email,
    d.name AS department,
    p.name AS position,
    au.name AS approved_by_name
FROM leaves l
JOIN users u ON l.user_id = u.id
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN positions p ON u.position_id = p.id
LEFT JOIN users au ON l.approved_by = au.id;

-- ================================
-- FUNCTIONS (Optional)
-- ================================

-- Function to calculate working days between dates (excluding weekends)
CREATE OR REPLACE FUNCTION calculate_working_days(start_date TEXT, end_date TEXT)
RETURNS INTEGER AS $$
DECLARE
    working_days INTEGER := 0;
    current_date DATE := start_date::DATE;
BEGIN
    WHILE current_date <= end_date::DATE LOOP
        IF EXTRACT(DOW FROM current_date) NOT IN (0, 6) THEN
            working_days := working_days + 1;
        END IF;
        current_date := current_date + 1;
    END LOOP;
    RETURN working_days;
END;
$$ LANGUAGE plpgsql;

-- Function to update leave balance when leave is approved
CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE leave_balances 
        SET used_days = used_days + NEW.total_days,
            remaining_days = remaining_days - NEW.total_days
        WHERE user_id = NEW.user_id 
          AND leave_type = NEW.leave_type 
          AND year = EXTRACT(YEAR FROM NEW.start_date)::int;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for leave balance update
DROP TRIGGER IF EXISTS trigger_update_leave_balance ON leaves;
CREATE TRIGGER trigger_update_leave_balance
    AFTER UPDATE ON leaves
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_balance();

-- Function to create initial leave balance for new user
CREATE OR REPLACE FUNCTION create_user_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO leave_balances (user_id, leave_type, year, total_days, used_days, remaining_days)
    SELECT 
        NEW.id,
        lt.code,
        EXTRACT(YEAR FROM CURRENT_DATE)::int,
        lt.annual_limit,
        0,
        lt.annual_limit
    FROM leave_types lt
    WHERE lt.is_active = true AND lt.is_paid = true
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for creating leave balance
DROP TRIGGER IF EXISTS trigger_create_leave_balance ON users;
CREATE TRIGGER trigger_create_leave_balance
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_leave_balance();

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO ayla_hr_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO ayla_hr_user;
