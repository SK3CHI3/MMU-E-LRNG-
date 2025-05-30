
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { PopupProvider } from "./components/popups/PopupManager";

// Development mode check (console logging removed for production)

// Public Pages
import Index from "./pages/common/Index";
import Login from "./pages/common/Login";
import Register from "./pages/common/Register";
import ForgotPassword from "./pages/common/ForgotPassword";
import ResetPassword from "./pages/common/ResetPassword";
import Unauthorized from "./pages/common/Unauthorized";
import GuestPortal from "./pages/common/GuestPortal";
import RegistrationGuard from "./components/guards/RegistrationGuard";
import MaintenanceGuard from "./components/guards/MaintenanceGuard";
// Shared pages
const Profile = lazy(() => import("./pages/shared/Profile"));
const Settings = lazy(() => import("./pages/shared/Settings"));
const Support = lazy(() => import("./pages/shared/Support"));
const SharedMessages = lazy(() => import("./pages/shared/Messages"));

// Student pages
const StudentCourses = lazy(() => import("./pages/student/Courses"));
const StudentAssignments = lazy(() => import("./pages/student/Assignments"));
const StudentGrades = lazy(() => import("./pages/student/Grades"));
const StudentSchedule = lazy(() => import("./pages/student/Schedule"));
const StudentResources = lazy(() => import("./pages/student/Resources"));
const StudentFees = lazy(() => import("./pages/student/Fees"));
const StudentAnnouncements = lazy(() => import("./pages/student/Announcements"));
const StudyAI = lazy(() => import("./pages/student/StudyAI"));
// const StudentMessages = lazy(() => import("./pages/student/Messages")); // TODO: Implement messaging routes

// Lecturer pages
const LecturerCourses = lazy(() => import("./pages/lecturer/Courses"));
const AssignmentManagement = lazy(() => import("./pages/lecturer/AssignmentManagement"));
const Materials = lazy(() => import("./pages/lecturer/Materials"));
const Grading = lazy(() => import("./pages/lecturer/Grading"));
// const Messages = lazy(() => import("./pages/lecturer/Messages")); // TODO: Implement messaging routes
const LecturerStudents = lazy(() => import("./pages/lecturer/Students"));
const SharedAnalytics = lazy(() => import("./pages/shared/Analytics"));
const TeachingAI = lazy(() => import("./pages/lecturer/TeachingAI"));
const LecturerAnnouncementManagement = lazy(() => import("./pages/lecturer/AnnouncementManagement"));

// Dean pages
const DeanFaculty = lazy(() => import("./pages/dean/Faculty"));
const DeanDepartments = lazy(() => import("./pages/dean/Departments"));
const DeanStaff = lazy(() => import("./pages/dean/Staff"));
const DeanStudents = lazy(() => import("./pages/dean/Students"));
const DeanPerformance = lazy(() => import("./pages/dean/Performance"));
const DeanReports = lazy(() => import("./pages/dean/Reports"));
const DeanAnnouncements = lazy(() => import("./pages/dean/Announcements"));
const DeanManagementAI = lazy(() => import("./pages/dean/ManagementAI"));

