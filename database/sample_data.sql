-- MMU LMS Sample Data
-- This script populates the database with sample data for testing

-- =============================================
-- SAMPLE PROGRAMMES
-- =============================================

-- Insert sample programmes based on real MMU data
INSERT INTO programmes (id, code, title, level, faculty, department, duration_years, total_units) VALUES
('10000000-0000-0000-0000-000000000001', 'BSCS', 'Bachelor of Science in Computer Science', 'bachelors', 'Faculty of Computing and Information Technology', 'Computer Science', 4, 40),
('10000000-0000-0000-0000-000000000002', 'BSIT', 'Bachelor of Science in Information Technology', 'bachelors', 'Faculty of Computing and Information Technology', 'Information Technology', 4, 40),
('10000000-0000-0000-0000-000000000003', 'BSSE', 'Bachelor of Science in Software Engineering', 'bachelors', 'Faculty of Computing and Information Technology', 'Software Engineering', 4, 40),
('10000000-0000-0000-0000-000000000004', 'BCOM', 'Bachelor of Commerce', 'bachelors', 'Faculty of Business and Economics', 'Business Administration', 4, 40),
('10000000-0000-0000-0000-000000000005', 'MSIT', 'Master of Science in Information Technology', 'masters', 'Faculty of Computing and Information Technology', 'Information Technology', 2, 16);

-- =============================================
-- SAMPLE ACADEMIC CALENDAR
-- =============================================

-- Insert current academic calendar
INSERT INTO academic_calendar (id, academic_year, current_semester, semester_start_date, semester_end_date, registration_start_date, registration_end_date, is_current) VALUES
('20000000-0000-0000-0000-000000000001', '2024/2025', 'Semester 1', '2024-09-01', '2024-12-15', '2024-08-15', '2024-09-15', true);

-- =============================================
-- SAMPLE USERS
-- =============================================

-- Note: In production, users are created through Supabase Auth
-- These are sample user records that would be created after authentication

