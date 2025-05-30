import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  ExternalLink,
  User,
  BookOpen,
  AlertTriangle,
  Info,
  CheckCircle,
  Star,
  Globe,
  Lock,
  X,
  Bell
} from 'lucide-react';
import { EnhancedNotification } from '@/services/notificationService';

interface NotificationDetailModalProps {
  notification: EnhancedNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (notificationId: string) => void;
  onNavigateToLink?: (link: string) => void;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  isOpen,
  onClose,
  onMarkAsRead,
  onNavigateToLink
}) => {
  if (!notification) return null;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <Star className="h-5 w-5 text-orange-500" />;
      case 'normal':
      case 'medium':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'normal':
      case 'medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'important':
        return 'bg-red-500 text-white';
      case 'unit':
      case 'academic':
        return 'bg-blue-500 text-white';
      case 'assignment':
        return 'bg-orange-500 text-white';
      case 'information':
      case 'general':
        return 'bg-green-500 text-white';
      case 'finance':
        return 'bg-purple-500 text-white';
      case 'system':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-indigo-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleExternalLink = () => {
    if (notification.externalLink && onNavigateToLink) {
      onNavigateToLink(notification.externalLink);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getPriorityIcon(notification.priority)}
              <DialogTitle className="text-xl font-semibold leading-tight">
                {notification.title}
              </DialogTitle>
              {!notification.isRead && (
                <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getPriorityColor(notification.priority)}>
              {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
            </Badge>
            <Badge className={getCategoryColor(notification.category)}>
              {notification.category}
            </Badge>
            {notification.isPublic ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-600 border-gray-600">
                <Lock className="h-3 w-3 mr-1" />
                Internal
              </Badge>
            )}
            {!notification.isRead && (
              <Badge variant="secondary">
                Unread
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Separator />

        {/* Sender Information */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={notification.sender.avatar} />
            <AvatarFallback>
              {notification.sender.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{notification.sender.name}</span>
              <Badge variant="outline" className="text-xs">
                {notification.sender.role}
              </Badge>
            </div>
            {notification.courseName && (
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{notification.courseName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Message</h4>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {notification.content}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm font-medium">{formatDate(notification.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium">
                  {notification.isRead ? 'Read' : 'Unread'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-2">
            {!notification.isRead && (
              <Button
                variant="outline"
                onClick={handleMarkAsRead}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Read
              </Button>
            )}
            {notification.externalLink && (
              <Button
                onClick={handleExternalLink}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Details
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDetailModal;
