import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Bell, Calendar, ChevronRight, Clock, ExternalLink, Globe, Lock, Megaphone, X, User, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPublic: boolean;
  category: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  expiresAt?: string;
  externalLink?: string;
  targetAudience: string;
}

interface AnnouncementBannerProps {
  showPublicOnly?: boolean;
  maxAnnouncements?: number;
  compact?: boolean;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ 
  showPublicOnly = false, 
  maxAnnouncements = 3,
  compact = false 
}) => {
  const { dbUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    fetchAnnouncements();
    // Load dismissed announcements from localStorage
    const dismissed = localStorage.getItem('dismissedAnnouncements');
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed));
    }
  }, [dbUser, showPublicOnly]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('announcements')
        .select(`
          *,
          users!announcements_created_by_fkey (
            full_name,
            role
          )
        `)
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(maxAnnouncements * 2); // Fetch more to account for filtering

      // Filter based on visibility and user context
      if (showPublicOnly) {
        query = query.eq('is_public', true);
      } else if (dbUser) {
        // Show public announcements and those targeted to user's role/faculty
        query = query.or(`is_public.eq.true,target_audience.eq.${dbUser.role},faculty.eq.${dbUser.faculty}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedAnnouncements: Announcement[] = data?.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        isPublic: announcement.is_public,
        category: announcement.category || 'General',
        authorName: announcement.users?.full_name || 'System',
        authorRole: announcement.users?.role || 'Admin',
        createdAt: announcement.created_at,
        expiresAt: announcement.expires_at,
        externalLink: announcement.external_link,
        targetAudience: announcement.target_audience || 'all'
      })) || [];

      // Filter out expired announcements
      const activeAnnouncements = formattedAnnouncements.filter(announcement => {
        if (!announcement.expiresAt) return true;
        return new Date(announcement.expiresAt) > new Date();
      });

      setAnnouncements(activeAnnouncements.slice(0, maxAnnouncements));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (announcementId: string) => {
    const newDismissed = [...dismissedAnnouncements, announcementId];
    setDismissedAnnouncements(newDismissed);
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <Bell className="h-4 w-4 text-orange-600" />;
      default: return <Megaphone className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAnnouncementStyle = (announcement: Announcement) => {
    if (announcement.priority === 'urgent') {
      return 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-lg';
    } else if (announcement.priority === 'high') {
      return 'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-md';
    } else if (announcement.isPublic) {
      return 'border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-md';
    }
    return 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20';
  };

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    announcement => !dismissedAnnouncements.includes(announcement.id)
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded flex-1"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-2 mobile-container overflow-hidden">
        {visibleAnnouncements.map((announcement) => (
          <Dialog key={announcement.id}>
            <DialogTrigger asChild>
              <Card className={`${getAnnouncementStyle(announcement)} hover:shadow-lg transition-all duration-200 cursor-pointer mobile-card overflow-hidden`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0">{getPriorityIcon(announcement.priority)}</div>
                      <span className="font-medium text-sm break-words line-clamp-1 flex-1 min-w-0">{announcement.title}</span>
                      {announcement.isPublic && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          <Globe className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Public</span>
                          <span className="sm:hidden">Pub</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge className={`text-xs ${getPriorityColor(announcement.priority)} hidden sm:block`}>
                        {announcement.priority}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(announcement.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {getPriorityIcon(announcement.priority)}
                  {announcement.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {announcement.authorName} ({announcement.authorRole})
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority.toUpperCase()} Priority
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {announcement.category}
                  </Badge>
                  {announcement.isPublic && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Globe className="h-3 w-3 mr-1" />
                      Public Announcement
                    </Badge>
                  )}
                  {announcement.expiresAt && (
                    <Badge variant="outline" className="flex items-center gap-1 text-orange-600">
                      <Clock className="h-3 w-3" />
                      Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>

                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                </div>

                {announcement.externalLink && (
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full sm:w-auto">
                      <a href={announcement.externalLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit External Link
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mobile-container overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 min-w-0">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="break-words">
            {showPublicOnly ? 'Public Announcements' : 'Latest Announcements'}
          </span>
        </h3>
        {visibleAnnouncements.length > 0 && (
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <a href="/announcements">
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        )}
      </div>

      <div className="space-y-3 overflow-hidden">
        {visibleAnnouncements.map((announcement) => (
          <Dialog key={announcement.id}>
            <Card className={`${getAnnouncementStyle(announcement)} hover:shadow-lg transition-all duration-200 mobile-card overflow-hidden`}>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 overflow-hidden">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="flex-shrink-0">{getPriorityIcon(announcement.priority)}</div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base font-semibold break-words line-clamp-2">
                        {announcement.title}
                      </CardTitle>
                      <CardDescription className="text-xs flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 overflow-hidden">
                        <span className="truncate">By {announcement.authorName}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="h-3 w-3" />
                          <span className="truncate">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 overflow-hidden">
                    <Badge className={`text-xs ${getPriorityColor(announcement.priority)} flex-shrink-0`}>
                      {announcement.priority}
                    </Badge>
                    {announcement.isPublic && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs flex-shrink-0">
                        <Globe className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Public</span>
                        <span className="sm:hidden">Pub</span>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 flex-shrink-0 ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(announcement.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <DialogTrigger asChild>
                <CardContent className="pt-0 cursor-pointer overflow-hidden">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 break-words line-clamp-3">
                    {announcement.content.length > 150
                      ? `${announcement.content.substring(0, 150)}...`
                      : announcement.content
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {announcement.category}
                      </Badge>
                      {announcement.expiresAt && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          <span className="truncate">Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {announcement.externalLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                          className="mobile-button"
                        >
                          <a href={announcement.externalLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Link</span>
                            <span className="sm:hidden">Go</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="mobile-button">
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </DialogTrigger>
            </Card>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  {getPriorityIcon(announcement.priority)}
                  {announcement.title}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {announcement.authorName} ({announcement.authorRole})
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority.toUpperCase()} Priority
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {announcement.category}
                  </Badge>
                  {announcement.isPublic && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Globe className="h-3 w-3 mr-1" />
                      Public Announcement
                    </Badge>
                  )}
                  {announcement.expiresAt && (
                    <Badge variant="outline" className="flex items-center gap-1 text-orange-600">
                      <Clock className="h-3 w-3" />
                      Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>

                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
                </div>

                {announcement.externalLink && (
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full sm:w-auto">
                      <a href={announcement.externalLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit External Link
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBanner;