-- Sample Admin User
INSERT INTO users (auth_id, email, full_name, role, department, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@mmu.ac.ke', 'Dr. John Admin', 'admin', 'Administration', '+254700000001', true);

-- Sample Dean User (Using real MMU faculty name)
INSERT INTO users (auth_id, email, full_name, role, department, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000002', 'dean.computing@mmu.ac.ke', 'Dr. Moses O. Odeo', 'dean', 'Faculty of Computing and Information Technology', '+254700000002', true);

-- Sample Lecturer Users (Using real MMU faculty name)
INSERT INTO users (auth_id, email, full_name, role, department, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000003', 'lecturer1@mmu.ac.ke', 'Dr. James Lecturer', 'lecturer', 'Faculty of Computing and Information Technology', '+254700000003', true),
('00000000-0000-0000-0000-000000000004', 'lecturer2@mmu.ac.ke', 'Dr. Sarah Professor', 'lecturer', 'Faculty of Computing and Information Technology', '+254700000004', true),
('00000000-0000-0000-0000-000000000005', 'lecturer3@mmu.ac.ke', 'Dr. Michael Teacher', 'lecturer', 'Faculty of Computing and Information Technology', '+254700000005', true);

-- Sample Student Users (Using real MMU faculty name and proper student IDs)
INSERT INTO users (auth_id, email, full_name, role, department, student_id, phone, programme_id, current_semester, year_of_study, is_active) VALUES
('00000000-0000-0000-0000-000000000006', 'student1@mmu.ac.ke', 'Alice Student', 'student', 'Faculty of Computing and Information Technology', 'FoCIT/2021/001', '+254700000006', '10000000-0000-0000-0000-000000000001', 7, 4, true),
('00000000-0000-0000-0000-000000000007', 'student2@mmu.ac.ke', 'Bob Learner', 'student', 'Faculty of Computing and Information Technology', 'FoCIT/2021/002', '+254700000007', '10000000-0000-0000-0000-000000000002', 6, 3, true),
('00000000-0000-0000-0000-000000000008', 'student3@mmu.ac.ke', 'Carol Scholar', 'student', 'Faculty of Computing and Information Technology', 'FoCIT/2021/003', '+254700000008', '10000000-0000-0000-0000-000000000003', 5, 3, true),
('00000000-0000-0000-0000-000000000009', 'student4@mmu.ac.ke', 'David Pupil', 'student', 'Faculty of Computing and Information Technology', 'FoCIT/2021/004', '+254700000009', '10000000-0000-0000-0000-000000000001', 4, 2, true),
('00000000-0000-0000-0000-000000000010', 'student5@mmu.ac.ke', 'Eve Undergraduate', 'student', 'Faculty of Computing and Information Technology', 'FoCIT/2021/005', '+254700000010', '10000000-0000-0000-0000-000000000002', 3, 2, true);

-- Additional users from other MMU faculties for diversity
INSERT INTO users (auth_id, email, full_name, role, department, phone, is_active) VALUES
-- Business Faculty Dean
('00000000-0000-0000-0000-000000000011', 'dean.business@mmu.ac.ke', 'Dr. Dorcas Kerre', 'dean', 'Faculty of Business and Economics', '+254700000011', true),
-- Business Faculty Lecturer
('00000000-0000-0000-0000-000000000012', 'lecturer.business@mmu.ac.ke', 'Dr. Business Lecturer', 'lecturer', 'Faculty of Business and Economics', '+254700000012', true);

-- Business Students
INSERT INTO users (auth_id, email, full_name, role, department, student_id, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000013', 'student.business1@mmu.ac.ke', 'Grace Business', 'student', 'Faculty of Business and Economics', 'FoBE/2021/001', '+254700000013', true),
('00000000-0000-0000-0000-000000000014', 'student.business2@mmu.ac.ke', 'John Commerce', 'student', 'Faculty of Business and Economics', 'FoBE/2021/002', '+254700000014', true);

-- Engineering Faculty Users
INSERT INTO users (auth_id, email, full_name, role, department, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000015', 'dean.engineering@mmu.ac.ke', 'Dr. Engineering Dean', 'dean', 'Faculty of Engineering and Technology', '+254700000015', true),
('00000000-0000-0000-0000-000000000016', 'lecturer.engineering@mmu.ac.ke', 'Dr. Engineering Lecturer', 'lecturer', 'Faculty of Engineering and Technology', '+254700000016', true);

-- Engineering Students
INSERT INTO users (auth_id, email, full_name, role, department, student_id, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000017', 'student.eng1@mmu.ac.ke', 'Peter Engineer', 'student', 'Faculty of Engineering and Technology', 'FoET/2021/001', '+254700000017', true),
('00000000-0000-0000-0000-000000000018', 'student.eng2@mmu.ac.ke', 'Mary Mechanical', 'student', 'Faculty of Engineering and Technology', 'FoET/2021/002', '+254700000018', true);

-- =============================================
-- SAMPLE COURSES
-- =============================================

INSERT INTO courses (id, code, title, description, department, level, semester, year, max_students, programme_id, created_by, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 'CS301', 'Data Structures and Algorithms', 'Comprehensive study of fundamental data structures and algorithms including arrays, linked lists, stacks, queues, trees, graphs, and sorting/searching algorithms.', 'Faculty of Computing and Information Technology', 'undergraduate', 'fall', 2024, 50, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),
('10000000-0000-0000-0000-000000000002', 'CS205', 'Database Management Systems', 'Introduction to database concepts, relational model, SQL, database design, normalization, and database administration.', 'Faculty of Computing and Information Technology', 'undergraduate', 'fall', 2024, 45, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', true),
('10000000-0000-0000-0000-000000000003', 'CS401', 'Software Engineering', 'Software development lifecycle, project management, requirements analysis, system design, testing, and maintenance.', 'Faculty of Computing and Information Technology', 'undergraduate', 'fall', 2024, 40, '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', true),
('10000000-0000-0000-0000-000000000004', 'CS102', 'Introduction to Programming', 'Basic programming concepts using Python, including variables, control structures, functions, and object-oriented programming.', 'Faculty of Computing and Information Technology', 'undergraduate', 'fall', 2024, 60, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),
('10000000-0000-0000-0000-000000000005', 'CS350', 'Computer Networks', 'Network protocols, OSI model, TCP/IP, network security, and network administration.', 'Faculty of Computing and Information Technology', 'undergraduate', 'spring', 2024, 35, '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', true);

-- Additional courses from other MMU faculties
INSERT INTO courses (id, code, title, description, department, level, semester, year, max_students, programme_id, created_by, is_active) VALUES
-- Business Faculty Courses
('10000000-0000-0000-0000-000000000006', 'BUS201', 'Principles of Management', 'Introduction to management principles, organizational behavior, and leadership concepts in modern business environments.', 'Faculty of Business and Economics', 'undergraduate', 'fall', 2024, 40, '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', true),
('10000000-0000-0000-0000-000000000007', 'ACC101', 'Financial Accounting', 'Fundamentals of financial accounting including recording transactions, preparing financial statements, and basic financial analysis.', 'Faculty of Business and Economics', 'undergraduate', 'fall', 2024, 45, '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', true),
('10000000-0000-0000-0000-000000000008', 'ECO301', 'Microeconomics', 'Advanced study of microeconomic theory including consumer behavior, market structures, and resource allocation.', 'Faculty of Business and Economics', 'undergraduate', 'spring', 2024, 30, '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000012', true);

-- =============================================
-- SAMPLE COURSE ENROLLMENTS
-- =============================================

-- Enroll students in courses
INSERT INTO course_enrollments (user_id, course_id, status, enrollment_date) VALUES
-- Alice Student enrollments
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'enrolled', '2024-01-15'),
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'enrolled', '2024-01-15'),
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'enrolled', '2024-01-15'),

-- Bob Learner enrollments
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'enrolled', '2024-01-16'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'enrolled', '2024-01-16'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'enrolled', '2024-01-16'),

-- Carol Scholar enrollments
('00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'enrolled', '2024-01-17'),
('00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'enrolled', '2024-01-17'),
('00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 'enrolled', '2024-01-17'),

-- David Pupil enrollments
('00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'enrolled', '2024-01-18'),
('00000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', 'enrolled', '2024-01-18'),

-- Eve Undergraduate enrollments
('00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', 'enrolled', '2024-01-19'),
('00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'enrolled', '2024-01-19'),
('00000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'enrolled', '2024-01-19');

-- Business Students enrollments
INSERT INTO course_enrollments (user_id, course_id, status, enrollment_date) VALUES
-- Grace Business enrollments
('00000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000006', 'enrolled', '2024-01-20'),
('00000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000007', 'enrolled', '2024-01-20'),

-- John Commerce enrollments
('00000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000006', 'enrolled', '2024-01-21'),
('00000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000008', 'enrolled', '2024-01-21');

-- Engineering Students enrollments
INSERT INTO course_enrollments (user_id, course_id, status, enrollment_date) VALUES
-- Peter Engineer enrollments
('00000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000009', 'enrolled', '2024-01-22'),
('00000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000010', 'enrolled', '2024-01-22'),

-- Mary Mechanical enrollments
('00000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000009', 'enrolled', '2024-01-23'),
('00000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000011', 'enrolled', '2024-01-23');

-- =============================================
-- SAMPLE ASSIGNMENTS
-- =============================================

INSERT INTO assignments (id, course_id, title, description, instructions, due_date, total_points, assignment_type, created_by, is_published) VALUES
-- CS301 Assignments
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Binary Tree Implementation', 'Implement a binary search tree with insertion, deletion, and traversal operations.', 'Create a complete binary search tree class in Python with proper documentation and test cases.', '2024-02-15 23:59:00', 100, 'homework', '00000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Algorithm Analysis Quiz', 'Quiz on Big O notation and algorithm complexity analysis.', 'Complete the online quiz covering time and space complexity analysis.', '2024-02-20 23:59:00', 50, 'quiz', '00000000-0000-0000-0000-000000000003', true),

-- CS205 Assignments
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Database Design Project', 'Design and implement a database for a library management system.', 'Create an ER diagram, normalize the database, and implement using SQL.', '2024-02-25 23:59:00', 150, 'project', '00000000-0000-0000-0000-000000000004', true),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'SQL Queries Assignment', 'Practice complex SQL queries and joins.', 'Complete the provided SQL exercises using the sample database.', '2024-02-18 23:59:00', 75, 'homework', '00000000-0000-0000-0000-000000000004', true),

-- CS401 Assignments
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Software Requirements Document', 'Create a comprehensive software requirements specification.', 'Analyze the given case study and create a detailed SRS document following IEEE standards.', '2024-03-01 23:59:00', 120, 'project', '00000000-0000-0000-0000-000000000005', true);

-- =============================================
-- SAMPLE ASSIGNMENT SUBMISSIONS
-- =============================================

INSERT INTO assignment_submissions (assignment_id, user_id, submission_text, submitted_at, is_late, grade, percentage, feedback, graded_by, graded_at, status) VALUES
-- Binary Tree Implementation submissions
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 'Submitted binary tree implementation with all required methods.', '2024-02-14 20:30:00', false, 92, 92.0, 'Excellent implementation with good documentation. Minor optimization possible in deletion method.', '00000000-0000-0000-0000-000000000003', '2024-02-16 10:00:00', 'graded'),
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', 'Binary tree implementation completed.', '2024-02-15 22:45:00', false, 85, 85.0, 'Good work overall. Some edge cases not handled properly.', '00000000-0000-0000-0000-000000000003', '2024-02-16 10:15:00', 'graded'),
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000009', 'Submitted assignment with basic implementation.', '2024-02-16 01:30:00', true, 78, 78.0, 'Late submission. Implementation is correct but lacks proper documentation.', '00000000-0000-0000-0000-000000000003', '2024-02-16 10:30:00', 'graded'),

-- Algorithm Analysis Quiz submissions
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'Quiz completed online.', '2024-02-19 15:30:00', false, 48, 96.0, 'Perfect understanding of complexity analysis.', '00000000-0000-0000-0000-000000000003', '2024-02-19 16:00:00', 'graded'),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', 'Quiz completed online.', '2024-02-20 14:15:00', false, 42, 84.0, 'Good understanding with minor conceptual errors.', '00000000-0000-0000-0000-000000000003', '2024-02-20 16:00:00', 'graded'),

-- SQL Queries Assignment submissions
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'All SQL queries completed and tested.', '2024-02-17 19:00:00', false, 70, 93.3, 'Excellent SQL skills demonstrated. All queries work correctly.', '00000000-0000-0000-0000-000000000004', '2024-02-18 09:00:00', 'graded'),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'SQL assignment submission.', '2024-02-18 21:30:00', false, 65, 86.7, 'Good work. Some complex joins could be optimized.', '00000000-0000-0000-0000-000000000004', '2024-02-19 09:00:00', 'graded'),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000009', 'Completed SQL exercises.', '2024-02-18 23:45:00', false, 58, 77.3, 'Basic queries correct. Need improvement in complex joins and subqueries.', '00000000-0000-0000-0000-000000000004', '2024-02-19 09:15:00', 'graded');

-- =============================================
-- SAMPLE COURSE MATERIALS
-- =============================================

INSERT INTO course_materials (id, course_id, title, description, type, url, tags, is_public, created_by) VALUES
-- CS301 Materials
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Introduction to Binary Trees', 'Comprehensive guide to binary tree data structures with examples and exercises.', 'document', 'https://example.com/binary-trees.pdf', ARRAY['data-structures', 'trees', 'algorithms'], true, '00000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Algorithm Complexity Analysis', 'Detailed analysis of Big O notation and algorithm complexity.', 'document', 'https://example.com/complexity-analysis.pdf', ARRAY['algorithms', 'complexity', 'big-o'], true, '00000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Sorting Algorithms Video Lecture', 'Video lecture covering various sorting algorithms and their implementations.', 'video', 'https://example.com/sorting-lecture.mp4', ARRAY['sorting', 'algorithms', 'video'], false, '00000000-0000-0000-0000-000000000003'),

-- CS205 Materials
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Database Normalization Guide', 'Complete guide to database normalization including 1NF, 2NF, and 3NF with examples.', 'document', 'https://example.com/normalization.pdf', ARRAY['database', 'normalization', 'design'], true, '00000000-0000-0000-0000-000000000004'),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'SQL Query Examples', 'Collection of SQL query examples for practice and reference.', 'document', 'https://example.com/sql-examples.sql', ARRAY['sql', 'database', 'queries'], true, '00000000-0000-0000-0000-000000000004'),

-- CS401 Materials
('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Software Development Lifecycle', 'Presentation slides covering SDLC methodologies including Agile and Waterfall.', 'document', 'https://example.com/sdlc-presentation.pptx', ARRAY['software-engineering', 'sdlc', 'agile'], false, '00000000-0000-0000-0000-000000000005'),
('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Requirements Engineering Handbook', 'Comprehensive handbook on software requirements engineering and analysis.', 'document', 'https://example.com/requirements-handbook.pdf', ARRAY['requirements', 'analysis', 'engineering'], true, '00000000-0000-0000-0000-000000000005');

-- =============================================
-- SAMPLE ANNOUNCEMENTS
-- =============================================

INSERT INTO announcements (id, title, content, course_id, priority, is_public, created_by, category, external_link, expires_at) VALUES
-- Course-specific announcements
('40000000-0000-0000-0000-000000000001', 'Welcome to Data Structures and Algorithms', 'Welcome to CS301! Please review the course syllabus and prepare for our first lab session next week.', '10000000-0000-0000-0000-000000000001', 'normal', false, '00000000-0000-0000-0000-000000000003', 'academic', null, null),
('40000000-0000-0000-0000-000000000002', 'Assignment 1 Due Date Reminder', 'Reminder: Binary Tree Implementation assignment is due this Friday at 11:59 PM. Please submit through the course portal.', '10000000-0000-0000-0000-000000000001', 'high', false, '00000000-0000-0000-0000-000000000003', 'academic', null, null),
('40000000-0000-0000-0000-000000000003', 'Database Lab Schedule Change', 'The database lab scheduled for Thursday has been moved to Friday 2:00 PM in Lab 204.', '10000000-0000-0000-0000-000000000002', 'high', false, '00000000-0000-0000-0000-000000000004', 'academic', null, null),
('40000000-0000-0000-0000-000000000005', 'Software Engineering Project Guidelines', 'Updated project guidelines and rubric have been posted. Please review before starting your final project.', '10000000-0000-0000-0000-000000000003', 'normal', false, '00000000-0000-0000-0000-000000000005', 'academic', null, null),

-- Public announcements for landing page
('40000000-0000-0000-0000-000000000004', 'New Academic Year Registration Open', 'Registration for the new academic year 2024/2025 is now open. Students can apply online through the MMU portal.', NULL, 'high', true, '00000000-0000-0000-0000-000000000001', 'academic', 'https://www.mmu.ac.ke/admissions/', '2024-12-31 23:59:59+00'),
('40000000-0000-0000-0000-000000000006', 'MMU Digital Campus Launch', 'We are excited to announce the launch of MMU Digital Campus - your gateway to modern education with AI-powered learning and real-time collaboration.', NULL, 'medium', true, '00000000-0000-0000-0000-000000000001', 'announcement', null, null),
('40000000-0000-0000-0000-000000000007', 'Annual Research Conference 2024', 'MMU will host the Annual Research Conference on December 15-16, 2024. Faculty and students are invited to submit their research abstracts.', NULL, 'medium', true, '00000000-0000-0000-0000-000000000001', 'research', 'https://www.mmu.ac.ke/research/', '2024-12-10 23:59:59+00'),
('40000000-0000-0000-0000-000000000008', 'Library Services Enhancement', 'The MMU Library has extended its operating hours and introduced new digital resources including e-books and online databases.', NULL, 'low', true, '00000000-0000-0000-0000-000000000001', 'services', null, null),
('40000000-0000-0000-0000-000000000009', 'Career Fair 2024', 'Join us for the MMU Career Fair on November 20-21, 2024. Connect with top employers and explore career opportunities in technology and business.', NULL, 'high', true, '00000000-0000-0000-0000-000000000001', 'career', null, '2024-11-25 23:59:59+00'),
('40000000-0000-0000-0000-000000000010', 'System Maintenance Notice', 'The MMU Digital Campus will undergo scheduled maintenance on Saturday, November 16, 2024, from 2:00 AM to 4:00 AM. Services may be temporarily unavailable.', NULL, 'urgent', true, '00000000-0000-0000-0000-000000000001', 'system', null, '2024-11-17 06:00:00+00');

-- =============================================
-- SAMPLE CLASS SESSIONS
-- =============================================

INSERT INTO class_sessions (id, course_id, title, description, session_date, start_time, end_time, location, is_online, meeting_link, session_type, status, created_by) VALUES
-- CS301 Data Structures sessions (spread across the week)
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Introduction to Data Structures', 'Overview of fundamental data structures and their applications', '2024-11-18', '09:00:00', '10:30:00', 'Room 201, Computer Science Building', false, null, 'lecture', 'scheduled', '00000000-0000-0000-0000-000000000003'),
('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Binary Trees Lab', 'Hands-on implementation of binary tree data structures', '2024-11-19', '14:00:00', '16:00:00', 'Computer Lab 1', false, null, 'lab', 'scheduled', '00000000-0000-0000-0000-000000000003'),
('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Algorithm Analysis', 'Time and space complexity analysis of algorithms', '2024-11-20', '10:00:00', '11:30:00', 'Room 201, Computer Science Building', false, null, 'lecture', 'scheduled', '00000000-0000-0000-0000-000000000003'),

-- CS205 Database sessions
('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Database Design Principles', 'Introduction to relational database design and normalization', '2024-11-18', '14:00:00', '15:30:00', 'Room 305, Engineering Building', false, null, 'lecture', 'scheduled', '00000000-0000-0000-0000-000000000004'),
('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'SQL Queries Workshop', 'Practical session on writing complex SQL queries', '2024-11-21', '09:00:00', '11:00:00', 'Computer Lab 2', false, null, 'lab', 'scheduled', '00000000-0000-0000-0000-000000000004'),

-- CS401 Software Engineering sessions (some online)
('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Software Development Lifecycle', 'Overview of SDLC methodologies including Agile and Waterfall', '2024-11-19', '10:00:00', '11:30:00', null, true, 'https://zoom.us/j/123456789', 'lecture', 'scheduled', '00000000-0000-0000-0000-000000000005'),
('50000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Project Planning Session', 'Team formation and project planning for final project', '2024-11-21', '14:00:00', '16:00:00', 'Room 401, Engineering Building', false, null, 'tutorial', 'scheduled', '00000000-0000-0000-0000-000000000005'),

-- CS102 Programming sessions
('50000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Python Fundamentals', 'Introduction to Python programming language', '2024-11-18', '11:00:00', '12:30:00', 'Room 101, Computer Science Building', false, null, 'lecture', 'scheduled', '00000000-0000-0000-0000-000000000003'),
('50000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', 'Programming Lab', 'Hands-on Python programming exercises', '2024-11-20', '15:00:00', '17:00:00', 'Computer Lab 3', false, null, 'lab', 'scheduled', '00000000-0000-0000-0000-000000000003'),

-- CS350 Networks sessions
('50000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'Network Protocols', 'Introduction to TCP/IP and network protocols', '2024-11-20', '13:00:00', '14:30:00', 'Room 203, Computer Science Building', false, null, 'lecture', 'scheduled', '00000000-0000-0000-0000-000000000004'),

-- Sample cancelled session
('50000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'Advanced Algorithms', 'Advanced algorithm design techniques', '2024-11-22', '09:00:00', '10:30:00', 'Room 201, Computer Science Building', false, null, 'lecture', 'cancelled', '00000000-0000-0000-0000-000000000003'),

-- Additional sessions for better week view testing
('50000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'Data Structures Review', 'Review session for midterm exam', '2024-11-25', '11:00:00', '12:30:00', 'Room 201, Computer Science Building', false, null, 'tutorial', 'scheduled', '00000000-0000-0000-0000-000000000003'),
('50000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000002', 'Database Project Presentation', 'Student project presentations', '2024-11-26', '13:00:00', '15:00:00', null, true, 'https://zoom.us/j/987654321', 'seminar', 'scheduled', '00000000-0000-0000-0000-000000000004'),
('50000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000003', 'Software Testing Workshop', 'Hands-on testing methodologies', '2024-11-27', '10:00:00', '12:00:00', 'Computer Lab 1', false, null, 'lab', 'scheduled', '00000000-0000-0000-0000-000000000005'),
('50000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004', 'Python Advanced Topics', 'Advanced Python programming concepts', '2024-11-28', '14:00:00', '16:00:00', 'Room 101, Computer Science Building', false, null, 'lecture', 'scheduled', '00000000-0000-0000-0000-000000000003'),
('50000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000005', 'Network Security Lab', 'Practical network security exercises', '2024-11-29', '09:00:00', '11:00:00', 'Security Lab', false, null, 'lab', 'scheduled', '00000000-0000-0000-0000-000000000004');

-- =============================================
-- SAMPLE ANALYTICS DATA
-- =============================================

-- Generate some sample analytics data for the past month
INSERT INTO analytics_data (user_id, course_id, activity_type, created_at) VALUES
-- Student login activities
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'login', '2024-01-20 09:00:00'),
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'material_view', '2024-01-20 09:15:00'),
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'assignment_view', '2024-01-20 09:30:00'),
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'login', '2024-01-21 10:00:00'),
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'material_download', '2024-01-21 10:15:00'),

('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'login', '2024-01-20 14:00:00'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'assignment_submission', '2024-01-20 14:30:00'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'login', '2024-01-22 11:00:00'),
('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'material_view', '2024-01-22 11:15:00'),

('00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'login', '2024-01-21 16:00:00'),
('00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'material_view', '2024-01-21 16:10:00'),
('00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'login', '2024-01-23 13:00:00'),
('00000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'assignment_view', '2024-01-23 13:20:00');

-- =============================================
-- SAMPLE STUDENT FEES
-- =============================================

-- Insert sample student fees for current academic year
INSERT INTO student_fees (student_id, academic_year, semester, total_fees, amount_paid, due_date, registration_threshold) VALUES
-- Computing students
('00000000-0000-0000-0000-000000000006', '2024/2025', 'Semester 1', 120000.00, 72000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000007', '2024/2025', 'Semester 1', 120000.00, 84000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000008', '2024/2025', 'Semester 1', 120000.00, 96000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000009', '2024/2025', 'Semester 1', 120000.00, 48000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000010', '2024/2025', 'Semester 1', 120000.00, 60000.00, '2024-12-15', 60),

-- Business students
('00000000-0000-0000-0000-000000000013', '2024/2025', 'Semester 1', 110000.00, 77000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000014', '2024/2025', 'Semester 1', 110000.00, 55000.00, '2024-12-15', 60),

-- Engineering students
('00000000-0000-0000-0000-000000000017', '2024/2025', 'Semester 1', 130000.00, 91000.00, '2024-12-15', 60),
('00000000-0000-0000-0000-000000000018', '2024/2025', 'Semester 1', 130000.00, 65000.00, '2024-12-15', 60);

-- =============================================
-- SAMPLE PAYMENT HISTORY
-- =============================================

-- Insert sample payment records
INSERT INTO payment_history (student_id, amount, payment_method, reference_number, status, description, processed_at) VALUES
('00000000-0000-0000-0000-000000000006', 36000.00, 'mpesa', 'MMU1730000001-ABC123', 'completed', 'Semester 1 fees payment', '2024-09-15 10:30:00'),
('00000000-0000-0000-0000-000000000006', 36000.00, 'bank_transfer', 'MMU1730000002-DEF456', 'completed', 'Semester 1 fees payment', '2024-10-15 14:20:00'),
('00000000-0000-0000-0000-000000000007', 42000.00, 'mpesa', 'MMU1730000003-GHI789', 'completed', 'Semester 1 fees payment', '2024-09-10 09:15:00'),
('00000000-0000-0000-0000-000000000007', 42000.00, 'mpesa', 'MMU1730000004-JKL012', 'completed', 'Semester 1 fees payment', '2024-10-20 16:45:00'),
('00000000-0000-0000-0000-000000000008', 48000.00, 'bank_transfer', 'MMU1730000005-MNO345', 'completed', 'Semester 1 fees payment', '2024-09-05 11:00:00'),
('00000000-0000-0000-0000-000000000008', 48000.00, 'mpesa', 'MMU1730000006-PQR678', 'completed', 'Semester 1 fees payment', '2024-10-25 13:30:00');

-- =============================================
-- UPDATE COURSES WITH INSTRUCTOR ASSIGNMENTS
-- =============================================


