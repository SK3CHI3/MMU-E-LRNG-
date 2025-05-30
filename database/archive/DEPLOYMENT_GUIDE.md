# MMU LMS Database Deployment Guide

This guide explains how to deploy the updated database schema and sample data to support the frontend functionality.

## Overview

The database has been updated to support all frontend requirements including:

- ✅ **Student academic information** (programmes, semesters, year of study)
- ✅ **Fee management** (student fees, payment history)
- ✅ **Academic calendar** (current semester, academic year)
- ✅ **Unit-based system** (removed credit system)
- ✅ **Programme management** (degree programmes, faculties)

## Database Changes Made

### New Tables Added

1. **programmes** - Academic programmes (Bachelor's, Master's, etc.)
2. **academic_calendar** - Academic year and semester information
3. **student_fees** - Student fee records and payment tracking
4. **payment_history** - Payment transaction records

### Modified Tables

1. **users** - Added programme_id, current_semester, year_of_study
2. **courses** - Added programme_id, removed credit_hours

### Removed Features

- ❌ **Credit system** - Completely removed from all tables and interfaces
- ❌ **Credit hours** - Replaced with unit-based system

## Deployment Steps

### Step 1: Apply Schema Changes

Run the deployment script in Supabase SQL Editor:

```sql
-- Copy and paste the contents of database/deploy.sql
```

This will:
- Add new tables with proper constraints
- Update existing tables
- Create indexes for performance
- Set up Row Level Security (RLS) policies
- Create triggers for updated_at columns

### Step 2: Deploy Sample Data (Optional)

For testing and development, run the sample data script:

```sql
-- Copy and paste the contents of database/deploy_sample_data.sql
```

This will add:
- Sample academic programmes
- Current academic calendar
- Sample student fee records
- Sample payment history
- Update existing users with programme information

### Step 3: Verify Deployment

Check that all tables exist and have data:

```sql
-- Check new tables
SELECT COUNT(*) FROM programmes;
SELECT COUNT(*) FROM academic_calendar;
SELECT COUNT(*) FROM student_fees;
SELECT COUNT(*) FROM payment_history;

-- Check updated tables
SELECT auth_id, programme_id, current_semester, year_of_study 
FROM users 
WHERE role = 'student' 
LIMIT 5;

SELECT id, code, title, programme_id 
FROM courses 
LIMIT 5;
```

## Frontend Integration

The frontend services are already configured to use these new tables:

### userDataService.ts
- ✅ Fetches student programme information
- ✅ Gets academic calendar data
- ✅ Retrieves fee information
- ✅ Calculates unit statistics (not credits)

### feeService.ts
- ✅ Manages student fees
- ✅ Processes payments
- ✅ Tracks payment history

### studentService.ts
- ✅ Handles course enrollments
- ✅ Manages assignments and submissions
- ✅ Tracks academic progress

## Security Configuration

### Row Level Security (RLS)

All tables have appropriate RLS policies:

- **Students** can only access their own data
- **Lecturers** can access their course-related data
- **Deans** can access faculty-wide data
- **Admins** have full access

### API Keys

Ensure your Supabase configuration uses:
- **Public (anon) key** for client-side operations
- **Service role key** for admin operations (server-side only)

## Testing

After deployment, test the following:

1. **Student Dashboard** - Should load academic progress without credit references
2. **Fee Information** - Should display current fee status and payment history
3. **Course Registration** - Should work with unit limits (not credit limits)
4. **Academic Calendar** - Should show current semester information
5. **Programme Information** - Should display correct programme details

## Troubleshooting

### Common Issues

1. **Foreign Key Constraints**
   - Ensure programmes table is created before updating users
   - Check that programme_id references exist

2. **RLS Policy Errors**
   - Verify user authentication is working
   - Check that policies allow appropriate access

3. **Missing Data**
   - Run sample data script if testing
   - Ensure academic calendar has is_current = true

### Rollback Plan

If issues occur, you can rollback by:

1. Dropping new tables:
```sql
DROP TABLE IF EXISTS payment_history;
DROP TABLE IF EXISTS student_fees;
DROP TABLE IF EXISTS academic_calendar;
DROP TABLE IF EXISTS programmes;
```

2. Removing new columns:
```sql
ALTER TABLE users DROP COLUMN IF EXISTS programme_id;
ALTER TABLE users DROP COLUMN IF EXISTS current_semester;
ALTER TABLE users DROP COLUMN IF EXISTS year_of_study;
ALTER TABLE courses DROP COLUMN IF EXISTS programme_id;
```

## Support

For issues or questions:
1. Check Supabase logs for error details
2. Verify RLS policies are correctly configured
3. Ensure all required environment variables are set
4. Test with sample data first before using production data
