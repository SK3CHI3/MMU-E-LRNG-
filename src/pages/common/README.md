# 📁 Common Pages

This folder contains pages that are shared across multiple user roles or are general application pages.

## 📋 Page Categories

### 🔐 Authentication Pages
- **Login.tsx** - User login page
- **Register.tsx** - User registration page
- **ForgotPassword.tsx** - Password recovery page
- **ResetPassword.tsx** - Password reset page

### 🏠 General Pages
- **Index.tsx** - Landing/home page
- **Dashboard.tsx** - General dashboard (redirects to role-specific)
- **Profile.tsx** - User profile management
- **Settings.tsx** - User settings page

### 📋 Utility Pages
- **NotFound.tsx** - 404 error page
- **Unauthorized.tsx** - 403 access denied page
- **Support.tsx** - Help and support page
- **GuestPortal.tsx** - Guest access portal

### 📚 Content Pages
- **Announcements.tsx** - General announcements view
- **Resources.tsx** - General resources page
- **ComradeAI.tsx** - AI assistant page

### 📊 Academic Pages
- **Assignments.tsx** - General assignments view
- **Grades.tsx** - General grades view
- **ClassSessions.tsx** - Class schedule view
- **Fees.tsx** - Fee management page

## 📝 Note

These pages either:
1. Serve multiple user roles
2. Are entry points that redirect to role-specific pages
3. Provide general functionality not tied to specific roles

For role-specific pages, see the respective folders:
- `/student` - Student-specific pages
- `/lecturer` - Lecturer-specific pages
- `/dean` - Dean-specific pages
- `/admin` - Admin-specific pages
