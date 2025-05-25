# MMU E-Learning Management System (LMS)

## 🎓 Overview

The MMU E-Learning Management System is a comprehensive, modern learning management platform designed specifically for Multimedia University of Kenya. Built with cutting-edge technologies, it provides a complete educational ecosystem for students, lecturers, deans, and administrators.

## 🚀 Key Features

### 🎯 **Multi-Role Support**
- **Students**: Course enrollment, assignment submission, grade tracking, AI tutoring
- **Lecturers**: Course management, content creation, grading, student analytics
- **Deans**: Faculty oversight, performance monitoring, resource management
- **Administrators**: System management, user administration, comprehensive analytics

### 🤖 **AI-Powered Learning**
- **Comrade AI**: 24/7 student learning assistant
- **Teaching AI**: Intelligent teaching support for educators
- **Automated content generation**: Quizzes, lesson plans, assignments
- **Personalized learning recommendations**

### 📚 **Comprehensive Course Management**
- **Content Creation**: Upload documents, videos, presentations, links
- **Assignment Management**: Create, distribute, and grade assignments
- **Real-time Progress Tracking**: Monitor student engagement and performance
- **Interactive Materials**: Rich media support with engagement analytics

### 📊 **Advanced Analytics**
- **Performance Dashboards**: Real-time insights into learning outcomes
- **Engagement Metrics**: Track student participation and activity
- **Predictive Analytics**: Early warning systems for at-risk students
- **Comprehensive Reporting**: Export data for institutional analysis

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Shadcn/UI** for consistent, accessible components
- **Lucide React** for beautiful icons

### **Backend & Database**
- **Supabase** for backend-as-a-service
- **PostgreSQL** for robust data management
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates

### **Authentication & Security**
- **Supabase Auth** with email/password and social login
- **Role-based access control (RBAC)**
- **JWT token management**
- **Secure API endpoints**

### **AI Integration**
- **OpenAI GPT-4** for intelligent tutoring
- **Custom AI prompts** for educational content
- **Context-aware responses** based on course materials

## 📁 Project Structure

```
MMU-E-LRNG-/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── navigation/     # Navigation and layout components
│   │   └── landing/        # Landing page components
│   ├── pages/              # Page components
│   │   ├── student/        # Student-specific pages
│   │   ├── lecturer/       # Lecturer-specific pages
│   │   ├── dean/           # Dean-specific pages
│   │   ├── admin/          # Admin-specific pages
│   │   └── dashboards/     # Role-specific dashboards
│   ├── contexts/           # React contexts for state management
│   ├── lib/               # Utility functions and configurations
│   ├── types/             # TypeScript type definitions
│   └── hooks/             # Custom React hooks
├── docs/                  # Documentation
├── supabase/             # Supabase configuration and functions
└── public/               # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SK3CHI3/MMU-E-LRNG-.git
   cd MMU-E-LRNG-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   npx supabase db reset
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open http://localhost:8080
   - Use demo credentials or register a new account

## 👥 User Roles & Access

### 🎓 **Student Portal**
- **Dashboard**: Personal learning overview
- **Courses**: Enrolled courses and materials
- **Assignments**: Submit and track assignments
- **Grades**: View performance and feedback
- **Schedule**: Class timetables and deadlines
- **Comrade AI**: 24/7 learning assistant

### 👨‍🏫 **Lecturer Portal**
- **Course Management**: Create and manage courses
- **Content Creation**: Upload materials and resources
- **Assignment Management**: Create, distribute, and grade
- **Student Monitoring**: Track progress and engagement
- **Analytics**: Performance insights and reporting
- **Teaching AI**: AI-powered teaching assistance
- **Communication**: Message students and send announcements

### 🏛️ **Dean Portal**
- **Faculty Overview**: Monitor faculty performance
- **Resource Management**: Allocate and track resources
- **Performance Analytics**: Faculty and student metrics
- **Reporting**: Generate institutional reports

### ⚙️ **Admin Portal**
- **User Management**: Manage all system users
- **System Configuration**: Platform settings and features
- **Analytics**: Comprehensive system analytics
- **Content Moderation**: Review and approve content

## 🔐 Security Features

- **Role-Based Access Control**: Granular permissions system
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Secure Authentication**: Multi-factor authentication support
- **API Security**: Rate limiting and request validation
- **Privacy Protection**: GDPR-compliant data handling

## 📱 Mobile Responsiveness

The platform is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Streamlined mobile experience
- **Progressive Web App**: Offline capabilities

## 🌐 Internationalization

- **Multi-language Support**: English (primary), Swahili
- **Localized Content**: Region-specific educational content
- **Cultural Adaptation**: Kenya-specific academic calendar and grading

## 📈 Performance & Scalability

- **Optimized Loading**: Lazy loading and code splitting
- **Caching Strategy**: Intelligent caching for better performance
- **CDN Integration**: Fast global content delivery
- **Scalable Architecture**: Designed to handle thousands of concurrent users

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Full Documentation](./docs/)
- **Issues**: [GitHub Issues](https://github.com/SK3CHI3/MMU-E-LRNG-/issues)
- **Email**: support@mmu-lms.ac.ke
- **Community**: [Discord Server](https://discord.gg/mmu-lms)

## 🏆 Acknowledgments

- **Multimedia University of Kenya** for institutional support
- **Open Source Community** for amazing tools and libraries
- **Contributors** who make this project possible

---

**Built with ❤️ for education at Multimedia University of Kenya**
