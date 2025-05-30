import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  BookOpen, 
  Users, 
  Settings, 
  CreditCard,
  GraduationCap,
  FileText,
  Video,
  Headphones
} from 'lucide-react';

interface HelpCenterPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HelpCenterPopup: React.FC<HelpCenterPopupProps> = ({ open, onOpenChange }) => {
  const helpCategories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      articles: [
        "How to access your student portal",
        "Setting up your profile",
        "Navigating the dashboard",
        "Understanding your academic calendar"
      ]
    },
    {
      title: "Academic Support",
      icon: <GraduationCap className="h-5 w-5" />,
      color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      articles: [
        "Course registration process",
        "Assignment submission guidelines",
        "Grade viewing and transcripts",
        "Academic calendar and deadlines"
      ]
    },
    {
      title: "Technical Issues",
      icon: <Settings className="h-5 w-5" />,
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      articles: [
        "Login and password issues",
        "Browser compatibility",
        "Mobile app troubleshooting",
        "System maintenance updates"
      ]
    },
    {
      title: "Financial Services",
      icon: <CreditCard className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      articles: [
        "Fee payment methods",
        "Financial aid applications",
        "Scholarship opportunities",
        "Payment plan options"
      ]
    }
  ];

  const contactMethods = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageSquare className="h-6 w-6" />,
      availability: "24/7 Available",
      action: "Start Chat",
      color: "bg-blue-500"
    },
    {
      title: "Phone Support",
      description: "Call us for immediate assistance",
      icon: <Phone className="h-6 w-6" />,
      availability: "Mon-Fri 8AM-6PM",
      action: "+254 20 386 4000",
      color: "bg-green-500"
    },
    {
      title: "Email Support",
      description: "Send us your questions via email",
      icon: <Mail className="h-6 w-6" />,
      availability: "Response within 24hrs",
      action: "support@mmu.ac.ke",
      color: "bg-purple-500"
    },
    {
      title: "Video Call",
      description: "Schedule a video consultation",
      icon: <Video className="h-6 w-6" />,
      availability: "By Appointment",
      action: "Schedule Call",
      color: "bg-orange-500"
    }
  ];

  const quickActions = [
    { title: "Reset Password", icon: <Settings className="h-4 w-4" /> },
    { title: "Update Profile", icon: <Users className="h-4 w-4" /> },
    { title: "Download Transcript", icon: <FileText className="h-4 w-4" /> },
    { title: "Payment Issues", icon: <CreditCard className="h-4 w-4" /> }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Headphones className="h-6 w-6 text-primary" />
            MMU Help Center
          </DialogTitle>
          <DialogDescription>
            Find answers to your questions and get the support you need
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search for help articles, guides, or FAQs..." 
              className="pl-10 py-3"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <Button key={index} variant="outline" className="h-auto p-3 flex flex-col gap-2">
                  {action.icon}
                  <span className="text-xs">{action.title}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Help Categories */}
          <div>
            <h3 className="font-semibold mb-4">Browse by Category</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {helpCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        {category.icon}
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex} className="text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                          • {article}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Methods */}
          <div>
            <h3 className="font-semibold mb-4">Contact Support</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {contactMethods.map((method, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${method.color} text-white`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{method.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {method.availability}
                          </Badge>
                          <Button size="sm" variant="outline">
                            {method.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Campus Information */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Visit Our Campus</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    For in-person assistance, visit our student services office
                  </p>
                  <div className="space-y-1 text-sm">
                    <p><strong>Main Campus:</strong> Mbagathi Way, Off Magadi Road, Nairobi</p>
                    <p><strong>Hours:</strong> Monday - Friday: 8:00 AM - 5:00 PM</p>
                    <p><strong>Student Services:</strong> Ground Floor, Administration Block</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Can't find what you're looking for?
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button>
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpCenterPopup;
