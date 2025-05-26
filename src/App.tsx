
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Enable console logging in development
if (import.meta.env.DEV) {
  console.log('Development mode: Verbose logging enabled');
}

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";
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
const StudentMessages = lazy(() => import("./pages/student/Messages"));

// Lecturer pages
const LecturerCourses = lazy(() => import("./pages/lecturer/Courses"));
const AssignmentManagement = lazy(() => import("./pages/lecturer/AssignmentManagement"));
const Materials = lazy(() => import("./pages/lecturer/Materials"));
const Grading = lazy(() => import("./pages/lecturer/Grading"));
const Messages = lazy(() => import("./pages/lecturer/Messages"));
const LecturerStudents = lazy(() => import("./pages/lecturer/Students"));
const LecturerAnalytics = lazy(() => import("./pages/lecturer/Analytics"));
const TeachingAI = lazy(() => import("./pages/lecturer/TeachingAI"));

// Dean pages
const DeanFaculty = lazy(() => import("./pages/dean/Faculty"));

// Admin pages
const AdminUsers = lazy(() => import("./pages/admin/Users"));

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
import NotFound from "./pages/NotFound";

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
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

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
                  <Route path="/announcements" element={<StudentAnnouncements />} />
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
                  <Route path="/study-ai" element={<StudyAI />} />
                  <Route path="/student/messages" element={<StudentMessages />} />
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
                  <Route path="/grading" element={<Grading />} />
                  <Route path="/materials" element={<Materials />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/teaching-ai" element={<TeachingAI />} />
                </Route>
              </Route>

              {/* Dean routes */}
              <Route element={<ProtectedRoute allowedRoles={['dean']} />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>

                  <Route path="/faculty" element={<DeanFaculty />} />
                  <Route path="/departments" element={<PlaceholderPage />} />
                  <Route path="/performance" element={<PlaceholderPage />} />
                  <Route path="/budget" element={<PlaceholderPage />} />
                  <Route path="/management-ai" element={<PlaceholderPage />} />
                  <Route path="/dean/messages" element={<SharedMessages />} />
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
                  <Route path="/system" element={<PlaceholderPage />} />
                  <Route path="/faculties" element={<PlaceholderPage />} />
                  <Route path="/security" element={<PlaceholderPage />} />
                  <Route path="/global-settings" element={<PlaceholderPage />} />
                  <Route path="/admin-ai" element={<PlaceholderPage />} />
                  <Route path="/admin/messages" element={<SharedMessages />} />
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
                  <Route path="/analytics" element={<LecturerAnalytics />} />
                  <Route path="/reports" element={<PlaceholderPage />} />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
