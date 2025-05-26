import { useState, useEffect } from "react";
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

const Announcements = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<EnhancedNotification[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<EnhancedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user?.id) {
      loadAnnouncements();
    }
  }, [user?.id]);

  useEffect(() => {
    filterAnnouncements();
  }, [searchTerm, selectedCategory, selectedPriority, activeTab, announcements]);

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
    if (!user?.id) return;

    // Mark as read if not already read
    if (!announcement.isRead) {
      try {
        if (announcement.type === 'notification') {
          await markNotificationAsRead(user.id, announcement.id);
        } else {
          await markAnnouncementAsRead(user.id, announcement.id);
        }
        // Update local state
        setAnnouncements(prev =>
          prev.map(ann => ann.id === announcement.id ? { ...ann, isRead: true } : ann)
        );
      } catch (error) {
        console.error('Error marking announcement as read:', error);
      }
    }

    // Handle navigation
    if (announcement.externalLink) {
      if (announcement.externalLink.startsWith('http')) {
        window.open(announcement.externalLink, '_blank');
      } else {
        // Navigate to internal route
        window.location.href = announcement.externalLink;
      }
    }
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

  const unreadCount = announcements.filter(ann => !ann.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with important notifications and course announcements
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {unreadCount} unread
        </Badge>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="course">Unit</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <Card
                key={announcement.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !announcement.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
                onClick={() => handleAnnouncementClick(announcement)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={announcement.sender.avatar} />
                        <AvatarFallback>
                          {announcement.sender.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(announcement.priority)}
                          <CardTitle className="text-lg font-medium">
                            {announcement.title}
                          </CardTitle>
                          {!announcement.isRead && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <User className="h-3 w-3" />
                          {announcement.sender.name} • {announcement.sender.role}
                          {announcement.courseName && (
                            <>
                              <BookOpen className="h-3 w-3 ml-2" />
                              {announcement.courseName}
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(announcement.category)}>
                        {announcement.category}
                      </Badge>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(announcement.date)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {announcement.content}
                  </p>
                  {announcement.externalLink && (
                    <Button variant="outline" size="sm" className="mt-2">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View Details
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
    </div>
  );
};

export default Announcements;
