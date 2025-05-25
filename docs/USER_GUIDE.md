# MMU LMS - Complete User Guide

## 🎯 **Getting Started**

### **System Access**
- **URL**: http://localhost:8080 (Development) | https://mmu-lms.ac.ke (Production)
- **Supported Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari, Android Chrome, responsive web design

### **Demo Accounts**
```
Student Account:
- Email: student1@mmu.ac.ke
- Password: password123

Lecturer Account:
- Email: lecturer1@mmu.ac.ke
- Password: password123

Dean Account:
- Email: dean1@mmu.ac.ke
- Password: password123

Admin Account:
- Email: admin1@mmu.ac.ke
- Password: password123
```

## 👨‍🏫 **LECTURER GUIDE**

### **🏠 Dashboard Overview**
Your lecturer dashboard provides a comprehensive overview of your teaching activities:

- **Quick Stats**: Total students, courses, pending assignments, messages
- **Recent Activity**: Latest student submissions, messages, and course updates
- **Upcoming Deadlines**: Assignment due dates and important course milestones
- **Performance Metrics**: Class averages, engagement rates, completion statistics

### **📚 Course Management (`/lecturer/courses`)**

#### **Creating a New Course**
1. Click **"Create New Course"** button
2. Fill in course details:
   - **Course Title**: Full course name
   - **Course Code**: Official course identifier (e.g., CS301)
   - **Description**: Detailed course description
   - **Credits**: Number of credit hours
   - **Semester**: Current academic term
3. Set course preferences:
   - **Visibility**: Public or private course
   - **Enrollment**: Open or restricted enrollment
   - **Grading Scale**: Points, percentages, or letter grades
4. Click **"Create Course"** to save

#### **Managing Existing Courses**
- **View Course Details**: Click on any course card to see full information
- **Edit Course**: Use the edit button to modify course settings
- **Student Roster**: View enrolled students and their progress
- **Course Analytics**: Access detailed performance metrics

### **📝 Assignment Management (`/lecturer/assignments`)**

#### **Creating Assignments**
1. Navigate to **Assignment Management**
2. Click **"Create New Assignment"**
3. Configure assignment details:
   - **Title**: Clear, descriptive assignment name
   - **Course**: Select target course
   - **Type**: Essay, Programming, Presentation, etc.
   - **Instructions**: Detailed assignment requirements
   - **Due Date**: Set deadline with time zone
   - **Points**: Maximum points possible
   - **Submission Format**: File types accepted
4. Set advanced options:
   - **Late Policy**: Penalty for late submissions
   - **Attempts**: Number of submission attempts allowed
   - **Rubric**: Attach grading rubric
5. Click **"Create Assignment"** to publish

#### **Tracking Submissions**
- **Submission Dashboard**: View all submissions in one place
- **Progress Tracking**: See submission rates and pending work
- **File Management**: Download individual or bulk submissions
- **Communication**: Send reminders and updates to students

### **📖 Learning Materials (`/materials`)**

#### **Uploading Content**
1. Go to **Learning Materials**
2. Click **"Upload New Material"**
3. Choose upload method:
   - **File Upload**: Documents, videos, presentations
   - **External Link**: YouTube videos, websites, online resources
   - **Text Content**: Create rich text materials directly
4. Set material properties:
   - **Title**: Descriptive material name
   - **Course**: Associate with specific course
   - **Tags**: Add searchable keywords
   - **Visibility**: Public, private, or course-specific
   - **Download**: Allow or restrict downloads
5. Click **"Upload Material"** to save

#### **Organizing Content**
- **Folder Structure**: Create folders by topic or module
- **Tagging System**: Use consistent tags for easy searching
- **Version Control**: Update materials while maintaining history
- **Access Control**: Set permissions for different student groups

### **📊 Grading Center (`/grading`)**

