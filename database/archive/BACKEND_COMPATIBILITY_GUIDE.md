# MMU LMS Backend-Frontend Compatibility Guide

## Overview

This guide ensures your MMU LMS database is fully compatible with the frontend changes that fix the department/programme duplication issue. The frontend now properly handles:

- **Students & Lecturers**: Select programme → department auto-determined
- **Deans**: Select department they head within their faculty
- **Admins**: No faculty/department restrictions

## 🚨 **IMPORTANT: Run These Scripts in Order**

### **Step 1: Apply Schema Updates**

Run the compatibility migration script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of database/migrate_backend_compatibility.sql
```

**What this does:**
- ✅ Adds `faculty` and `staff_id` columns to users table
- ✅ Fixes session_attachments foreign key reference
- ✅ Adds performance indexes
- ✅ Updates existing user data with faculty information
- ✅ Updates RLS policies for faculty-based access

### **Step 2: Populate Complete Programme Data**

Run the programme population script:

```sql
-- Copy and paste the contents of database/populate_mmu_programmes.sql
```

**What this does:**
- ✅ Removes old sample programme data
- ✅ Adds all real MMU programmes from official website
- ✅ Properly maps programmes to departments
- ✅ Covers all 6 faculties with correct programme structure

## 📊 **Database Schema Changes**

### **Users Table Updates**

| Field | Type | Description | Required For |
|-------|------|-------------|--------------|
| `faculty` | VARCHAR(255) | Faculty name | All roles except admin |
| `staff_id` | VARCHAR(50) | Staff identifier | Lecturers and deans |
| `department` | VARCHAR(255) | Department name or auto-determined | Deans (manual), Students/Lecturers (auto) |
| `programme_id` | UUID | Reference to programmes table | Students and lecturers |

### **Programmes Table Structure**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `code` | VARCHAR(20) | Programme code (e.g., BSCS) |
| `title` | VARCHAR(255) | Full programme name |
| `level` | VARCHAR(50) | certificate, diploma, bachelors, masters, phd |
| `faculty` | VARCHAR(255) | Faculty name |
| `department` | VARCHAR(255) | Department name |
| `duration_years` | INTEGER | Programme duration |
| `total_units` | INTEGER | Total units required |

## 🔄 **Frontend-Backend Data Flow**

### **Registration Process**

1. **User selects role** → Frontend shows appropriate fields
2. **User selects faculty** → Frontend loads programmes/departments for that faculty
3. **For Students/Lecturers**: User selects programme → Frontend auto-determines department
4. **For Deans**: User selects department they head
5. **Backend receives**: `{ faculty, department, programme_id }` with proper relationships

### **Data Validation**

The backend now validates:
- ✅ Faculty is required for all roles except admin
- ✅ Programme is required for students and lecturers
- ✅ Department is required for deans
- ✅ Department is auto-determined for students/lecturers based on programme

## 🎯 **Real MMU Programme Data**

The database now contains **all official MMU programmes**:

### **Faculty of Business and Economics (FoBE)**
- 3 Masters programmes
- 5 Bachelors programmes  
- 5 Diploma programmes
- 1 Certificate programme

### **Faculty of Computing and Information Technology (FoCIT)**
- 2 Masters programmes
- 4 Bachelors programmes
- 1 Diploma programme
- 3 Certificate programmes

### **Faculty of Engineering and Technology (FoET)**
- 3 Bachelors programmes

### **Faculty of Media and Communication (FAMECO)**
- 2 Bachelors programmes

### **Faculty of Science & Technology (FoST)**
- 3 Bachelors programmes

### **Faculty of Social Sciences and Technology (FoSST)**
- 3 Bachelors programmes

## 🔐 **Security & Access Control**

### **Row Level Security (RLS) Updates**

- ✅ Users can read other users in their faculty
- ✅ Faculty-based messaging restrictions
- ✅ Programme data readable by all authenticated users
- ✅ Proper role-based access control maintained

### **Data Integrity**

- ✅ Foreign key constraints ensure data consistency
- ✅ Check constraints validate role values
- ✅ Unique constraints prevent duplicate student/staff IDs
- ✅ Proper indexing for performance

## 🧪 **Testing & Verification**

After running the migration scripts, verify:

```sql
-- Check user-faculty distribution
SELECT faculty, role, COUNT(*) as user_count 
FROM users 
WHERE is_active = true 
GROUP BY faculty, role 
ORDER BY faculty, role;

-- Check programme count by faculty
SELECT faculty, COUNT(*) as programme_count 
FROM programmes 
GROUP BY faculty 
ORDER BY faculty;

-- Verify no users missing faculty (except admins)
SELECT COUNT(*) as users_without_faculty
FROM users 
WHERE faculty IS NULL AND role != 'admin' AND is_active = true;
```

## 🚀 **Frontend Compatibility**

The frontend registration form now:
- ✅ Shows only relevant fields based on user role
- ✅ Auto-determines department from programme selection
- ✅ Provides clear user guidance with helper text
- ✅ Validates data before submission
- ✅ Handles all MMU faculties and programmes correctly

## 📝 **Migration Checklist**

- [ ] Run `migrate_backend_compatibility.sql`
- [ ] Run `populate_mmu_programmes.sql`
- [ ] Verify user data integrity
- [ ] Test registration flow for all user roles
- [ ] Confirm faculty-based access control
- [ ] Validate programme-department relationships

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Foreign key constraint errors**: Ensure programmes table is populated before updating users
2. **RLS policy conflicts**: Drop and recreate policies if needed
3. **Missing faculty data**: Run the user update queries again
4. **Performance issues**: Ensure all indexes are created

### **Rollback Plan**

If issues occur, you can rollback by:
1. Removing the new columns: `ALTER TABLE users DROP COLUMN faculty, DROP COLUMN staff_id;`
2. Restoring original session_attachments constraint
3. Reverting to sample programme data

## ✅ **Success Indicators**

Your migration is successful when:
- ✅ All users (except admins) have faculty assigned
- ✅ Programme table contains 30+ real MMU programmes
- ✅ Registration form works for all user roles
- ✅ Department is auto-determined from programme selection
- ✅ No duplicate department/programme selection for students/lecturers
