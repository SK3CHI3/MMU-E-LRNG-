-- =============================================
-- MMU LMS - Complete Programme Data Population
-- This script populates the programmes table with all real MMU programme data
-- Based on official MMU website data from mmuData.ts
-- =============================================

-- Clear existing sample data
DELETE FROM programmes WHERE code IN ('BSCS', 'BSIT', 'BSSE', 'BCOM', 'MSIT');

-- =============================================
-- FACULTY OF BUSINESS AND ECONOMICS (FoBE)
-- =============================================

-- Masters Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('MBA', 'Master in Business Administration (MBA)', 'masters', 'Faculty of Business and Economics', 'Department of Marketing and Management', 2, 16),
('MSE', 'Master of Science in Economics', 'masters', 'Faculty of Business and Economics', 'Department of Finance and Accounting', 2, 16),
('MSSCM', 'Master of Science in Supply Chain Management', 'masters', 'Faculty of Business and Economics', 'Department of Procurement and Logistics Management', 2, 16);

-- Bachelors Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('BCOM', 'Bachelor of Commerce', 'bachelors', 'Faculty of Business and Economics', 'Department of Marketing and Management', 4, 40),
('BPLM', 'Bachelor of Procurement and Logistics Management', 'bachelors', 'Faculty of Business and Economics', 'Department of Procurement and Logistics Management', 4, 40),
('BBIT', 'Bachelor of Business Information Technology', 'bachelors', 'Faculty of Business and Economics', 'Department of Marketing and Management', 4, 40),
('BSAS', 'Bachelor of Science in Actuarial Science', 'bachelors', 'Faculty of Business and Economics', 'Department of Finance and Accounting', 4, 40),
('BSEC', 'Bachelor of Science in Economics', 'bachelors', 'Faculty of Business and Economics', 'Department of Finance and Accounting', 4, 40);

-- Diploma Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('DBA', 'Diploma in Business Administration', 'diploma', 'Faculty of Business and Economics', 'Department of Marketing and Management', 3, 30),
('DHRM', 'Diploma in Human Resource Management', 'diploma', 'Faculty of Business and Economics', 'Department of Marketing and Management', 3, 30),
('DPLM', 'Diploma in Procurement and Logistics Management', 'diploma', 'Faculty of Business and Economics', 'Department of Procurement and Logistics Management', 3, 30),
('DHTM', 'Diploma in Hospitality and Tourism Management', 'diploma', 'Faculty of Business and Economics', 'Department of Marketing and Management', 3, 30),
('DMKT', 'Diploma in Marketing', 'diploma', 'Faculty of Business and Economics', 'Department of Marketing and Management', 3, 30);

-- Certificate Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('CIPS', 'CIPS Professional Courses', 'certificate', 'Faculty of Business and Economics', 'Department of Procurement and Logistics Management', 1, 10);

-- =============================================
-- FACULTY OF COMPUTING AND INFORMATION TECHNOLOGY (FoCIT)
-- =============================================

-- Masters Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('MSIT', 'Master of Science in Information Technology', 'masters', 'Faculty of Computing and Information Technology', 'Department of Information Technology', 2, 16),
('MSCS', 'Master of Science in Computer Science', 'masters', 'Faculty of Computing and Information Technology', 'Department of Computer Science', 2, 16);

-- Bachelors Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('BSCT', 'Bachelor of Science in Computer Technology', 'bachelors', 'Faculty of Computing and Information Technology', 'Department of Computer Science', 4, 40),
('BSCS', 'Bachelor of Science in Computer Science', 'bachelors', 'Faculty of Computing and Information Technology', 'Department of Computer Science', 4, 40),
('BSSE', 'Bachelor of Science in Software Engineering', 'bachelors', 'Faculty of Computing and Information Technology', 'Department of Computer Science', 4, 40),
('BSIT', 'Bachelor of Science in Information Technology', 'bachelors', 'Faculty of Computing and Information Technology', 'Department of Information Technology', 4, 40);

-- Diploma Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('DICT', 'Diploma in ICT', 'diploma', 'Faculty of Computing and Information Technology', 'Department of Information Technology', 3, 30);

-- Certificate Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('ICDL', 'International Computer Driving Licence', 'certificate', 'Faculty of Computing and Information Technology', 'Kenya-Korea IAC - Centre', 1, 10),
('HCNA', 'Huawei Certified Network Associate (HCNA)', 'certificate', 'Faculty of Computing and Information Technology', 'Kenya-Korea IAC - Centre', 1, 10),
('CCNA', 'Cisco Certified Network Associate (CCNA)', 'certificate', 'Faculty of Computing and Information Technology', 'Kenya-Korea IAC - Centre', 1, 10);

