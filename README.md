# MMU Learning Management System (LMS)

<div align="center">
  <img src="public/favicon.svg" alt="MMU LMS Logo" width="120" height="120" style="border-radius: 16px;">
  <h3 align="center">Multimedia University of Kenya's Digital Learning Platform</h3>
  <p align="center">Elevating Learning, Empowering Futures</p>
</div>

## 📋 Overview

The MMU Learning Management System (LMS) is a comprehensive digital platform designed to enhance the educational experience at Multimedia University of Kenya. This modern web application provides students, lecturers, and administrators with a centralized hub for managing academic activities, accessing learning resources, and facilitating communication within the university community.

## ✨ Features

### For Students
- **Dashboard**: Personalized overview with MMU-themed blue interface and subtle video background
- **Course Management**: Access to enrolled courses, learning materials, and lecture notes
- **Assignment Submission**: Digital submission and tracking of assignments
- **Grade Tracking**: Real-time access to grades and academic progress with visual analytics
- **Class Sessions**: Schedule and information about upcoming and past classes
- **AI Learning Assistant**: 24/7 "Comrade AI" tutor for academic support
- **Notifications**: Important alerts about deadlines, grades, and university announcements

### For Lecturers
- **Course Administration**: Tools to manage course content, materials, and student enrollment
- **Assignment Creation**: Create, distribute, and grade assignments
- **Student Progress Tracking**: Monitor student performance and engagement
- **Attendance Management**: Track and record student attendance
- **Communication Tools**: Direct messaging and announcement capabilities

### For Administrators
- **User Management**: Comprehensive tools for managing student and staff accounts
- **System Configuration**: Customization options for the LMS platform
- **Analytics Dashboard**: Insights into system usage and academic metrics
- **Department Management**: Tools for organizing courses by department and faculty

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

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:8080` to see the application

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
