import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePopupActions } from '@/components/popups/PopupManager';
import { 
  HelpCircle, 
  BookOpen, 
  Shield, 
  FileText, 
  Headphones,
  ExternalLink,
  Clock,
  Users,
  Star
} from 'lucide-react';

interface ResourcesMenuProps {
  compact?: boolean;
  showTitle?: boolean;
}

const ResourcesMenu: React.FC<ResourcesMenuProps> = ({ compact = false, showTitle = true }) => {
  const { openHelpCenter, openFAQs, openStudentGuide, openPrivacyPolicy, openTermsOfUse } = usePopupActions();

  const resources = [
    {
      id: 'help-center',
      title: 'Help Center',
      description: 'Get comprehensive support and assistance',
      icon: <Headphones className="h-5 w-5" />,
      color: 'bg-blue-500',
      action: openHelpCenter,
      popular: true,
      estimatedTime: '5-10 min'
    },
    {
      id: 'faqs',
      title: 'FAQs',
      description: 'Frequently asked questions and answers',
      icon: <HelpCircle className="h-5 w-5" />,
      color: 'bg-green-500',
      action: openFAQs,
      popular: true,
      estimatedTime: '2-5 min'
    },
    {
      id: 'student-guide',
      title: 'Student Guide',
      description: 'Complete guide to using the student portal',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-purple-500',
      action: openStudentGuide,
      popular: false,
      estimatedTime: '15-20 min'
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      description: 'How we protect and use your personal information',
      icon: <Shield className="h-5 w-5" />,
      color: 'bg-orange-500',
      action: openPrivacyPolicy,
      popular: false,
      estimatedTime: '10-15 min'
    },
    {
      id: 'terms-of-use',
      title: 'Terms of Use',
      description: 'Legal terms and conditions for using our services',
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-gray-500',
      action: openTermsOfUse,
      popular: false,
      estimatedTime: '10-15 min'
    }
  ];

  if (compact) {
    return (
      <div className="space-y-2">
        {showTitle && (
          <h3 className="font-semibold text-sm text-muted-foreground">Resources</h3>
        )}
        <div className="space-y-1">
          {resources.map((resource) => (
            <Button
              key={resource.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-auto p-2"
              onClick={resource.action}
            >
              <div className={`p-1.5 rounded ${resource.color} text-white mr-3`}>
                {resource.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{resource.title}</span>
                  {resource.popular && (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-primary mb-2">Student Resources</h2>
          <p className="text-muted-foreground">
            Access help, guides, and important information about your student experience
          </p>
        </div>
      )}

      {/* Popular Resources */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold">Most Popular</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {resources.filter(r => r.popular).map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={resource.action}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${resource.color} text-white`}>
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {resource.title}
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    </CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{resource.estimatedTime}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Open
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Resources */}
      <div>
        <h3 className="font-semibold mb-4">All Resources</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={resource.action}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${resource.color} text-white`}>
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {resource.title}
                      {resource.popular && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      )}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{resource.estimatedTime}</span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary text-primary-foreground">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Need Personal Assistance?</h4>
              <p className="text-sm text-muted-foreground">
                Contact our student support team for personalized help with your academic journey
              </p>
            </div>
            <Button onClick={openHelpCenter}>
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesMenu;