#### **Grading Submissions**
1. Access **Grading Center**
2. Select assignment to grade
3. Choose submission to review:
   - **File Preview**: View submissions directly in browser
   - **Download**: Download files for detailed review
   - **Previous Submissions**: View submission history
4. Apply grades:
   - **Points/Percentage**: Enter numerical grade
   - **Rubric**: Use predefined rubric criteria
   - **Comments**: Provide detailed feedback
   - **Audio/Video**: Record personalized feedback
5. Save and continue to next submission

#### **Batch Grading**
- **Similar Submissions**: Grade multiple similar submissions quickly
- **Feedback Templates**: Use pre-written feedback for common issues
- **Grade Curves**: Apply statistical adjustments to grades
- **Export Grades**: Download grades for external systems

### **💬 Communication (`/messages`)**

#### **Messaging Students**
1. Go to **Messages**
2. Click **"Compose Message"**
3. Select recipients:
   - **Individual Student**: One-on-one communication
   - **Course Group**: Message entire class
   - **Custom Group**: Select specific students
4. Compose message:
   - **Subject**: Clear message topic
   - **Content**: Detailed message with formatting
   - **Attachments**: Include files or resources
   - **Priority**: Set message urgency level
5. Send or schedule for later delivery

#### **Managing Conversations**
- **Thread Organization**: Keep conversations organized by topic
- **Search Function**: Find specific messages or conversations
- **Archive System**: Archive old conversations for reference
- **Response Tracking**: Monitor message read and response rates

### **👥 Student Management (`/students`)**

#### **Monitoring Student Progress**
1. Access **Student Management**
2. View student roster with key metrics:
   - **Attendance**: Class participation rates
   - **Grades**: Current grade averages
   - **Engagement**: Platform activity levels
   - **Assignments**: Completion rates
3. Click on individual students for detailed profiles:
   - **Academic History**: Previous courses and grades
   - **Contact Information**: Email, phone, emergency contacts
   - **Performance Trends**: Grade progression over time
   - **Activity Log**: Recent platform activity

#### **Identifying At-Risk Students**
- **Performance Alerts**: Automatic notifications for declining grades
- **Engagement Warnings**: Low activity or participation alerts
- **Intervention Tools**: Connect students with support services
- **Progress Meetings**: Schedule academic check-ins

### **📈 Analytics Dashboard (`/analytics`)**

#### **Course Performance Analysis**
1. Navigate to **Analytics**
2. Select course and time period
3. Review key metrics:
   - **Grade Distributions**: Visual grade breakdowns
   - **Completion Rates**: Assignment and course completion
   - **Engagement Patterns**: Student activity trends
   - **Comparative Analysis**: Performance across courses
4. Generate reports:
   - **PDF Reports**: Formatted performance reports
   - **Data Export**: Raw data for further analysis
   - **Trend Analysis**: Historical performance comparisons

#### **Student Analytics**
- **Individual Performance**: Detailed student analytics
- **Cohort Comparisons**: Compare student groups
- **Predictive Insights**: Early warning indicators
- **Success Factors**: Identify what drives student success

### **🤖 Teaching AI Assistant (`/teaching-ai`)**

#### **Getting AI Help**
1. Access **Teaching AI**
2. Choose assistance type:
   - **Lesson Planning**: Generate structured lesson plans
   - **Quiz Creation**: Create assessment questions
   - **Assignment Ideas**: Get creative assignment suggestions
   - **Teaching Strategies**: Receive pedagogical advice
3. Provide context:
   - **Course Information**: Specify course and topic
   - **Learning Objectives**: Define what students should learn
   - **Difficulty Level**: Set appropriate challenge level
   - **Time Constraints**: Specify available time
4. Review and customize AI suggestions

#### **AI-Generated Content**
- **Lesson Plans**: Structured, objective-based lesson designs
- **Assessment Questions**: Multiple choice, short answer, essay prompts
- **Rubrics**: Detailed grading criteria and performance levels
- **Activities**: Interactive learning exercises and projects
- **Resources**: Curated educational materials and references

