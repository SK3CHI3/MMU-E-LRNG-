
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HelpCircle, Send, Search, MessageSquare, Clock, CheckCircle, AlertCircle, PhoneCall, Mail } from "lucide-react";

const Support = () => {
  // This would come from an API in a real app
  const supportTickets = [
    {
      id: "TKT-1001",
      title: "Unable to access class recordings",
      status: "open",
      date: "May 19, 2025",
      lastUpdate: "1 hour ago",
      messages: 3
    },
    {
      id: "TKT-982",
      title: "Fee payment not reflecting in account",
      status: "in progress",
      date: "May 15, 2025",
      lastUpdate: "1 day ago",
      messages: 5
    },
    {
      id: "TKT-967",
      title: "Password reset request",
      status: "resolved",
      date: "May 10, 2025",
      lastUpdate: "5 days ago",
      messages: 4
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Open
          </Badge>
        );
      case "in progress":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  const faqs = [
    {
      question: "How do I register for units?",
      answer: "To register for units, navigate to the Dashboard and click on 'Unit Registration'. You must have paid at least 60% of your semester fees to be eligible for unit registration. Follow the on-screen instructions to select and confirm your units for the semester."
    },
    {
      question: "What is the fee payment deadline?",
      answer: "Fee payment deadlines vary by semester. The current semester deadline is June 15, 2025. You can view your specific deadline on the Fees page. Please note that late payments may incur additional charges and might affect your ability to register for units or access certain LMS features."
    },
    {
      question: "I missed a class session. How can I catch up?",
      answer: "For online classes, recordings are available in the Class Sessions section for up to two weeks after the session. For physical classes, you can access any shared materials and notes from the Resources section. It's also recommended to contact your lecturer or classmates for additional assistance."
    },
    {
      question: "How many supplementary exams am I allowed to take?",
      answer: "Students are allowed to take up to 3 supplementary exams per failed unit. Each attempt requires a separate payment. After the third unsuccessful attempt, you'll need to retake the entire unit. You can track your supplementary exam status in the Grades section."
    },
    {
      question: "How can I get help from Comrade AI?",
      answer: "Comrade AI is accessible from any page via the floating AI assistant icon in the bottom right corner. You can ask questions about course content, request explanations of difficult concepts, generate practice quizzes, or get help with assignments (within academic integrity guidelines)."
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">Get help with your MMU LMS account and services.</p>
      </div>

      <Tabs defaultValue="contact">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <Clock className="h-4 w-4 mr-2" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="faq">
            <HelpCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>Let us know how we can help you with your issue or question.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="subject">Subject</label>
                <Input id="subject" placeholder="Briefly describe your issue" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="category">Category</label>
                <select 
                  id="category" 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Management</option>
                  <option value="fees">Fees & Payments</option>
                  <option value="academic">Academic Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="message">Message</label>
                <Textarea 
                  id="message" 
                  placeholder="Describe your issue or question in detail" 
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="attachments">Attachments (optional)</label>
                <Input id="attachments" type="file" multiple />
                <p className="text-xs text-muted-foreground">Upload screenshots or relevant files (Max: 5MB each)</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Other Ways to Get Help</CardTitle>
              <CardDescription>Reach out to us through multiple channels.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4 rounded-lg border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <PhoneCall className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Call Us</h3>
                <p className="text-sm text-muted-foreground mb-2">Available Mon-Fri, 8AM-5PM</p>
                <p className="text-sm font-medium">+254 712 345 678</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">24-hour response time</p>
                <p className="text-sm font-medium">support@mmu.ac.ke</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-2">Available 24/7</p>
                <Button size="sm" variant="outline">Start Chat</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tickets" className="space-y-4 mt-6">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search tickets..." />
            </div>
            <Button>New Ticket</Button>
          </div>
          
          <div className="space-y-4">
            {supportTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-medium">{ticket.title}</CardTitle>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        Ticket {ticket.id} • Opened on {ticket.date}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {ticket.messages}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">Last update: {ticket.lastUpdate}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions about the MMU LMS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search FAQs..." />
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-sm font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              <div className="rounded-lg border p-4 mt-8">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Didn't find what you're looking for?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contact our support team for personalized assistance with your specific situation.
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
