# 🗂️ MMU LMS Project Structure Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Root Directory Structure](#root-directory-structure)
- [Source Code Organization](#source-code-organization)
- [Component Architecture](#component-architecture)
- [Service Layer](#service-layer)
- [Database Structure](#database-structure)
- [Documentation Organization](#documentation-organization)

---

## 🎯 Overview

The MMU LMS follows a modern, scalable architecture with clear separation of concerns. The project is organized into logical modules that promote maintainability, reusability, and team collaboration.

## 📁 Root Directory Structure

```
MMU-E-LRNG-/
├── 📁 src/                     # Source code
├── 📁 docs/                    # Documentation
│   ├── 📁 archive/             # Archived development documentation
│   └── 📄 [documentation files] # Current documentation
├── 📁 database/                # Database schemas and migrations
│   ├── 📁 archive/             # Archived database documentation
│   ├── 📁 scripts/             # Database utility scripts
│   ├── 📁 migrations/          # Database migrations
│   ├── 📄 schema.sql           # Main database schema
│   ├── 📄 deploy.sql           # Deployment script
│   ├── 📄 sample_data.sql      # Sample data
│   └── 📄 storage_setup.sql    # Storage configuration
├── 📁 supabase/               # Supabase configuration
├── 📁 public/                 # Static assets
├── 📁 dist/                   # Build output
├── 📁 node_modules/           # Dependencies
├── 📁 scripts/                # Build and utility scripts
├── 📄 package.json            # Project dependencies
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 tailwind.config.ts      # Tailwind CSS configuration
├── 📄 vite.config.ts          # Vite build configuration
├── 📄 README.md               # Project overview
└── 📄 .env.example            # Environment variables template
```

---

## 🏗️ Source Code Organization

### 📂 `/src` Directory Structure

```
src/
├── 📁 components/             # Reusable UI components
│   ├── 📁 ui/                # Base UI components (Shadcn/UI)
│   ├── 📁 auth/              # Authentication components
│   ├── 📁 dashboard/         # Dashboard-specific components
│   ├── 📁 navigation/        # Navigation and layout components
│   ├── 📁 landing/           # Landing page components
│   ├── 📁 announcements/     # Announcement components
│   ├── 📁 exam/              # Exam system components
│   ├── 📁 notifications/     # Notification components
│   ├── 📁 resources/         # Resource management components
│   └── 📁 popups/            # Modal and popup components
│
├── 📁 pages/                 # Page components
│   ├── 📁 student/           # Student-specific pages
│   ├── 📁 lecturer/          # Lecturer-specific pages
│   ├── 📁 dean/              # Dean-specific pages
│   ├── 📁 admin/             # Admin-specific pages
│   ├── 📁 auth/              # Authentication pages
│   ├── 📁 dashboards/        # Role-specific dashboards
│   ├── 📁 shared/            # Shared pages across roles
│   ├── 📁 guest/             # Guest/public pages
│   └── 📁 common/            # Common pages shared across roles
│
├── 📁 services/              # Business logic and API services
│   ├── 📄 assignmentService.ts      # Assignment operations
│   ├── 📄 gradingService.ts         # Grading operations
│   ├── 📄 assignmentFileService.ts  # File upload/download
│   ├── 📄 examService.ts            # Exam system
│   ├── 📄 messagingService.ts       # Real-time messaging
│   ├── 📄 analyticsService.ts       # Analytics and reporting
│   ├── 📄 courseService.ts          # Course management
│   ├── 📄 userDataService.ts        # User data operations
│   └── 📄 notificationService.ts    # Notifications
│
├── 📁 contexts/              # React contexts for state management
│   └── 📄 AuthContext.tsx    # Authentication state
│
├── 📁 hooks/                 # Custom React hooks
│   ├── 📄 use-toast.ts       # Toast notifications
│   ├── 📄 use-mobile.ts      # Mobile detection
│   └── 📄 useSystemSettings.ts # System settings
│
├── 📁 lib/                   # Utility functions and configurations
│   ├── 📄 supabaseClient.ts  # Supabase client configuration
│   └── 📄 utils.ts           # General utilities
│
├── 📁 types/                 # TypeScript type definitions
│   ├── 📄 auth.ts            # Authentication types
│   ├── 📄 settings.ts        # Settings types
│   └── 📄 index.ts           # Exported types
│
├── 📁 utils/                 # Utility functions
│   ├── 📁 ui/                # UI-related utilities
│   │   ├── 📄 chartUtils.ts  # Chart configuration utilities
│   │   ├── 📄 toast.ts       # Toast notification utilities
│   │   └── 📄 scrollAnimations.ts # Animation utilities
│   ├── 📁 validation/        # Validation utilities
│   │   └── 📄 emailChecker.ts # Email validation utilities
│   ├── 📁 messaging/         # Messaging utilities
│   │   └── 📄 messagingUtils.ts # Messaging system utilities
│   └── 📁 debug/             # Debug utilities (development only)
│       ├── 📄 authCleanup.ts # Authentication cleanup utilities
│       ├── 📄 debugAnnouncements.ts # Announcement debugging
│       └── 📄 testMessaging.ts # Messaging testing utilities
│
├── 📁 data/                  # Static data and configurations
│   └── 📄 mmuData.ts         # MMU-specific data
│
├── 📁 config/                # Application configuration
│   └── 📄 dashboards.ts      # Dashboard configurations
│
└── 📁 integrations/          # Third-party integrations
    └── 📁 supabase/          # Supabase integration
        ├── 📄 client.ts      # Supabase client
        └── 📄 types.ts       # Database types
```

---

## 🧩 Component Architecture

### 🎨 UI Components (`/src/components/ui/`)
Base components from Shadcn/UI library:
- **Button, Input, Card**: Basic interactive elements
- **Dialog, Sheet, Popover**: Modal and overlay components
- **Table, Tabs, Select**: Data display and navigation
- **Form, Label, Textarea**: Form components
- **Badge, Progress, Skeleton**: Status and loading components

### 🔐 Authentication Components (`/src/components/auth/`)
- **LoginForm**: User login interface
- **RegisterForm**: User registration interface
- **PasswordReset**: Password recovery interface
- **AuthGuard**: Route protection component

### 📊 Dashboard Components (`/src/components/dashboard/`)
- **DashboardAnalytics**: Analytics widgets and charts
- **StudentProgress**: Student progress tracking
- **QuickActions**: Quick action buttons and shortcuts
- **StatCards**: Statistical overview cards

### 🧭 Navigation Components (`/src/components/navigation/`)
- **Sidebar**: Main navigation sidebar
- **TopNav**: Top navigation bar
- **Breadcrumbs**: Navigation breadcrumbs
- **MobileNav**: Mobile navigation menu

---

## 🔧 Service Layer

### 📝 Assignment Services
- **assignmentService.ts**: CRUD operations for assignments
- **gradingService.ts**: Grading and feedback operations
- **assignmentFileService.ts**: File upload and management

### 🎓 Academic Services
- **courseService.ts**: Course management operations
- **examService.ts**: Exam creation and management
- **academicService.ts**: Academic records and transcripts

### 💬 Communication Services
- **messagingService.ts**: Real-time messaging
- **notificationService.ts**: System notifications
- **announcementService.ts**: Announcement management

### 📊 Analytics Services
- **analyticsService.ts**: Data analytics and reporting
- **userDataService.ts**: User activity tracking
- **performanceService.ts**: Performance metrics

---

## 🗄️ Database Structure

### 📋 Core Tables
- **users**: User accounts and profiles
- **courses**: Course information and metadata
- **assignments**: Assignment definitions
- **assignment_submissions**: Student submissions
- **assignment_files**: File attachments

### 🔐 Security Tables
- **user_roles**: Role assignments
- **permissions**: Permission definitions
- **audit_logs**: Activity logging

### 📊 Analytics Tables
- **analytics_data**: User activity data
- **performance_metrics**: Performance tracking
- **system_logs**: System activity logs

---

## 📚 Documentation Organization

### 📁 `/docs` Directory
```
docs/
├── 📄 README.md              # Documentation index
├── 📄 FEATURES.md            # Feature documentation
├── 📄 API_DOCUMENTATION.md   # API reference
├── 📄 ARCHITECTURE.md        # System architecture
├── 📄 DEPLOYMENT.md          # Deployment guide
├── 📄 USER_GUIDE.md          # User manual
├── 📄 CONTRIBUTING.md        # Contribution guidelines
├── 📄 PROJECT_STRUCTURE.md   # This document
└── 📄 CHANGELOG.md           # Version history
```

### 📁 `/database` Directory
```
database/
├── 📄 schema.sql             # Database schema
├── 📄 deploy.sql             # Deployment script
├── 📄 sample_data.sql        # Sample data
├── 📄 storage_setup.sql      # Storage configuration
└── 📁 migrations/            # Database migrations
```

---

## 🎯 Best Practices

### 📝 File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Services**: camelCase with Service suffix (e.g., `userService.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `UserType.ts`)

### 📂 Directory Organization
- Group related components in feature-based directories
- Keep shared components in the `/ui` directory
- Separate business logic into service files
- Use index files for clean imports

### 🔄 Import/Export Patterns
- Use named exports for components and functions
- Create index files for directory-level exports
- Import types separately from implementation
- Use absolute imports with path aliases

---

*This structure documentation is maintained to reflect the current project organization and is updated with any architectural changes.*
