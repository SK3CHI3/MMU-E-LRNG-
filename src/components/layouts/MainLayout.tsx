
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ProfileDropdown } from "@/components/navigation/ProfileDropdown";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Notifications } from "@/components/navigation/Notifications";
import { Logo } from "@/components/brand/Logo";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import { Search } from "@/components/ui/search";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  BarChart4,
  MessageSquare,
  FileText,
  CreditCard,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MMUSidebar />
        <SidebarInset className="p-0">
          <div className="flex flex-col min-h-screen">
            <TopBar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const MMUSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 p-4">
        <Logo />
        <div className="flex flex-col">
          <h2 className="font-semibold">MMU LMS</h2>
          <p className="text-xs text-muted-foreground">Learning Management System</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex flex-col space-y-2">
          <span className="text-xs text-muted-foreground">© 2025 MMU LMS</span>
          <Button variant="outline" size="sm" asChild>
            <Link to="/support">Support</Link>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

const TopBar = () => {
  return (
    <div className="border-b h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:block w-64">
          <Search />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Notifications />
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default MainLayout;
