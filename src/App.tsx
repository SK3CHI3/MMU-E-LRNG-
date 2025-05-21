
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { lazy, Suspense, useEffect } from "react";
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
// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClassSessions = lazy(() => import("./pages/ClassSessions"));
const Assignments = lazy(() => import("./pages/Assignments"));
const Grades = lazy(() => import("./pages/Grades"));
const Announcements = lazy(() => import("./pages/Announcements"));
const ComradeAI = lazy(() => import("./pages/ComradeAI"));
const Resources = lazy(() => import("./pages/Resources"));
const Fees = lazy(() => import("./pages/Fees"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Support = lazy(() => import("./pages/Support"));

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

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Outlet />
                    </Suspense>
                  </MainLayout>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/class-sessions" element={<ClassSessions />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/grades" element={<Grades />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/comrade-ai" element={<ComradeAI />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/fees" element={<Fees />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/support" element={<Support />} />
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
                  {/* Add admin-specific routes here */}
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
