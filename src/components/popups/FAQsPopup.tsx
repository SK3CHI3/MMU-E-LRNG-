import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  BookOpen, 
  CreditCard, 
  Settings, 
  GraduationCap,
  Users,
  Clock,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface FAQsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FAQsPopup: React.FC<FAQsPopupProps> = ({ open, onOpenChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const categories = [
    { id: 'all', name: 'All FAQs', icon: <HelpCircle className="h-4 w-4" />, count: 24 },
    { id: 'academic', name: 'Academic', icon: <GraduationCap className="h-4 w-4" />, count: 8 },
    { id: 'technical', name: 'Technical', icon: <Settings className="h-4 w-4" />, count: 6 },
    { id: 'financial', name: 'Financial', icon: <CreditCard className="h-4 w-4" />, count: 5 },
    { id: 'account', name: 'Account', icon: <Users className="h-4 w-4" />, count: 5 }
  ];

  const faqs = [
    {
      id: '1',
      category: 'academic',
      question: 'How do I register for courses?',
      answer: 'To register for courses: 1) Log into your student portal, 2) Navigate to "Course Registration" in the Academic section, 3) Select your desired courses from the available list, 4) Ensure you meet all prerequisites, 5) Submit your registration. Registration periods are announced via email and posted on the academic calendar.',
      helpful: 45,
      tags: ['registration', 'courses', 'academic']
    },
    {
      id: '2',
      category: 'technical',
      question: 'I forgot my password. How do I reset it?',
      answer: 'To reset your password: 1) Go to the login page, 2) Click "Forgot Password", 3) Enter your admission number or email, 4) Check your email for reset instructions, 5) Follow the link to create a new password. If you don\'t receive the email, check your spam folder or contact IT support.',
      helpful: 38,
      tags: ['password', 'login', 'account']
    },
    {
      id: '3',
      category: 'financial',
      question: 'What payment methods are accepted for fees?',
      answer: 'MMU accepts the following payment methods: 1) Bank transfers to our official accounts, 2) Mobile money (M-Pesa, Airtel Money), 3) Credit/Debit cards through our online portal, 4) Cash payments at designated bank branches, 5) Cheques payable to "Multimedia University of Kenya". Always use your admission number as the reference.',
      helpful: 52,
      tags: ['payment', 'fees', 'mpesa']
    },
    {
      id: '4',
      category: 'academic',
      question: 'How do I view my grades and transcripts?',
      answer: 'To access your grades: 1) Log into the student portal, 2) Go to "Academic Records" or "Grades", 3) Select the semester/year you want to view, 4) Your grades will be displayed with GPA calculations. For official transcripts, visit the Academic Office or request through the portal\'s transcript request feature.',
      helpful: 41,
      tags: ['grades', 'transcript', 'academic records']
    },
    {
      id: '5',
      category: 'technical',
      question: 'Why can\'t I access certain features in the portal?',
      answer: 'Feature access may be restricted due to: 1) Outstanding fees - some features are disabled until payment, 2) Academic holds - contact the Academic Office, 3) Incomplete registration, 4) Browser compatibility issues - try Chrome or Firefox, 5) Maintenance periods - check announcements for scheduled downtime.',
      helpful: 29,
      tags: ['access', 'features', 'restrictions']
    },
    {
      id: '6',
      category: 'financial',
      question: 'How do I apply for financial aid or scholarships?',
      answer: 'To apply for financial assistance: 1) Visit the Financial Aid Office or check the portal\'s "Financial Aid" section, 2) Download and complete the application forms, 3) Gather required documents (income statements, academic records), 4) Submit before the deadline, 5) Await review and notification. Merit-based scholarships are awarded automatically based on academic performance.',
      helpful: 36,
      tags: ['financial aid', 'scholarship', 'bursary']
    },
    {
      id: '7',
      category: 'account',
      question: 'How do I update my personal information?',
      answer: 'To update your information: 1) Log into your portal, 2) Go to "Profile" or "Personal Information", 3) Click "Edit" on the section you want to change, 4) Make your updates, 5) Save changes. Some changes (like name corrections) may require supporting documents and approval from the Registrar\'s Office.',
      helpful: 33,
      tags: ['profile', 'personal info', 'update']
    },
    {
      id: '8',
      category: 'academic',
      question: 'What is the deadline for course registration?',
      answer: 'Course registration deadlines vary by semester: 1) Regular registration: First two weeks of the semester, 2) Late registration: Third week (with penalty fees), 3) Add/Drop period: First week only, 4) Withdrawal deadline: Mid-semester (check academic calendar). Specific dates are published in the academic calendar and sent via email.',
      helpful: 44,
      tags: ['deadline', 'registration', 'calendar']
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="h-6 w-6 text-primary" />
            Frequently Asked Questions
          </DialogTitle>
          <DialogDescription>
            Find quick answers to the most common questions about MMU services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search FAQs..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No FAQs found matching your search.</p>
                <p className="text-sm">Try different keywords or browse by category.</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <Collapsible key={faq.id} open={openItems.includes(faq.id)}>
                  <CollapsibleTrigger
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm md:text-base">{faq.question}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === faq.category)?.name}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <ThumbsUp className="h-3 w-3" />
                            {faq.helpful} helpful
                          </div>
                        </div>
                      </div>
                      {openItems.includes(faq.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {faq.answer}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {faq.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Was this helpful?</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {filteredFAQs.length} of {faqs.length} FAQs
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

export default FAQsPopup;
