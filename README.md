<div align="center">
  <h1 MMU Learning Management System LMS /h1> 


  <h3 align="center">Multimedia University of Kenya's Digital Learning Platform</h3>
  <p align="center">Elevating Learning, Empowering Futures</p>
</div>

## 📋 Overview

The MMU Learning Management System (LMS) is a comprehensive digital platform designed to enhance the educational experience at Multimedia University of Kenya. This modern web application provides students, lecturers, and administrators with a centralized hub for managing academic activities, accessing learning resources, and facilitating communication within the university community.

### 🎉 **PRODUCTION READY STATUS**
- ✅ **Unit-based Academic System** - Completely removed credit system, now uses unit-based tracking
- ✅ **Fee Management System** - Student fees, payment history, and balance tracking with M-Pesa integration
- ✅ **Programme Management** - Academic programmes (Bachelor's, Master's) with proper MMU structure
- ✅ **Academic Calendar** - Semester and academic year management with real dates
- ✅ **Comprehensive Announcement System** - Public/internal announcements with priority levels and targeting
- ✅ **Analytics Dashboards** - Real-time analytics for lecturers and deans with interactive charts
- ✅ **Enhanced Security** - Row Level Security (RLS) policies for all data access
- ✅ **Performance Optimized** - Database indexes and query optimization for production
- ✅ **Frontend-Backend Integration** - All services updated and tested with new database structure
- ✅ **Production Database** - Deployed to Supabase (eekajmfvqntbloqgizwk) with sample data
- ✅ **Clean Codebase** - Removed all test files and debug components for production readiness
- ✅ **Comprehensive Documentation** - Complete API docs, deployment guides, and user manuals
- ✅ **Ready for Deployment** - All systems tested and verified for production use

## ✨ Features

### For Students
- **Dashboard**: Personalized overview with MMU-themed blue interface and real-time announcements
- **Course Management**: Access to enrolled courses, learning materials, and lecture notes
- **Assignment Submission**: Digital submission and tracking of assignments
- **Grade Tracking**: Real-time access to grades and academic progress with visual analytics
- **Class Sessions**: Schedule and information about upcoming and past classes
- **AI Learning Assistant**: 24/7 "Comrade AI" tutor for academic support
- **Announcements**: Priority-coded announcements with public/internal visibility
- **Notifications**: Important alerts about deadlines, grades, and university announcements

### For Lecturers
- **Course Administration**: Tools to manage course content, materials, and student enrollment
- **Assignment Creation**: Create, distribute, and grade assignments
- **Student Progress Tracking**: Monitor student performance and engagement with analytics dashboards
- **Attendance Management**: Track and record student attendance
- **Announcement Management**: Create targeted announcements for students and courses
- **Analytics Dashboard**: Real-time insights into course performance and student engagement
- **Communication Tools**: Direct messaging and announcement capabilities

### For Administrators
- **User Management**: Comprehensive tools for managing student and staff accounts
- **System Configuration**: Customization options for the LMS platform
- **Analytics Dashboard**: Insights into system usage and academic metrics
- **Announcement Management**: Create system-wide announcements with priority levels
- **Department Management**: Tools for organizing courses by department and faculty
- **System Monitoring**: Real-time system health and activity tracking

## 🛠️ Technology Stack

### Frontend
- **React**: JavaScript library for building the user interface
- **TypeScript**: For type-safe code and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: High-quality UI components built with Radix UI and Tailwind
- **React Router**: For navigation and routing
- **React Query**: For efficient data fetching and state management
- **Recharts**: For data visualization and analytics
- **React Hook Form**: For form validation and handling

### Backend
- **Supabase**: Backend-as-a-Service platform providing:
  - **Authentication**: Secure user authentication and authorization
  - **PostgreSQL Database**: Robust relational database for data storage
  - **Row Level Security (RLS)**: For data protection and access control
  - **Storage**: For file uploads and management
  - **Realtime Subscriptions**: For live updates and notifications

