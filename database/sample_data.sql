-- MMU LMS Sample Data
-- This script populates the database with sample data for testing

-- =============================================
-- SAMPLE USERS
-- =============================================

-- Note: In production, users are created through Supabase Auth
-- These are sample user records that would be created after authentication

-- Sample Admin User
INSERT INTO users (auth_id, email, full_name, role, department, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@mmu.ac.ke', 'Dr. John Admin', 'admin', 'Administration', '+254700000001', true);

-- Sample Dean User
INSERT INTO users (auth_id, email, full_name, role, department, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000002', 'dean.computing@mmu.ac.ke', 'Prof. Mary Dean', 'dean', 'Faculty of Computing & IT', '+254700000002', true);

-- Sample Lecturer Users
INSERT INTO users (auth_id, email, full_name, role, department, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000003', 'lecturer1@mmu.ac.ke', 'Dr. James Lecturer', 'lecturer', 'Faculty of Computing & IT', '+254700000003', true),
('00000000-0000-0000-0000-000000000004', 'lecturer2@mmu.ac.ke', 'Dr. Sarah Professor', 'lecturer', 'Faculty of Computing & IT', '+254700000004', true),
('00000000-0000-0000-0000-000000000005', 'lecturer3@mmu.ac.ke', 'Dr. Michael Teacher', 'lecturer', 'Faculty of Computing & IT', '+254700000005', true);

-- Sample Student Users
INSERT INTO users (auth_id, email, full_name, role, department, student_id, phone, is_active) VALUES
('00000000-0000-0000-0000-000000000006', 'student1@mmu.ac.ke', 'Alice Student', 'student', 'Faculty of Computing & IT', 'CS2021001', '+254700000006', true),
('00000000-0000-0000-0000-000000000007', 'student2@mmu.ac.ke', 'Bob Learner', 'student', 'Faculty of Computing & IT', 'CS2021002', '+254700000007', true),
('00000000-0000-0000-0000-000000000008', 'student3@mmu.ac.ke', 'Carol Scholar', 'student', 'Faculty of Computing & IT', 'CS2021003', '+254700000008', true),
('00000000-0000-0000-0000-000000000009', 'student4@mmu.ac.ke', 'David Pupil', 'student', 'Faculty of Computing & IT', 'CS2021004', '+254700000009', true),
('00000000-0000-0000-0000-000000000010', 'student5@mmu.ac.ke', 'Eve Undergraduate', 'student', 'Faculty of Computing & IT', 'CS2021005', '+254700000010', true);

-- =============================================
-- SAMPLE COURSES
-- =============================================

INSERT INTO courses (id, code, title, description, credit_hours, department, level, semester, year, max_students, created_by, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 'CS301', 'Data Structures and Algorithms', 'Comprehensive study of fundamental data structures and algorithms including arrays, linked lists, stacks, queues, trees, graphs, and sorting/searching algorithms.', 3, 'Faculty of Computing & IT', 'undergraduate', 'fall', 2024, 50, '00000000-0000-0000-0000-000000000003', true),
('10000000-0000-0000-0000-000000000002', 'CS205', 'Database Management Systems', 'Introduction to database concepts, relational model, SQL, database design, normalization, and database administration.', 3, 'Faculty of Computing & IT', 'undergraduate', 'fall', 2024, 45, '00000000-0000-0000-0000-000000000004', true),
('10000000-0000-0000-0000-000000000003', 'CS401', 'Software Engineering', 'Software development lifecycle, project management, requirements analysis, system design, testing, and maintenance.', 4, 'Faculty of Computing & IT', 'undergraduate', 'fall', 2024, 40, '00000000-0000-0000-0000-000000000005', true),
('10000000-0000-0000-0000-000000000004', 'CS102', 'Introduction to Programming', 'Basic programming concepts using Python, including variables, control structures, functions, and object-oriented programming.', 3, 'Faculty of Computing & IT', 'undergraduate', 'fall', 2024, 60, '00000000-0000-0000-0000-000000000003', true),
('10000000-0000-0000-0000-000000000005', 'CS350', 'Computer Networks', 'Network protocols, OSI model, TCP/IP, network security, and network administration.', 3, 'Faculty of Computing & IT', 'undergraduate', 'spring', 2024, 35, '00000000-0000-0000-0000-000000000004', true);

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

INSERT INTO announcements (id, title, content, course_id, priority, is_public, created_by) VALUES
('40000000-0000-0000-0000-000000000001', 'Welcome to Data Structures and Algorithms', 'Welcome to CS301! Please review the course syllabus and prepare for our first lab session next week.', '10000000-0000-0000-0000-000000000001', 'normal', false, '00000000-0000-0000-0000-000000000003'),
('40000000-0000-0000-0000-000000000002', 'Assignment 1 Due Date Reminder', 'Reminder: Binary Tree Implementation assignment is due this Friday at 11:59 PM. Please submit through the course portal.', '10000000-0000-0000-0000-000000000001', 'high', false, '00000000-0000-0000-0000-000000000003'),
('40000000-0000-0000-0000-000000000003', 'Database Lab Schedule Change', 'The database lab scheduled for Thursday has been moved to Friday 2:00 PM in Lab 204.', '10000000-0000-0000-0000-000000000002', 'high', false, '00000000-0000-0000-0000-000000000004'),
('40000000-0000-0000-0000-000000000004', 'New Academic Year Registration', 'Registration for the new academic year is now open. Please visit the registrar office or use the online portal.', NULL, 'normal', true, '00000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000005', 'Software Engineering Project Guidelines', 'Updated project guidelines and rubric have been posted. Please review before starting your final project.', '10000000-0000-0000-0000-000000000003', 'normal', false, '00000000-0000-0000-0000-000000000005');

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