// Admin pages
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminFaculties = lazy(() => import("./pages/admin/Faculties"));
const AdminSecurity = lazy(() => import("./pages/admin/Security"));
const AdminGlobalSettings = lazy(() => import("./pages/admin/GlobalSettings"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminAI = lazy(() => import("./pages/admin/AdminAI"));
const SystemLogs = lazy(() => import("./pages/admin/SystemLogs"));
const SystemActivities = lazy(() => import("./pages/admin/SystemActivities"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const FacultyDetail = lazy(() => import("./pages/admin/FacultyDetail"));
const AdminAnnouncementManagement = lazy(() => import("./pages/admin/AnnouncementManagement"));

// Placeholder pages for routes that don't have specific implementations yet
const PlaceholderPage = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
      <p className="text-gray-600 dark:text-gray-400">This page is under development.</p>
    </div>
  </div>
);

// Dashboard Router
import { DashboardRouter } from "./components/dashboard/DashboardRouter";

// Dashboard router handles role-specific dashboard rendering

// 404 Page
import NotFound from "./pages/common/NotFound";

const queryClient = new QueryClient();

// Loading component for Suspense
const PageLoader = () => {
  console.log('PageLoader: Rendering loading component');

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-6 rounded-lg border border-border shadow-lg">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading your dashboard...</p>
        <p className="text-muted-foreground mt-2">Please wait while we set things up</p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PopupProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <MaintenanceGuard>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={
                <RegistrationGuard>
                  <Register />
                </RegistrationGuard>
              } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/guest-portal/*" element={<GuestPortal />} />

              {/* Dashboard Router - handles all dashboard paths and role-based redirection */}
              <Route element={<ProtectedRoute />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>
                  <Route path="/dashboard" element={<DashboardRouter />} />
                  <Route path="/dashboard/student" element={<DashboardRouter />} />
                  <Route path="/dashboard/lecturer" element={<DashboardRouter />} />
                  <Route path="/dashboard/dean" element={<DashboardRouter />} />
                  <Route path="/dashboard/admin" element={<DashboardRouter />} />
                  <Route path="/dashboard/*" element={<DashboardRouter />} />
                </Route>
              </Route>

              {/* Shared routes - accessible by all authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support" element={<Support />} />
                </Route>
              </Route>

              {/* Dean routes - moved before student routes to avoid conflicts */}
              <Route element={<ProtectedRoute allowedRoles={['dean']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>

                  <Route path="/faculty" element={<DeanFaculty />} />
                  <Route path="/departments" element={<DeanDepartments />} />
                  <Route path="/staff" element={<DeanStaff />} />
                  <Route path="/dean/students" element={<DeanStudents />} />
                  <Route path="/performance" element={<DeanPerformance />} />
                  <Route path="/reports" element={<DeanReports />} />
                  <Route path="/dean/announcements" element={<DeanAnnouncements />} />
                  <Route path="/management-ai" element={<DeanManagementAI />} />
                </Route>
              </Route>

              {/* Student routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>

                  <Route path="/courses" element={<StudentCourses />} />
                  <Route path="/assignments" element={<StudentAssignments />} />
                  <Route path="/grades" element={<StudentGrades />} />
                  <Route path="/resources" element={<StudentResources />} />
                  <Route path="/fees" element={<StudentFees />} />
                  <Route path="/student/announcements" element={<StudentAnnouncements />} />
                  <Route path="/study-ai" element={<StudyAI />} />
                </Route>
              </Route>

              {/* Lecturer routes */}
              <Route element={<ProtectedRoute allowedRoles={['lecturer']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>

                  <Route path="/lecturer/courses" element={<LecturerCourses />} />
                  <Route path="/lecturer/assignments" element={<AssignmentManagement />} />
                  <Route path="/lecturer/announcements" element={<LecturerAnnouncementManagement />} />
                  <Route path="/grading" element={<Grading />} />
                  <Route path="/materials" element={<Materials />} />
                  <Route path="/teaching-ai" element={<TeachingAI />} />
                </Route>
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>

                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/faculties" element={<AdminFaculties />} />
                  <Route path="/security" element={<AdminSecurity />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/global-settings" element={<AdminGlobalSettings />} />
                  <Route path="/admin/announcements" element={<AdminAnnouncementManagement />} />
                  <Route path="/admin-ai" element={<AdminAI />} />
                  <Route path="/system-logs" element={<SystemLogs />} />
                  <Route path="/system-activities" element={<SystemActivities />} />
                </Route>
              </Route>

              {/* Multi-role routes */}
              <Route element={<ProtectedRoute allowedRoles={['student', 'lecturer']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>
                  <Route path="/schedule" element={<StudentSchedule />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['lecturer', 'dean']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>
                  <Route path="/students" element={<LecturerStudents />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['lecturer', 'dean', 'admin']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>
                  <Route path="/analytics" element={<SharedAnalytics />} />
                  <Route path="/reports" element={<PlaceholderPage />} />
                </Route>
              </Route>

              {/* Shared routes accessible to all authenticated users */}
              <Route element={<ProtectedRoute allowedRoles={['student', 'lecturer', 'dean', 'admin']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>
                  <Route path="/messages" element={<SharedMessages />} />
                  <Route path="/faculty/:facultyId" element={<FacultyDetail />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['dean', 'admin']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>
                  <Route path="/staff" element={<PlaceholderPage />} />
                </Route>
              </Route>

              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </MaintenanceGuard>
          </BrowserRouter>
        </TooltipProvider>
        </PopupProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
