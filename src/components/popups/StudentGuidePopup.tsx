import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Download, 
  Play, 
  Clock, 
  Users, 
  GraduationCap,
  Settings,
  CreditCard,
  MessageSquare,
  Calendar,
  FileText,
  Video,
  Headphones,
  Star,
  ArrowRight
} from 'lucide-react';

interface StudentGuidePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentGuidePopup: React.FC<StudentGuidePopupProps> = ({ open, onOpenChange }) => {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>(['step1', 'step2']);

  const guideCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Essential steps for new students',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-blue-500',
      duration: '15 min',
      difficulty: 'Beginner',
      completion: 60,
      guides: [
        {
          id: 'first-login',
          title: 'First Time Login',
          description: 'Learn how to access your student portal for the first time',
          type: 'Interactive',
          duration: '5 min',
          steps: 6
        },
        {
          id: 'profile-setup',
          title: 'Setting Up Your Profile',
          description: 'Complete your student profile with personal information',
          type: 'Step-by-step',
          duration: '10 min',
          steps: 8
        }
      ]
    },
    {
      id: 'academic',
      title: 'Academic Management',
      description: 'Course registration, grades, and academic tools',
      icon: <GraduationCap className="h-6 w-6" />,
      color: 'bg-green-500',
      duration: '25 min',
      difficulty: 'Intermediate',
      completion: 40,
      guides: [
        {
          id: 'course-registration',
          title: 'Course Registration Guide',
          description: 'Step-by-step process for registering courses each semester',
          type: 'Video + Text',
          duration: '12 min',
          steps: 10
        },
        {
          id: 'grade-tracking',
          title: 'Understanding Your Grades',
          description: 'How to view grades, calculate GPA, and track academic progress',
          type: 'Interactive',
          duration: '8 min',
          steps: 5
        },
        {
          id: 'assignment-submission',
          title: 'Assignment Submission',
          description: 'Learn how to submit assignments and track deadlines',
          type: 'Step-by-step',
          duration: '5 min',
          steps: 4
        }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Services',
      description: 'Fee payments, financial aid, and billing',
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-purple-500',
      duration: '20 min',
      difficulty: 'Beginner',
      completion: 25,
      guides: [
        {
          id: 'fee-payment',
          title: 'How to Pay Fees',
          description: 'Complete guide to paying university fees through various methods',
          type: 'Video + Text',
          duration: '10 min',
          steps: 7
        },
        {
          id: 'financial-aid',
          title: 'Applying for Financial Aid',
          description: 'Process for applying for scholarships and bursaries',
          type: 'Document',
          duration: '10 min',
          steps: 6
        }
      ]
    },
    {
      id: 'communication',
      title: 'Communication Tools',
      description: 'Messaging, announcements, and support',
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-orange-500',
      duration: '15 min',
      difficulty: 'Beginner',
      completion: 80,
      guides: [
        {
          id: 'messaging-system',
          title: 'Using the Messaging System',
          description: 'How to communicate with lecturers and fellow students',
          type: 'Interactive',
          duration: '8 min',
          steps: 5
        },
        {
          id: 'announcements',
          title: 'Managing Announcements',
          description: 'Stay updated with university and course announcements',
          type: 'Step-by-step',
          duration: '7 min',
          steps: 4
        }
      ]
    }
  ];

  const quickStartSteps = [
    {
      id: 'step1',
      title: 'Complete Your Profile',
      description: 'Add your personal information and contact details',
      completed: true
    },
    {
      id: 'step2',
      title: 'Verify Your Email',
      description: 'Check your email and verify your account',
      completed: true
    },
    {
      id: 'step3',
      title: 'Register for Courses',
      description: 'Select and register for your semester courses',
      completed: false
    },
    {
      id: 'step4',
      title: 'Set Up Payment Method',
      description: 'Add your preferred payment method for fees',
      completed: false
    },
    {
      id: 'step5',
      title: 'Download Mobile App',
      description: 'Get the MMU mobile app for on-the-go access',
      completed: false
    }
  ];

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const completionPercentage = (completedSteps.length / quickStartSteps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Student Guide
          </DialogTitle>
          <DialogDescription>
            Comprehensive guides to help you navigate your MMU student experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Start Checklist */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Quick Start Checklist
              </CardTitle>
              <CardDescription>
                Complete these essential steps to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedSteps.length} of {quickStartSteps.length} completed
                  </span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
                
                <div className="space-y-3">
                  {quickStartSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleStepCompletion(step.id)}
                      >
                        {completedSteps.includes(step.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <h4 className={`font-medium ${completedSteps.includes(step.id) ? 'line-through text-muted-foreground' : ''}`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guide Categories */}
          <div className="grid md:grid-cols-2 gap-6">
            {guideCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${category.color} text-white`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {category.duration}
                    </Badge>
                    <Badge variant="outline">{category.difficulty}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{category.completion}% complete</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.guides.map((guide) => (
                      <div key={guide.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{guide.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{guide.description}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{guide.type}</Badge>
                            <span className="text-xs text-muted-foreground">{guide.duration}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{guide.steps} steps</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Popular Guides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Most Popular Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Course Registration', views: '2.3k', rating: 4.8 },
                  { title: 'Fee Payment Methods', views: '1.9k', rating: 4.7 },
                  { title: 'Grade Viewing', views: '1.5k', rating: 4.9 }
                ].map((guide, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{guide.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{guide.views} views</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{guide.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Download Options */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-2">Download Complete Student Handbook</h4>
                  <p className="text-sm text-muted-foreground">
                    Get the comprehensive PDF guide with all student information
                  </p>
                </div>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Need more help? Contact our support team
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

export default StudentGuidePopup;
