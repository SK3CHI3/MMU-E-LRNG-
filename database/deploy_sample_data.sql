-- =============================================
-- MMU LMS Sample Data Deployment Script
-- This script adds sample data to the database
-- =============================================

-- Insert sample programmes
INSERT INTO programmes (id, code, title, level, faculty, department, duration_years, total_units) VALUES
('10000000-0000-0000-0000-000000000001', 'BSCS', 'Bachelor of Science in Computer Science', 'bachelors', 'Faculty of Computing and Information Technology', 'Computer Science', 4, 40),
('10000000-0000-0000-0000-000000000002', 'BSIT', 'Bachelor of Science in Information Technology', 'bachelors', 'Faculty of Computing and Information Technology', 'Information Technology', 4, 40),
('10000000-0000-0000-0000-000000000003', 'BSSE', 'Bachelor of Science in Software Engineering', 'bachelors', 'Faculty of Computing and Information Technology', 'Software Engineering', 4, 40),
('10000000-0000-0000-0000-000000000004', 'BCOM', 'Bachelor of Commerce', 'bachelors', 'Faculty of Business and Economics', 'Business Administration', 4, 40),
('10000000-0000-0000-0000-000000000005', 'MSIT', 'Master of Science in Information Technology', 'masters', 'Faculty of Computing and Information Technology', 'Information Technology', 2, 16)
ON CONFLICT (id) DO NOTHING;

-- Insert current academic calendar
INSERT INTO academic_calendar (id, academic_year, current_semester, semester_start_date, semester_end_date, registration_start_date, registration_end_date, is_current) VALUES
('20000000-0000-0000-0000-000000000001', '2024/2025', 'Semester 1', '2024-09-01', '2024-12-15', '2024-08-15', '2024-09-15', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample student fees for current academic year
INSERT INTO student_fees (student_id, academic_year, semester, total_fees, amount_paid, due_date, registration_threshold) VALUES
-- Computing students (using auth_id from sample users)
('00000000-0000-0000-0000-000000000006', '2024/2025', 'Semester 1', 120000.00, 72000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000007', '2024/2025', 'Semester 1', 120000.00, 84000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000008', '2024/2025', 'Semester 1', 120000.00, 96000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000009', '2024/2025', 'Semester 1', 120000.00, 48000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000010', '2024/2025', 'Semester 1', 120000.00, 60000.00, '2024-12-15', 60)
ON CONFLICT (student_id, academic_year, semester) DO NOTHING;

-- Insert sample payment records
INSERT INTO payment_history (student_id, amount, payment_method, reference_number, status, description, processed_at) VALUES
('00000000-0000-0000-0000-000000000006', 36000.00, 'mpesa', 'MMU1730000001-ABC123', 'completed', 'Semester 1 fees payment', '2024-09-15 10:30:00'),
('00000000-0000-0000-0000-000000000006', 36000.00, 'bank_transfer', 'MMU1730000002-DEF456', 'completed', 'Semester 1 fees payment', '2024-10-15 14:20:00'),
('00000000-0000-0000-0000-000000000007', 42000.00, 'mpesa', 'MMU1730000003-GHI789', 'completed', 'Semester 1 fees payment', '2024-09-10 09:15:00'),
('00000000-0000-0000-0000-000000000007', 42000.00, 'mpesa', 'MMU1730000004-JKL012', 'completed', 'Semester 1 fees payment', '2024-10-20 16:45:00'),
('00000000-0000-0000-0000-000000000008', 48000.00, 'bank_transfer', 'MMU1730000005-MNO345', 'completed', 'Semester 1 fees payment', '2024-09-05 11:00:00'),
('00000000-0000-0000-0000-000000000008', 48000.00, 'mpesa', 'MMU1730000006-PQR678', 'completed', 'Semester 1 fees payment', '2024-10-25 13:30:00')
ON CONFLICT (reference_number) DO NOTHING;

-- Update existing users with programme information (if they exist)
UPDATE users SET 
    programme_id = '10000000-0000-0000-0000-000000000001',
    current_semester = 7,
    year_of_study = 4
WHERE auth_id = '00000000-0000-0000-0000-000000000006';

UPDATE users SET 
    programme_id = '10000000-0000-0000-0000-000000000002',
    current_semester = 6,
    year_of_study = 3
WHERE auth_id = '00000000-0000-0000-0000-000000000007';

UPDATE users SET 
    programme_id = '10000000-0000-0000-0000-000000000003',
    current_semester = 5,
    year_of_study = 3
WHERE auth_id = '00000000-0000-0000-0000-000000000008';

UPDATE users SET 
    programme_id = '10000000-0000-0000-0000-000000000001',
    current_semester = 4,
    year_of_study = 2
WHERE auth_id = '00000000-0000-0000-0000-000000000009';

UPDATE users SET 
    programme_id = '10000000-0000-0000-0000-000000000002',
    current_semester = 3,
    year_of_study = 2
WHERE auth_id = '00000000-0000-0000-0000-000000000010';

-- Update existing courses with programme references (if they exist)
UPDATE courses SET programme_id = '10000000-0000-0000-0000-000000000001' WHERE code = 'CS301';
UPDATE courses SET programme_id = '10000000-0000-0000-0000-000000000001' WHERE code = 'CS205';
UPDATE courses SET programme_id = '10000000-0000-0000-0000-000000000003' WHERE code = 'CS401';
UPDATE courses SET programme_id = '10000000-0000-0000-0000-000000000001' WHERE code = 'CS102';
UPDATE courses SET programme_id = '10000000-0000-0000-0000-000000000002' WHERE code = 'CS350';
UPDATE courses SET programme_id = '10000000-0000-0000-0000-000000000004' WHERE code = 'BUS201';
UPDATE courses SET programme_id = '10000000-0000-0000-0000-000000000004' WHERE code = 'ACC101';
UPDATE courses SET programme_id = '10000000-0000-0000-0000-000000000004' WHERE code = 'ECO301';
