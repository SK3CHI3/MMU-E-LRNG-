
// User types
export interface User {
  id: string;
  name: string;
  email?: string;
  role: "student" | "lecturer" | "hof" | "admin";
  avatarUrl?: string;
}

export interface Student extends User {
  role: "student";
  admissionNumber: string;
  faculty: string;
  phone: string;
  semester: string;
  gpa: number;
  feeBalance: number;
  feeRequired: number;
  registeredUnits: Unit[];
}

export interface Lecturer extends User {
  role: "lecturer" | "hof";
  lecturerId: string;
  faculty: string;
  assignedUnits: Unit[];
}

export interface Admin extends User {
  role: "admin";
}

// Course related types
export interface Faculty {
  id: string;
  name: string;
  hof?: Lecturer;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  faculty: Faculty;
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  course: Course;
  lecturer?: Lecturer;
  students: Student[];
  classes: ClassSession[];
  assignments: Assignment[];
}

// Learning related types
export interface ClassSession {
  id: string;
  unit: Unit;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  isOnline: boolean;
  meetingLink?: string;
  notes?: string;
  attendees: Student[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  unit: Unit;
  dueDate: string;
  maxScore: number;
  submissions: Submission[];
}

export interface Submission {
  id: string;
  student: Student;
  assignment: Assignment;
  submittedAt: string;
  files: FileAttachment[];
  score?: number;
  feedback?: string;
  status: "submitted" | "graded" | "late" | "missing";
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Attendance {
  id: string;
  student: Student;
  class: ClassSession;
  attended: boolean;
  timestamp?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  sender: User;
  targetRole?: "all" | "students" | "lecturers";
  targetFaculty?: Faculty;
  targetCourse?: Course;
  targetUnit?: Unit;
  createdAt: string;
  readBy: User[];
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: "document" | "link" | "video" | "image" | "other";
  url: string;
  uploadedBy: User;
  unit?: Unit;
  course?: Course;
  createdAt: string;
}

// AI assistant related types
export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AISession {
  id: string;
  user: User;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

// Finance related types
export interface Payment {
  id: string;
  student: Student;
  amount: number;
  paymentDate: string;
  semester: string;
  transactionId: string;
  status: "pending" | "completed" | "failed";
}

export interface SupplementaryExam {
  id: string;
  student: Student;
  unit: Unit;
  attemptNumber: number;
  paid: boolean;
  amount: number;
  scheduledDate?: string;
  score?: number;
  status: "pending" | "scheduled" | "completed";
}
