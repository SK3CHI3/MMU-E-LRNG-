-- =============================================
-- MMU LMS Database Deployment Script
-- This script applies the updated schema to Supabase
-- =============================================

-- First, add new columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS programme_id UUID,
ADD COLUMN IF NOT EXISTS current_semester INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS year_of_study INTEGER DEFAULT 1;

-- Create programmes table
CREATE TABLE IF NOT EXISTS programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) NOT NULL CHECK (level IN ('certificate', 'diploma', 'bachelors', 'masters', 'phd')),
    faculty VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    duration_years INTEGER NOT NULL DEFAULT 4,
    total_units INTEGER NOT NULL DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create academic calendar table
CREATE TABLE IF NOT EXISTS academic_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year VARCHAR(20) NOT NULL,
    current_semester VARCHAR(20) NOT NULL,
    semester_start_date DATE NOT NULL,
    semester_end_date DATE NOT NULL,
    registration_start_date DATE,
    registration_end_date DATE,
    exam_start_date DATE,
    exam_end_date DATE,
    is_current BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student fees table
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(auth_id),
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    total_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    due_date DATE,
    registration_threshold INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, academic_year, semester)
);

-- Create payment history table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(auth_id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('mpesa', 'bank_transfer', 'cash', 'cheque', 'card')),
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    phone_number VARCHAR(20),
    account_number VARCHAR(50),
    transaction_id VARCHAR(100),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to users table
ALTER TABLE users 
ADD CONSTRAINT fk_users_programme 
FOREIGN KEY (programme_id) REFERENCES programmes(id);

-- Add programme_id to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS programme_id UUID REFERENCES programmes(id);

-- Remove credit_hours column from courses if it exists
ALTER TABLE courses DROP COLUMN IF EXISTS credit_hours;

-- Enable RLS on new tables
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_programme_id ON users(programme_id);
CREATE INDEX IF NOT EXISTS idx_programmes_code ON programmes(code);
CREATE INDEX IF NOT EXISTS idx_programmes_faculty ON programmes(faculty);
CREATE INDEX IF NOT EXISTS idx_programmes_level ON programmes(level);
CREATE INDEX IF NOT EXISTS idx_academic_calendar_year ON academic_calendar(academic_year);
CREATE INDEX IF NOT EXISTS idx_academic_calendar_current ON academic_calendar(is_current);
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_academic_year ON student_fees(academic_year);
CREATE INDEX IF NOT EXISTS idx_student_fees_active ON student_fees(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_history_student_id ON payment_history(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_reference ON payment_history(reference_number);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- Create RLS policies for new tables
CREATE POLICY "All users can read programmes" ON programmes
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "All users can read academic calendar" ON academic_calendar
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Students can read own fees" ON student_fees
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can read all fees" ON student_fees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );

CREATE POLICY "Students can read own payment history" ON payment_history
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can insert own payments" ON payment_history
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can read all payment history" ON payment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER update_programmes_updated_at BEFORE UPDATE ON programmes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_calendar_updated_at BEFORE UPDATE ON academic_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_fees_updated_at BEFORE UPDATE ON student_fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at BEFORE UPDATE ON payment_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