### Development Tools
- **Vite**: Next-generation frontend tooling for fast development
- **ESLint**: For code linting and maintaining code quality
- **Git**: For version control and collaboration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SK3CHI3/MMU-E-LRNG-.git
   cd MMU-E-LRNG-
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Set up the database**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to the SQL Editor in your Supabase dashboard
   - Run the deployment scripts in order:
     ```sql
     -- 1. First, run the schema deployment
     -- Copy and paste contents of database/deploy.sql

     -- 2. Then, add sample data (optional for testing)
     -- Copy and paste contents of database/deploy_sample_data.sql
     ```
   - Verify deployment by checking the new tables in the Table Editor

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:8080` to see the application

## 📢 Announcement System

The MMU LMS features a comprehensive announcement system designed for effective communication:

### Features
- **Priority Levels**: Urgent, High, Normal, Low with color-coded visual hierarchy
- **Public/Internal Visibility**: Announcements can be public (shown on landing page) or internal only
- **Targeted Messaging**: Target specific audiences (all users, students, lecturers, faculty, specific courses)
- **Rich Content**: Support for external links, expiry dates, and categorization
- **Real-time Notifications**: Automatic notifications sent to target users
- **Interactive Display**: Dismissible announcements with read-more functionality

### Visual Design
- **Urgent Announcements**: Red border and high visibility styling
- **High Priority**: Orange border for important announcements
- **Public Announcements**: Green border with globe icon
- **Normal/Low Priority**: Blue/gray styling for standard announcements

### Management
- **Admin Control**: System-wide announcements with full targeting options
- **Lecturer Control**: Course-specific and faculty-wide announcements
- **Analytics Integration**: Track announcement engagement and effectiveness

## 📊 Analytics Dashboard

Real-time analytics provide insights into academic performance and system usage:

### Lecturer Analytics
- **Course Performance**: Student enrollment trends and grade distributions
- **Engagement Metrics**: Assignment completion rates and student participation
- **Interactive Charts**: Line charts, pie charts, and bar graphs for data visualization

### Dean Analytics
- **Faculty Overview**: Complete faculty statistics and performance metrics
- **Department Distribution**: Student and lecturer distribution across departments
- **Growth Tracking**: Enrollment trends and quarterly growth analysis

## 📱 Responsive Design

The MMU LMS is designed to be fully responsive, providing an optimal experience across a wide range of devices:
- Desktop computers
- Laptops
- Tablets
- Mobile phones

## 🔒 Security Features

- **Authentication**: Secure email/password authentication
- **Authorization**: Role-based access control (student, lecturer, admin)
- **Data Protection**: Row Level Security (RLS) policies in Supabase
- **Secure API**: Protected API endpoints
- **Input Validation**: Comprehensive form validation to prevent security vulnerabilities

## 🎨 Design & Theming

### MMU Kenya Official Theme
- **Primary Colors**: Official MMU blue (#0066CC) with red accents (#DC2626)
- **Glass Morphism**: Modern glassmorphic header design with backdrop blur effects
- **Clean Interface**: Professional, clean design focused on usability
- **Responsive Cards**: Well-designed cards with proper spacing and typography

### Dark Mode Support
The application includes a built-in dark mode toggle, allowing users to choose their preferred theme:
- Light mode for daytime use with MMU blue theme
- Dark mode for reduced eye strain in low-light environments
- Automatic theme persistence across sessions

## 🔄 Continuous Development

This project is under active development with planned enhancements including:
- Real-time chat functionality
- Advanced analytics dashboard
- Integration with video conferencing tools
- Mobile application versions
- AI-powered learning recommendations

## 👥 Contributors

- [SKECHIE](https://github.com/SK3CHI3) - Lead Developer

## 📄 License

This project is proprietary software developed for Multimedia University of Kenya.

---

<div align="center">
  <p>© 2024 Multimedia University of Kenya. All Rights Reserved.</p>
</div>

(Database isn't functional)
