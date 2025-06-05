
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { ProfileDropdown } from "@/components/navigation/ProfileDropdown";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Notifications } from "@/components/navigation/Notifications";
import { Logo } from "@/components/brand/Logo";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import { MobileSidebarNav } from "@/components/navigation/MobileSidebarNav";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen w-full dashboard-background">
        {/* Mobile Top Bar */}
        <div className="border-b h-16 px-4 flex items-center justify-between bg-white/70 dark:bg-background/95 backdrop-blur-md border-white/40 dark:border-border shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="mobile-touch-target"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo className="h-8 w-8" />
            <div className="flex flex-col">
              <h2 className="font-semibold text-sm">MMU LMS</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Notifications />
            <ProfileDropdown />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="mobile-sidebar-overlay"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={cn("mobile-sidebar", isMobileSidebarOpen && "open")}>
          <div className="flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <Logo />
              </div>
              <div className="flex flex-col">
                <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">MMU LMS</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Learning Management System</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeMobileSidebar}
              className="text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl transition-all duration-300 active:scale-95"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto mobile-scroll">
            <MobileSidebarNav onItemClick={closeMobileSidebar} />
          </div>
          <div className="p-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
            <div className="flex flex-col space-y-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">© 2025 MMU LMS</span>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 rounded-xl"
              >
                <Link to="/support" className="font-semibold">Support</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 mobile-padding mobile-content-with-nav mobile-scroll overflow-x-hidden">
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    );
  }

  // Desktop Layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MMUSidebar />
        <SidebarInset className="p-0">
          <div className="flex flex-col min-h-screen dashboard-background">
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
    <div className="border-b h-16 px-6 flex items-center justify-between bg-white/70 dark:bg-background/95 backdrop-blur-md border-white/40 dark:border-border shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="hidden md:block w-64">
          <Search />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <Search className="w-48" />
        </div>
        <ThemeToggle />
        <Notifications />
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default MainLayout;
