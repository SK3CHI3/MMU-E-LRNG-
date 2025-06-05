import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BellRing,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Star,
  BookOpen,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUnifiedNotifications, markAnnouncementAsRead, markNotificationAsRead, EnhancedNotification } from "@/services/notificationService";
import { Skeleton } from "@/components/ui/skeleton";
import NotificationDetailModal from "@/components/notifications/NotificationDetailModal";

const Announcements = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<EnhancedNotification[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<EnhancedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [highlightedNotificationId, setHighlightedNotificationId] = useState<string | null>(null);
  const notificationRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [selectedNotification, setSelectedNotification] = useState<EnhancedNotification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadAnnouncements();
    }
  }, [user?.id]);

  useEffect(() => {
    filterAnnouncements();
  }, [searchTerm, selectedCategory, selectedPriority, activeTab, announcements]);

  // Update unread count whenever announcements change
  useEffect(() => {
    const count = announcements.filter(ann => !ann.isRead).length;
    setUnreadCount(count);
  }, [announcements]);

  // Handle notification parameter from URL
  useEffect(() => {
    const notificationId = searchParams.get('notification');
    if (notificationId && announcements.length > 0) {
      setHighlightedNotificationId(notificationId);

      // Clear filters to ensure the notification is visible
      setSearchTerm("");
      setSelectedCategory("all");
      setSelectedPriority("all");
      setActiveTab("all");

      // Scroll to the notification after a short delay
      setTimeout(() => {
        const element = notificationRefs.current[notificationId];
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });

          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedNotificationId(null);
            // Clear the URL parameter
            setSearchParams(prev => {
              const newParams = new URLSearchParams(prev);
              newParams.delete('notification');
              return newParams;
            });
          }, 3000);
        }
      }, 500);
    }
  }, [announcements, searchParams, setSearchParams]);

  const loadAnnouncements = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getUnifiedNotifications(user.id);
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    // Filter by tab
    if (activeTab === "unread") {
      filtered = filtered.filter(ann => !ann.isRead);
    } else if (activeTab === "course") {
      filtered = filtered.filter(ann => ann.category === "Unit" || ann.category === "Assignment");
    } else if (activeTab === "general") {
      filtered = filtered.filter(ann => ann.isPublic);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ann =>
        ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ann.sender.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(ann => ann.category === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter(ann => ann.priority === selectedPriority);
    }

    setFilteredAnnouncements(filtered);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "important":
        return "bg-red-500 text-white";
      case "unit":
        return "bg-blue-500 text-white";
      case "assignment":
        return "bg-orange-500 text-white";
      case "information":
        return "bg-green-500 text-white";
      case "finance":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <Star className="h-4 w-4 text-orange-500" />;
      case "normal":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleAnnouncementClick = async (announcement: EnhancedNotification) => {
    setSelectedNotification(announcement);
    setIsModalOpen(true);

    // Automatically mark as read when clicked (if not already read)
    if (!announcement.isRead) {
      await handleMarkAsRead(announcement.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    const unreadAnnouncements = announcements.filter(ann => !ann.isRead);
    if (unreadAnnouncements.length === 0) return;

    try {
      // Mark all unread announcements as read
      const promises = unreadAnnouncements.map(async (announcement) => {
        if (announcement.type === 'notification') {
          return await markNotificationAsRead(user.id, announcement.id);
        } else {
          return await markAnnouncementAsRead(user.id, announcement.id);
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;

      if (successCount > 0) {
        // Update local state for all successfully marked announcements
        setAnnouncements(prev =>
          prev.map(ann =>
            unreadAnnouncements.some(unread => unread.id === ann.id)
              ? { ...ann, isRead: true }
              : ann
          )
        );

        // Force re-filter to update counts
        setTimeout(() => {
          filterAnnouncements();
        }, 100);
      }
    } catch (error) {
      console.error('Error marking all announcements as read:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    const announcement = announcements.find(n => n.id === notificationId);
    if (!announcement || announcement.isRead) return;

    try {
      // Mark as read in the database
      let success = false;
      if (announcement.type === 'notification') {
        success = await markNotificationAsRead(user.id, notificationId);
      } else {
        success = await markAnnouncementAsRead(user.id, notificationId);
      }

      if (success) {
        // Update local state immediately for better UX
        setAnnouncements(prev =>
          prev.map(ann => ann.id === notificationId ? { ...ann, isRead: true } : ann)
        );

        // Update selected notification if it's the same one
        if (selectedNotification?.id === notificationId) {
          setSelectedNotification(prev => prev ? { ...prev, isRead: true } : null);
        }

        // Force re-filter to update counts
        setTimeout(() => {
          filterAnnouncements();
        }, 100);
      }
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      // Optionally show error toast
      // showErrorToast('Failed to mark announcement as read');
    }
  };

  const handleNavigateToLink = (link: string) => {
    if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      window.location.href = link;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Unread count is now managed by state and useEffect above

  return (
    <div className="space-y-6 mobile-container overflow-hidden">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">Announcements</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-words">
              Stay updated with important notifications and course announcements
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="text-sm w-fit">
              {unreadCount} unread
            </Badge>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="mobile-button"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Mark All Read</span>
                <span className="sm:hidden">Read All</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Important">Important</SelectItem>
                <SelectItem value="Unit">Unit</SelectItem>
                <SelectItem value="Assignment">Assignment</SelectItem>
                <SelectItem value="Information">Information</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs - Mobile Responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mobile-card">
          <TabsTrigger value="all" className="mobile-text-sm">
            <span className="hidden sm:inline">All</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="mobile-text-sm">
            <span className="hidden sm:inline">Unread ({unreadCount})</span>
            <span className="sm:hidden">New ({unreadCount})</span>
          </TabsTrigger>
          <TabsTrigger value="course" className="mobile-text-sm">
            <span className="hidden sm:inline">Unit</span>
            <span className="sm:hidden">Unit</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="mobile-text-sm">
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4 overflow-hidden">
            {filteredAnnouncements.map((announcement) => (
              <Card
                key={announcement.id}
                ref={(el) => {
                  notificationRefs.current[announcement.id] = el;
                }}
                className={`cursor-pointer transition-all hover:shadow-md mobile-card overflow-hidden ${
                  !announcement.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
                } ${
                  highlightedNotificationId === announcement.id
                    ? 'ring-2 ring-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20 animate-pulse'
                    : ''
                }`}
                onClick={() => handleAnnouncementClick(announcement)}
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 overflow-hidden">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarImage src={announcement.sender.avatar} />
                        <AvatarFallback>
                          {announcement.sender.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="flex-shrink-0">{getPriorityIcon(announcement.priority)}</div>
                          <CardTitle className="text-base sm:text-lg font-medium break-words line-clamp-2 flex-1 min-w-0">
                            {announcement.title}
                          </CardTitle>
                          {!announcement.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 text-xs sm:text-sm overflow-hidden">
                          <div className="flex items-center gap-1 min-w-0">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{announcement.sender.name} • {announcement.sender.role}</span>
                          </div>
                          {announcement.courseName && (
                            <div className="flex items-center gap-1 min-w-0">
                              <BookOpen className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{announcement.courseName}</span>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 overflow-hidden">
                      <Badge className={`${getCategoryColor(announcement.category)} text-xs flex-shrink-0 w-fit`}>
                        {announcement.category}
                      </Badge>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        <span className="truncate">{formatDate(announcement.date)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 overflow-hidden">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 break-words line-clamp-3">
                    {announcement.content}
                  </p>
                  {announcement.externalLink && (
                    <Button variant="outline" size="sm" className="mt-2 mobile-button">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAnnouncements.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <BellRing className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Announcements Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== "all" || selectedPriority !== "all"
                    ? "Try adjusting your filters to find more announcements."
                    : "You're all caught up! No new announcements at this time."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMarkAsRead={handleMarkAsRead}
        onNavigateToLink={handleNavigateToLink}
      />
    </div>
  );
};

export default Announcements;
