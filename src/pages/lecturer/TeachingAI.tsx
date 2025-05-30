import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { getLecturerCourses } from '@/services/courseService';
import { Brain, Send, User, BookOpen, FileText, Users, Lightbulb, Target, Zap, Clock, CheckCircle } from "lucide-react";

const TeachingAI = () => {
  const { dbUser } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Teaching AI Assistant. I can help you create lesson plans, generate quiz questions, develop course materials, analyze student performance, and provide teaching strategies. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!dbUser?.auth_id) return;

      try {
        const coursesData = await getLecturerCourses(dbUser.auth_id);
        setCourses(coursesData.map(course => ({
          id: course.id,
          name: `${course.code} - ${course.title}`
        })));
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [dbUser?.auth_id]);

  const quickActions = [
    {
      title: "Generate Quiz Questions",
      description: "Create quiz questions for any topic",
      icon: <FileText className="h-5 w-5" />,
      prompt: "Generate 10 multiple choice questions about binary search trees with explanations"
    },
    {
      title: "Create Lesson Plan",
      description: "Develop structured lesson plans",
      icon: <BookOpen className="h-5 w-5" />,
      prompt: "Create a detailed lesson plan for teaching database normalization to undergraduate students"
    },
    {
      title: "Assignment Ideas",
      description: "Get creative assignment suggestions",
      icon: <Lightbulb className="h-5 w-5" />,
      prompt: "Suggest 5 programming assignments for a data structures course that gradually increase in difficulty"
    },
    {
      title: "Teaching Strategies",
      description: "Get pedagogical advice",
      icon: <Target className="h-5 w-5" />,
      prompt: "What are effective strategies for teaching complex algorithms to students who struggle with abstract concepts?"
    }
  ];

  // This would be fetched from a service in a real implementation
  const [recentSuggestions, setRecentSuggestions] = useState<any[]>([]);

  // Enhanced AI response logic for teaching scenarios
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);
    
    setTimeout(() => {
      let responseContent = "";
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes("quiz") || lowerInput.includes("questions") || lowerInput.includes("test")) {
        responseContent = `I'll help you create quiz questions! Here are some sample questions for your topic:

**Multiple Choice Questions:**

1. **Which traversal method visits nodes in the order: left subtree, root, right subtree?**
   a) Preorder
   b) Inorder ✓
   c) Postorder
   d) Level-order

2. **What is the time complexity of searching in a balanced binary search tree?**
   a) O(n)
   b) O(log n) ✓
   c) O(n²)
   d) O(1)

Would you like me to generate more questions or focus on a specific difficulty level?`;

      } else if (lowerInput.includes("lesson plan") || lowerInput.includes("teaching") || lowerInput.includes("curriculum")) {
        responseContent = `Here's a structured lesson plan framework:

**Lesson: Database Normalization**
**Duration:** 90 minutes
**Learning Objectives:**
- Understand the purpose of database normalization
- Identify 1NF, 2NF, and 3NF violations
- Apply normalization rules to real-world scenarios

**Lesson Structure:**
1. **Introduction (15 min)** - Why normalize databases?
2. **First Normal Form (20 min)** - Eliminate repeating groups
3. **Second Normal Form (20 min)** - Remove partial dependencies
4. **Third Normal Form (20 min)** - Eliminate transitive dependencies
5. **Practical Exercise (10 min)** - Normalize a sample database
6. **Q&A and Summary (5 min)**

Would you like me to elaborate on any section or create materials for specific parts?`;

      } else if (lowerInput.includes("assignment") || lowerInput.includes("project") || lowerInput.includes("homework")) {
        responseContent = `Here are some engaging assignment ideas:

**Progressive Programming Assignments:**

1. **Basic Data Structures (Week 2-3)**
   - Implement a dynamic array with resize functionality
   - Difficulty: Beginner

2. **Linked List Operations (Week 4-5)**
   - Create a doubly-linked list with iterator support
   - Difficulty: Intermediate

3. **Tree Algorithms (Week 6-8)**
   - Build a binary search tree with balancing
   - Difficulty: Advanced

4. **Graph Applications (Week 9-11)**
   - Implement Dijkstra's algorithm for shortest path
   - Difficulty: Advanced

5. **Final Project (Week 12-14)**
   - Design a complete data structure library
   - Difficulty: Expert

Each assignment includes starter code, test cases, and rubric. Would you like detailed specifications for any of these?`;

      } else if (lowerInput.includes("strategy") || lowerInput.includes("pedagogy") || lowerInput.includes("difficult")) {
        responseContent = `Here are effective teaching strategies for complex concepts:

**For Abstract Concepts:**
1. **Visual Learning** - Use diagrams, animations, and interactive tools
2. **Real-world Analogies** - Connect algorithms to everyday situations
3. **Incremental Complexity** - Start simple, add complexity gradually
4. **Hands-on Practice** - Immediate application reinforces understanding

**Specific Techniques:**
- **Think-Pair-Share** - Students discuss concepts in pairs
- **Code Tracing** - Step through algorithms line by line
- **Peer Teaching** - Advanced students mentor struggling ones
- **Multiple Representations** - Show the same concept in different ways

**For Struggling Students:**
- Provide additional office hours
- Create supplementary materials
- Use formative assessments to identify gaps early
- Encourage questions and create a safe learning environment

Would you like specific examples for any of these strategies?`;

      } else if (lowerInput.includes("grade") || lowerInput.includes("assess") || lowerInput.includes("rubric")) {
        responseContent = `I can help you create fair and comprehensive assessment strategies:

**Assessment Framework:**
- **Formative (30%)** - Quizzes, participation, peer reviews
- **Summative (70%)** - Assignments, projects, exams

**Rubric Categories:**
1. **Technical Correctness (40%)**
2. **Code Quality & Style (25%)**
3. **Documentation & Comments (20%)**
4. **Problem-Solving Approach (15%)**

**Grading Best Practices:**
- Provide detailed feedback within 1 week
- Use consistent rubrics across assignments
- Offer opportunities for improvement
- Consider effort and progress, not just final results

Would you like me to create a specific rubric for your assignment?`;

      } else {
        responseContent = `I'm here to support your teaching! I can help you with:

📚 **Content Creation:**
- Lesson plans and curricula
- Quiz and exam questions
- Assignment specifications
- Course materials

👥 **Student Support:**
- Analyze performance patterns
- Suggest intervention strategies
- Create supplementary resources
- Design study guides

🎯 **Teaching Strategies:**
- Pedagogical approaches
- Engagement techniques
- Assessment methods
- Classroom management

💡 **Innovation:**
- Interactive learning activities
- Technology integration
- Project-based learning
- Collaborative exercises

What specific area would you like to explore today?`;
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: responseContent }]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Teaching AI Assistant</h1>
          <p className="text-muted-foreground">Your intelligent teaching companion for course development and student support</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select course context" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="tools">Quick Tools</TabsTrigger>
          <TabsTrigger value="history">Recent Work</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="border-none">
            <CardContent className="p-6 h-[calc(100vh-16rem)] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`flex items-start space-x-2 max-w-[85%] ${
                        message.role === 'user' 
                          ? 'flex-row-reverse space-x-reverse' 
                          : 'flex-row'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        message.role === 'user' 
                          ? 'bg-primary/10' 
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {message.role === 'user' 
                          ? <User className="h-5 w-5 text-primary" /> 
                          : <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                        }
                      </div>
                      <div className={`rounded-lg px-4 py-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="bg-secondary rounded-lg px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Ask me to help with lesson planning, quiz generation, teaching strategies, or any educational content..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1 min-h-[60px] resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!input.trim() || isLoading}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Teaching AI provides educational assistance and content generation. Always review AI-generated content for accuracy and appropriateness.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleQuickAction(action.prompt)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {action.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Try This Tool
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Custom Request</CardTitle>
              <CardDescription>Describe what you need help with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Describe your teaching challenge or what you'd like to create..."
                rows={3}
              />
              <div className="flex space-x-2">
                <Select>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">Lesson Plan</SelectItem>
                    <SelectItem value="quiz">Quiz/Assessment</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="strategy">Teaching Strategy</SelectItem>
                    <SelectItem value="material">Course Material</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Assistance</CardTitle>
              <CardDescription>Your recent teaching content and tools</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No AI assistance history yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start using the AI tools to see your generated content here
                  </p>
                  <Button onClick={() => setActiveTab("chat")}>
                    <Brain className="h-4 w-4 mr-2" />
                    Start AI Chat
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSuggestions.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {item.type.includes('Quiz') && <FileText className="h-4 w-4" />}
                          {item.type.includes('Lesson') && <BookOpen className="h-4 w-4" />}
                          {item.type.includes('Assignment') && <Target className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.type} • {item.course}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{item.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={item.status === 'completed' ? 'default' : 'outline'}>
                          {item.status === 'completed' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {item.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeachingAI;
