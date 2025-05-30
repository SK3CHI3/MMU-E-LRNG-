import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { GuestSidebarNav } from "@/components/navigation/GuestSidebarNav";
import { Search } from "@/components/ui/search";
import { Eye, ArrowRight, GraduationCap } from "lucide-react";

interface GuestLayoutProps {
  children: React.ReactNode;
}

const GuestLayout = ({ children }: GuestLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <GuestSidebar />
        <SidebarInset className="p-0">
          <div className="flex flex-col min-h-screen dashboard-background">
            <GuestTopBar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const GuestSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <Logo />
        <div className="flex flex-col">
          <h2 className="font-semibold">MMU LMS</h2>
          <p className="text-xs text-muted-foreground">Learning Management System</p>
          <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Preview Mode
          </Badge>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <GuestSidebarNav />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-sm mb-1">Ready to Get Started?</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Login to access all features and start your learning journey.
            </p>
            <Button asChild size="sm" className="w-full">
              <Link to="/login" className="flex items-center justify-center gap-2">
                <span>Login Now</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">© 2025 MMU LMS</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

const GuestTopBar = () => {
  return (
    <div className="border-b h-16 px-6 flex items-center justify-between bg-white/70 dark:bg-background/95 backdrop-blur-md border-white/40 dark:border-border shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:block w-64">
          <Search placeholder="Search (Preview Mode)" disabled />
        </div>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          <Eye className="h-3 w-3 mr-1" />
          Student Portal Preview
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Demo Student</span>
        </div>
        <Button asChild size="sm">
          <Link to="/login">Login to Access</Link>
        </Button>
      </div>
    </div>
  );
};

export default GuestLayout;
