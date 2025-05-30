# MMU LMS Student Portal Database Deployment

This document provides comprehensive instructions for deploying the database changes required for the dynamic student portal functionality.

## 📋 Overview

The student portal deployment includes:
- **Dynamic semester tracking** for students
- **Academic history management**
- **Unit registration system**
- **Automatic semester assignment** for new students
- **GPA calculation functions**
- **Sample data** for testing

## 🗂️ Files Included

### 1. `student_portal_update.sql`
**Primary database schema updates**
- Creates new tables (academic_calendar, registration_periods, etc.)
- Adds database functions for GPA calculation
- Sets up Row Level Security policies
- Updates existing tables with new columns

### 2. `sample_courses_data.sql`
**Sample data and additional configurations**
- Inserts sample courses for all programmes
- Creates available units for registration
- Sets up unit prerequisites
- Adds helper functions and triggers

### 3. `deploy_student_portal.sql`
**Deployment verification and instructions**
- Pre-deployment checks
- Verification functions
- Post-deployment instructions
- Troubleshooting guidance

## 🚀 Deployment Instructions

### Step 1: Pre-Deployment Checks
1. **Verify base schema exists**
   - Ensure main MMU LMS schema is deployed
   - Check that `users`, `courses`, `course_enrollments` tables exist

2. **Backup your database** (recommended)
   ```sql
   -- Create a backup before deployment
   ```

### Step 2: Deploy Database Updates

#### Option A: Supabase Dashboard (Recommended)
1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to SQL Editor

2. **Run deployment scripts in order:**
   ```sql
   -- 1. First, run the main schema update
   -- Copy and paste content from: student_portal_update.sql
   
   -- 2. Then, run the sample data script
   -- Copy and paste content from: sample_courses_data.sql
   
   -- 3. Finally, run verification
   -- Copy and paste content from: deploy_student_portal.sql
   ```

#### Option B: Command Line (Advanced)
```bash
# If using psql command line
psql -h your-supabase-host -U postgres -d postgres -f student_portal_update.sql
psql -h your-supabase-host -U postgres -d postgres -f sample_courses_data.sql
psql -h your-supabase-host -U postgres -d postgres -f deploy_student_portal.sql
```

### Step 3: Verify Deployment
Run the verification function:
```sql
SELECT * FROM verify_student_portal_deployment();
```

Expected results:
- All tables should exist (exists = true)
- Sample data should be populated (row_count > 0)

## 📊 New Database Tables

### 1. `academic_calendar`
Manages academic years and semesters
```sql
- academic_year (e.g., "2024/2025")
- semester_code (e.g., "1.1", "1.2", "2.1")
- semester dates and registration periods
```

### 2. `registration_periods`
Controls when students can register for units
```sql
- academic_year, semester
- start_date, end_date
- max_units_per_student
- min_fee_percentage required
```

### 3. `available_units`
Units available for student registration
```sql
- course_id, programme_id
- year_level (which year can take this unit)
- max_students, current_enrollment
```

### 4. `unit_prerequisites`
Prerequisites for courses
```sql
- unit_id, prerequisite_code
- is_mandatory flag
```

### 5. `student_academic_records`
Tracks student academic progress
```sql
- student_id, academic_year, semester
- semester_gpa, cumulative_gpa
- units_registered, completed, failed
```

### 6. `registration_logs`
Audit trail for student registrations
```sql
- student_id, action, details
- timestamp of registration activities
```

## 🔧 New Database Functions

### Student Management
```sql
-- Auto-assign semester to new student
SELECT assign_initial_semester_to_student('student-auth-id');

-- Calculate student GPA
SELECT calculate_student_gpa('student-auth-id');

-- Update academic record
SELECT update_student_academic_record('student-id', '2024/2025', '1.1');
```

### Utility Functions
```sql
-- Get current academic period
SELECT * FROM get_current_academic_period();

-- Increment/decrement unit enrollment
SELECT increment_unit_enrollment('course-id');
SELECT decrement_unit_enrollment('course-id');
```

## 🔒 Security (RLS Policies)

All new tables have Row Level Security enabled:

- **Students**: Can only see their own records
- **Lecturers**: Can see student records in their courses
- **Deans**: Can manage records in their faculty
- **Admins**: Full access to all records

## 📝 Sample Data Included

### Programmes
- Bachelor of Science in Computer Science (BSCS)
- Bachelor of Science in Information Technology (BSIT)
- Bachelor of Engineering (BENG)
- Bachelor of Commerce (BCOM)
- Master of Science in Information Technology (MSIT)

### Sample Courses
- **Computer Science**: CS101, CS102, CS103, CS201, CS202, etc.
- **Information Technology**: IT101, IT102, IT201, IT202, etc.
- **Business**: BUS101, BUS102, BUS103, etc.
- **Engineering**: ENG101, ENG102, ENG103, etc.

### Registration Period
- **Current Period**: 30 days from deployment date
- **Academic Year**: 2024/2025
- **Semester**: 1.1 (First semester, first year)

## 🧪 Testing the Deployment

### 1. Test New Student Registration
```sql
-- Register a new student and verify auto-assignment
-- Check users table for current_semester = 1, year_of_study = 1
```

### 2. Test Student Portal Data
```sql
-- Verify empty states work correctly
-- Check semester progress shows 0 values
-- Check academic history shows empty state
```

### 3. Test Unit Registration
```sql
-- Verify available units are populated
-- Check prerequisites are enforced
-- Test enrollment limits
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Table already exists" errors
```sql
-- Check if tables were partially created
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('academic_calendar', 'registration_periods', 'available_units');
```

#### 2. "Function does not exist" errors
```sql
-- Check if functions were created
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%student%' OR routine_name LIKE '%gpa%';
```

#### 3. RLS Policy errors
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('academic_calendar', 'registration_periods');
```

### Rollback Instructions
If you need to rollback the deployment:
```sql
-- Drop new tables (in reverse order)
DROP TABLE IF EXISTS registration_logs CASCADE;
DROP TABLE IF EXISTS student_academic_records CASCADE;
DROP TABLE IF EXISTS unit_prerequisites CASCADE;
DROP TABLE IF EXISTS available_units CASCADE;
DROP TABLE IF EXISTS registration_periods CASCADE;
DROP TABLE IF EXISTS academic_calendar CASCADE;

-- Remove added columns
ALTER TABLE users DROP COLUMN IF EXISTS current_semester;
ALTER TABLE users DROP COLUMN IF EXISTS year_of_study;
ALTER TABLE courses DROP COLUMN IF EXISTS credits;
```

## 📞 Support

If you encounter issues during deployment:

1. **Check deployment logs**:
   ```sql
   SELECT * FROM deployment_logs ORDER BY deployed_at DESC;
   ```

2. **Verify table creation**:
   ```sql
   SELECT * FROM verify_student_portal_deployment();
   ```

3. **Check for errors**:
   ```sql
   -- Look for any constraint violations or data issues
   ```

## ✅ Post-Deployment Checklist

- [ ] All tables created successfully
- [ ] Sample data populated
- [ ] RLS policies active
- [ ] Functions working correctly
- [ ] New student registration assigns semester 1.1
- [ ] Student portal shows empty states for new students
- [ ] Unit registration interface functional
- [ ] Academic history tracking operational

## 🎯 Next Steps

After successful deployment:

1. **Test with real users** in development environment
2. **Verify performance** with larger datasets
3. **Monitor logs** for any issues
4. **Update application code** to use new functions
5. **Train administrators** on new features

---

**Deployment Date**: _To be filled when deployed_  
**Deployed By**: _To be filled when deployed_  
**Version**: 1.0.0
