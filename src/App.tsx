
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layouts/MainLayout";
import { lazy, Suspense } from "react";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

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
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => {
  // This would come from auth context in a real app
  const isLoggedIn = false;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
            
            {/* Apply MainLayout to all protected routes */}
            <Route element={
              isLoggedIn ? (
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    {/* Outlet will be replaced by the matched child route */}
                    <Outlet />
                  </Suspense>
                </MainLayout>
              ) : (
                <Navigate to="/login" />
              )
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
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
