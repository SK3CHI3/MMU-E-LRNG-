# MMU LMS - API Documentation

## 🔗 **API Overview**

The MMU LMS uses Supabase as its backend, providing a RESTful API with real-time capabilities. All API endpoints are automatically generated from the database schema and include built-in authentication and authorization.

## 🔐 **Authentication**

### **Authentication Methods**
```typescript
// Email/Password Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@mmu.ac.ke',
  password: 'password123'
});

// JWT Token Usage
const { data, error } = await supabase.auth.getSession();
const token = data.session?.access_token;
```

### **Authorization Headers**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 👥 **User Management API**

### **Get User Profile**
```http
GET /rest/v1/profiles?id=eq.<user_id>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@mmu.ac.ke",
  "full_name": "John Doe",
  "role": "student",
  "avatar_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### **Update User Profile**
```http
PATCH /rest/v1/profiles?id=eq.<user_id>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "avatar_url": "https://new-avatar-url.com"
}
```

### **Get Users by Role**
```http
GET /rest/v1/profiles?role=eq.lecturer
```

## 📚 **Course Management API**

### **Get All Courses**
```http
GET /rest/v1/courses
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Data Structures and Algorithms",
    "description": "Course description...",
    "course_code": "CS301",
    "credits": 3,
    "lecturer_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### **Create New Course**
```http
POST /rest/v1/courses
Content-Type: application/json

{
  "title": "New Course Title",
  "description": "Course description",
  "course_code": "CS401",
  "credits": 3,
  "lecturer_id": "uuid"
}
```

### **Get Course with Enrollments**
```http
GET /rest/v1/courses?id=eq.<course_id>&select=*,course_enrollments(*)
```

### **Enroll Student in Course**
```http
POST /rest/v1/course_enrollments
Content-Type: application/json

{
  "student_id": "uuid",
  "course_id": "uuid",
  "status": "active"
}
```

## 📝 **Assignment Management API**

### **Get Course Assignments**
```http
GET /rest/v1/assignments?course_id=eq.<course_id>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Binary Tree Implementation",
    "description": "Assignment description...",
    "due_date": "2024-02-01T23:59:59Z",
    "max_points": 100,
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### **Create Assignment**
```http
POST /rest/v1/assignments
Content-Type: application/json

{
  "course_id": "uuid",
  "title": "New Assignment",
  "description": "Assignment instructions...",
  "due_date": "2024-02-01T23:59:59Z",
  "max_points": 100
}
```

### **Get Assignment Submissions**
```http
GET /rest/v1/assignment_submissions?assignment_id=eq.<assignment_id>&select=*,profiles(full_name,email)
```

### **Submit Assignment**
```http
POST /rest/v1/assignment_submissions
Content-Type: application/json