## 🎓 **STUDENT GUIDE**

### **🏠 Student Dashboard**
Your dashboard shows:
- **Current Courses**: Enrolled courses with quick access
- **Upcoming Assignments**: Due dates and submission status
- **Recent Grades**: Latest assignment and quiz results
- **Announcements**: Important course updates and messages
- **Schedule**: Class times and important dates

### **📚 Course Access**
- **Course Materials**: Access all course content and resources
- **Assignment Submission**: Submit work directly through the platform
- **Grade Tracking**: Monitor your academic progress
- **Discussion Forums**: Participate in course discussions
- **Comrade AI**: Get 24/7 learning assistance

### **🤖 Comrade AI Tutor**
Your personal AI learning assistant:
- **Homework Help**: Get explanations and guidance
- **Concept Clarification**: Understand difficult topics
- **Study Planning**: Create personalized study schedules
- **Practice Questions**: Generate practice problems
- **Learning Resources**: Find additional learning materials

## 🏛️ **DEAN GUIDE**

### **Faculty Oversight**
- **Faculty Performance**: Monitor lecturer effectiveness
- **Resource Allocation**: Manage faculty resources and assignments
- **Course Approval**: Review and approve new courses
- **Student Analytics**: Faculty-wide student performance metrics
- **Quality Assurance**: Ensure educational standards

### **Reporting & Analytics**
- **Faculty Reports**: Comprehensive faculty performance reports
- **Student Success Metrics**: Track student outcomes across faculty
- **Resource Utilization**: Monitor resource usage and efficiency
- **Comparative Analysis**: Compare performance across departments

## ⚙️ **ADMIN GUIDE**

### **System Management**
- **User Administration**: Manage all system users and roles
- **Course Catalog**: Oversee institutional course offerings
- **System Configuration**: Configure platform settings and features
- **Data Management**: Backup, restore, and maintain system data
- **Security Monitoring**: Monitor system security and access

### **Analytics & Reporting**
- **Institution-wide Analytics**: Comprehensive system metrics
- **Usage Statistics**: Platform usage and engagement data
- **Performance Monitoring**: System performance and reliability
- **Compliance Reporting**: Generate compliance and audit reports

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

#### **Login Problems**
- **Forgot Password**: Use "Forgot Password" link on login page
- **Account Locked**: Contact system administrator
- **Browser Issues**: Clear cache and cookies, try different browser

#### **File Upload Issues**
- **File Size**: Maximum 100MB per file
- **File Types**: Check supported file formats
- **Network**: Ensure stable internet connection
- **Browser**: Try different browser or disable extensions

#### **Performance Issues**
- **Slow Loading**: Check internet connection, clear browser cache
- **Mobile Issues**: Update browser app, check mobile data connection
- **Feature Not Working**: Refresh page, try different browser

### **Getting Help**
- **Help Documentation**: Comprehensive guides and tutorials
- **Video Tutorials**: Step-by-step video instructions
- **Support Tickets**: Submit technical support requests
- **Live Chat**: Real-time assistance during business hours
- **Email Support**: support@mmu-lms.ac.ke
- **Phone Support**: +254 XXX XXX XXX (Business hours)

## 📱 **Mobile Usage**

### **Mobile Features**
- **Responsive Design**: Full functionality on mobile devices
- **Touch Optimization**: Touch-friendly interface elements
- **Offline Access**: Download materials for offline viewing
- **Push Notifications**: Important updates and reminders
- **Mobile Upload**: Camera integration for assignment submission

### **Mobile Best Practices**
- **WiFi Usage**: Use WiFi for large file downloads
- **Battery Management**: Close app when not in use
- **Storage**: Regularly clear downloaded files
- **Updates**: Keep browser updated for best performance

---

**For additional support, contact the MMU LMS Help Desk or visit our comprehensive online documentation.**