-- =============================================
-- FACULTY OF ENGINEERING AND TECHNOLOGY (FoET)
-- =============================================

-- Bachelors Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('BEEC', 'Bachelor of Engineering in Electrical & Communication', 'bachelors', 'Faculty of Engineering and Technology', 'Department of Electrical & Communication Engineering (ECE)', 4, 40),
('BEMM', 'Bachelor of Engineering in Mechanical & Mechatronics', 'bachelors', 'Faculty of Engineering and Technology', 'Department of Mechanical & Mechatronics Engineering (MME)', 4, 40),
('BECE', 'Bachelor of Engineering in Civil Engineering', 'bachelors', 'Faculty of Engineering and Technology', 'Department of Civil Engineering (CE)', 4, 40);

-- =============================================
-- FACULTY OF MEDIA AND COMMUNICATION (FAMECO)
-- =============================================

-- Bachelors Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('BAJC', 'Bachelor of Arts in Journalism and Communication', 'bachelors', 'Faculty of Media and Communication', 'Department of Journalism and Communication', 4, 40),
('BAFB', 'Bachelor of Arts in Film and Broadcast Production', 'bachelors', 'Faculty of Media and Communication', 'Department of Film and Broadcast', 4, 40);

-- =============================================
-- FACULTY OF SCIENCE & TECHNOLOGY (FoST)
-- =============================================

-- Bachelors Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('BSCH', 'Bachelor of Science in Chemistry', 'bachelors', 'Faculty of Science & Technology', 'Department of Chemistry', 4, 40),
('BSPH', 'Bachelor of Science in Physics', 'bachelors', 'Faculty of Science & Technology', 'Department of Physics', 4, 40),
('BSMA', 'Bachelor of Science in Mathematics', 'bachelors', 'Faculty of Science & Technology', 'Department of Mathematics', 4, 40);

-- =============================================
-- FACULTY OF SOCIAL SCIENCES AND TECHNOLOGY (FoSST)
-- =============================================

-- Bachelors Programmes
INSERT INTO programmes (code, title, level, faculty, department, duration_years, total_units) VALUES
('BAPS', 'Bachelor of Arts in Psychology', 'bachelors', 'Faculty of Social Sciences and Technology', 'Department of Psychology', 4, 40),
('BASO', 'Bachelor of Arts in Sociology', 'bachelors', 'Faculty of Social Sciences and Technology', 'Department of Sociology', 4, 40),
('BAPSC', 'Bachelor of Arts in Political Science', 'bachelors', 'Faculty of Social Sciences and Technology', 'Department of Political Science', 4, 40);

-- =============================================
-- UPDATE EXISTING USERS WITH FACULTY INFORMATION
-- =============================================

-- Update users to include faculty information based on their department
UPDATE users SET faculty = 'Faculty of Computing and Information Technology'
WHERE department LIKE '%Computer%' OR department LIKE '%Information Technology%' OR department LIKE '%Software%';

UPDATE users SET faculty = 'Faculty of Business and Economics'
WHERE department LIKE '%Business%' OR department LIKE '%Commerce%' OR department LIKE '%Finance%' OR department LIKE '%Marketing%' OR department LIKE '%Procurement%';

UPDATE users SET faculty = 'Faculty of Engineering and Technology'
WHERE department LIKE '%Engineering%';

UPDATE users SET faculty = 'Faculty of Media and Communication'
WHERE department LIKE '%Media%' OR department LIKE '%Communication%' OR department LIKE '%Journalism%' OR department LIKE '%Film%' OR department LIKE '%Broadcast%';

UPDATE users SET faculty = 'Faculty of Science & Technology'
WHERE department LIKE '%Chemistry%' OR department LIKE '%Physics%' OR department LIKE '%Mathematics%';

UPDATE users SET faculty = 'Faculty of Social Sciences and Technology'
WHERE department LIKE '%Psychology%' OR department LIKE '%Sociology%' OR department LIKE '%Political%';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Count programmes by faculty
-- SELECT faculty, COUNT(*) as programme_count FROM programmes GROUP BY faculty ORDER BY faculty;

-- Count programmes by level
-- SELECT level, COUNT(*) as programme_count FROM programmes GROUP BY level ORDER BY level;

-- Show all programmes
-- SELECT code, title, level, faculty, department FROM programmes ORDER BY faculty, level, title;