{
  "assignment_id": "uuid",
  "student_id": "uuid",
  "submission_text": "Assignment content...",
  "file_urls": ["https://storage.url/file1.pdf"],
  "submitted_at": "2024-01-15T10:30:00Z"
}
```

## 📖 **Course Materials API**

### **Get Course Materials**
```http
GET /rest/v1/course_materials?course_id=eq.<course_id>&is_public=eq.true
```

**Response:**
```json
[
  {
    "id": "uuid",
    "course_id": "uuid",
    "title": "Lecture Notes - Chapter 1",
    "description": "Introduction to data structures",
    "file_url": "https://storage.url/notes.pdf",
    "material_type": "document",
    "is_public": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### **Upload Course Material**
```http
POST /rest/v1/course_materials
Content-Type: application/json

{
  "course_id": "uuid",
  "title": "New Material",
  "description": "Material description",
  "file_url": "https://storage.url/material.pdf",
  "material_type": "document",
  "is_public": true
}
```

## 📊 **Grading API**

### **Get Student Grades**
```http
GET /rest/v1/grades?student_id=eq.<student_id>&select=*,assignments(title,max_points)
```

**Response:**
```json
[
  {
    "id": "uuid",
    "assignment_id": "uuid",
    "student_id": "uuid",
    "points_earned": 85,
    "feedback": "Good work, but consider...",
    "graded_at": "2024-01-20T14:30:00Z",
    "assignments": {
      "title": "Binary Tree Implementation",
      "max_points": 100
    }
  }
]
```

### **Submit Grade**
```http
POST /rest/v1/grades
Content-Type: application/json

{
  "assignment_id": "uuid",
  "student_id": "uuid",
  "points_earned": 85,
  "feedback": "Excellent work on the implementation...",
  "graded_by": "uuid"
}
```

### **Update Grade**
```http
PATCH /rest/v1/grades?id=eq.<grade_id>
Content-Type: application/json

{
  "points_earned": 90,
  "feedback": "Updated feedback after review..."
}
```

## 💬 **Messaging API**

### **Get User Messages**
```http
GET /rest/v1/messages?or=(sender_id.eq.<user_id>,recipient_id.eq.<user_id>)&order=created_at.desc
```

### **Send Message**
```http
POST /rest/v1/messages
Content-Type: application/json

{
  "sender_id": "uuid",
  "recipient_id": "uuid",
  "subject": "Question about Assignment",
  "content": "I have a question about...",
  "priority": "normal"
}
```

### **Mark Message as Read**
```http
PATCH /rest/v1/messages?id=eq.<message_id>
Content-Type: application/json

{
  "read_at": "2024-01-20T15:30:00Z"
}
```

## 📁 **File Storage API**

### **Upload File**
```typescript
// Upload file to Supabase Storage
const { data, error } = await supabase.storage
  .from('course-materials')
  .upload(`${courseId}/${fileName}`, file);
```

### **Get File URL**
```typescript
// Get public URL for file
const { data } = supabase.storage
  .from('course-materials')
  .getPublicUrl(`${courseId}/${fileName}`);
```

### **Download File**
```http
GET /storage/v1/object/public/course-materials/<file_path>
```

## 🔄 **Real-time Subscriptions**

### **Subscribe to Course Updates**
```typescript
const subscription = supabase
  .channel('course_updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'assignments',
    filter: `course_id=eq.${courseId}`
  }, (payload) => {
    console.log('Assignment updated:', payload);
  })
  .subscribe();
```

### **Subscribe to New Messages**
```typescript
const messageSubscription = supabase
  .channel('user_messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `recipient_id=eq.${userId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

## 📈 **Analytics API**

### **Get Course Analytics**
```http
GET /rest/v1/rpc/get_course_analytics
Content-Type: application/json

{
  "course_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

### **Get Student Performance**
```http
GET /rest/v1/rpc/get_student_performance
Content-Type: application/json

{
  "student_id": "uuid",
  "course_id": "uuid"
}
```

## 🔍 **Search API**

### **Search Courses**
```http
GET /rest/v1/courses?or=(title.ilike.*search_term*,description.ilike.*search_term*)
```

### **Search Materials**
```http
GET /rest/v1/course_materials?title.ilike.*search_term*&is_public=eq.true
```

## ⚠️ **Error Handling**

### **Common Error Responses**

#### **Authentication Error (401)**
```json
{
  "code": "PGRST301",
  "details": "JWT expired",
  "hint": null,
  "message": "JWT expired"
}
```

#### **Authorization Error (403)**
```json
{
  "code": "42501",
  "details": "new row violates row-level security policy",
  "hint": null,
  "message": "new row violates row-level security policy for table \"courses\""
}
```

#### **Validation Error (400)**
```json
{
  "code": "23505",
  "details": "Key (course_code)=(CS301) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint \"courses_course_code_key\""
}
```

## 📊 **Rate Limiting**

### **Rate Limits**
- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **File uploads**: 50 uploads per hour
- **Real-time connections**: 100 concurrent connections

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 🔧 **API Client Examples**

### **JavaScript/TypeScript Client**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Get courses
const { data: courses, error } = await supabase
  .from('courses')
  .select('*')
  .eq('lecturer_id', userId);
```

### **Python Client**
```python
from supabase import create_client, Client

url = "https://your-project.supabase.co"
key = "your-anon-key"
supabase: Client = create_client(url, key)

# Get courses
response = supabase.table('courses').select('*').eq('lecturer_id', user_id).execute()
courses = response.data
```

### **cURL Examples**
```bash
# Get courses
curl -X GET 'https://your-project.supabase.co/rest/v1/courses' \
  -H "Authorization: Bearer <jwt_token>" \
  -H "apikey: <anon_key>"

# Create assignment
curl -X POST 'https://your-project.supabase.co/rest/v1/assignments' \
  -H "Authorization: Bearer <jwt_token>" \
  -H "apikey: <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "uuid",
    "title": "New Assignment",
    "due_date": "2024-02-01T23:59:59Z",
    "max_points": 100
  }'
```

## 📚 **Additional Resources**

- **Supabase Documentation**: https://supabase.com/docs
- **PostgREST API Reference**: https://postgrest.org/en/stable/api.html
- **Real-time Documentation**: https://supabase.com/docs/guides/realtime
- **Storage Documentation**: https://supabase.com/docs/guides/storage

---

**For API support and questions, contact the development team or refer to the comprehensive Supabase documentation.**
