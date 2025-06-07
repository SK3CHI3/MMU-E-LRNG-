# 🔒 Secure Setup Guide

## ⚠️ IMPORTANT SECURITY NOTICE

The previous configuration had a **critical security vulnerability** with hardcoded service role keys in client-side code. This has been fixed, but you need to set up your environment properly.

## 🚨 What Was Wrong

1. **Service Role Key in Client Code**: The service role key was hardcoded in the client-side code, which is a major security risk
2. **Invalid API Keys**: The anon key may have been incorrect or expired
3. **Client-Side Admin Operations**: Admin operations were using service role keys in the browser

## ✅ Security Fixes Applied

1. **Removed Service Role Key**: No longer using service role keys in client-side code
2. **RLS-Based Security**: All operations now use Row Level Security policies
3. **Proper Authentication**: Admin operations use authenticated user context
4. **Environment Variables**: Proper environment variable setup

## 🛠️ How to Set Up Correctly

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 2: Update Your .env File

Replace the contents of your `.env` file with:

```env
# MMU Learning Management System - Environment Variables
VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Application Configuration
VITE_APP_NAME="MMU Learning Management System"
VITE_APP_VERSION="1.0.0"

# Development Configuration
NODE_ENV=development
VITE_DEV_MODE=true
```

**⚠️ NEVER include service role keys in client-side code!**

### Step 3: Set Up Database Security

If you're using a new Supabase project, you need to set up the database schema and Row Level Security (RLS) policies:

1. **Create Tables**: Run the SQL from `database/schema.sql`
2. **Enable RLS**: Ensure Row Level Security is enabled on all tables
3. **Create Policies**: Set up proper RLS policies for each user role

### Step 4: Create Admin User

You'll need at least one admin user to manage the system:

```sql
-- Insert an admin user (run this in Supabase SQL Editor)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@mmu.ac.ke',
  crypt('your_secure_password', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Then insert the user profile
INSERT INTO users (
  auth_id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@mmu.ac.ke'),
  'admin@mmu.ac.ke',
  'System Administrator',
  'admin',
  true,
  now(),
  now()
);
```

## 🔐 Row Level Security Policies

For the user deletion system to work securely, you need these RLS policies:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth_id = auth.uid());

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy: Admins can update/delete users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth_id = auth.uid());
```

## 🧪 Testing the Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Check for errors**: Look for any Supabase connection errors in the console

3. **Test login**: Try logging in with your admin credentials

4. **Test user management**: Navigate to Admin → User Management

## 🚫 Security Best Practices

### ❌ NEVER DO:
- Put service role keys in client-side code
- Hardcode API keys in source code
- Commit `.env` files to version control
- Use service role keys for regular operations
- Disable RLS policies without proper authentication

### ✅ ALWAYS DO:
- Use environment variables for API keys
- Enable Row Level Security on all tables
- Use proper authentication for admin operations
- Validate user permissions server-side
- Log admin actions for audit trails

## 🔧 Troubleshooting

### "Invalid API Key" Error
- Check that your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Ensure the anon key hasn't expired
- Verify the project URL is correct

### "Unauthorized" Errors
- Check that RLS policies are set up correctly
- Ensure the user has the correct role in the database
- Verify authentication is working

### Admin Functions Not Working
- Ensure the logged-in user has `role = 'admin'` in the users table
- Check that RLS policies allow admin operations
- Verify the user's `auth_id` matches their Supabase auth ID

## 📞 Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project settings
3. Ensure all environment variables are set correctly
4. Check that your database schema and RLS policies are properly configured

---

**Remember**: Security is paramount. Never compromise on proper authentication and authorization practices!
