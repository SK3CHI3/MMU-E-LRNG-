import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Send,
  User,
  BookOpen,
  FileText,
  Lightbulb,
  Target,
  Clock,
  HelpCircle,
  Zap,
  CheckCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCourses } from "@/services/studentService";
import { showErrorToast } from "@/utils/ui/toast";

interface EnrolledUnit {
  id: string;
  code: string;
  name: string;
  instructor: string;
}

const StudyAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Study AI Assistant. I can help you understand concepts, generate practice questions, create study plans, explain difficult topics, and provide learning strategies. How can I help you with your studies today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [enrolledUnits, setEnrolledUnits] = useState<EnrolledUnit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchEnrolledUnits();
    }
  }, [user?.id]);

  const fetchEnrolledUnits = async () => {
    if (!user?.id) return;

    try {
      setUnitsLoading(true);
      const courses = await getStudentCourses(user.id);

      // Transform courses to the format expected by the AI component
      const transformedUnits = courses.map(course => ({
        id: course.id,
        code: course.code,
        name: `${course.code} - ${course.name}`,
        instructor: course.instructor
      }));

      setEnrolledUnits(transformedUnits);
    } catch (error) {
      console.error('Error fetching enrolled units:', error);
      showErrorToast('Failed to load enrolled units');
      // Set fallback empty array
      setEnrolledUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Explain Concept",
      description: "Get clear explanations of difficult topics",
      icon: <HelpCircle className="h-5 w-5" />,
      prompt: "Can you explain the concept of binary search trees in simple terms with examples?"
    },
    {
      title: "Practice Questions",
      description: "Generate practice questions for any topic",
      icon: <FileText className="h-5 w-5" />,
      prompt: "Generate 5 practice questions about database normalization with detailed solutions"
    },
    {
      title: "Study Plan",
      description: "Create personalized study schedules",
      icon: <Target className="h-5 w-5" />,
      prompt: "Help me create a study plan for my upcoming data structures exam in 2 weeks"
    },
    {
      title: "Assignment Help",
      description: "Get guidance on assignments",
      icon: <Lightbulb className="h-5 w-5" />,
      prompt: "I'm struggling with my software engineering project. Can you help me understand the requirements and suggest an approach?"
    },
    {
      title: "Exam Preparation",
      description: "Strategies for exam success",
      icon: <TrendingUp className="h-5 w-5" />,
      prompt: "What are the best strategies to prepare for a computer networks exam? Include study techniques and key topics to focus on."
    },
    {
      title: "Quick Review",
      description: "Summarize key concepts",
      icon: <Zap className="h-5 w-5" />,
      prompt: "Give me a quick review of the most important concepts in database management systems"
    }
  ];

  // Enhanced AI response logic for student learning scenarios
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      let responseContent = "";
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes("explain") || lowerInput.includes("concept") || lowerInput.includes("understand")) {
        responseContent = `I'd be happy to explain that concept! Let me break it down for you:

**Key Points:**

🔍 **Definition**: The concept you're asking about involves understanding the fundamental principles and how they apply in practice.

📚 **Simple Explanation**: Think of it like building blocks - each concept builds upon previous knowledge to create a complete understanding.

💡 **Real-world Example**:
- Imagine you're organizing a library (database)
- Each book has specific information (data)
- You need a system to find books quickly (indexing)
- Rules ensure books are properly categorized (constraints)

🎯 **Key Takeaways**:
1. Start with the basics and build up
2. Practice with examples
3. Connect to real-world applications
4. Review regularly to reinforce learning

Would you like me to dive deeper into any specific aspect or provide more examples?`;

      } else if (lowerInput.includes("practice") || lowerInput.includes("questions") || lowerInput.includes("quiz")) {
        responseContent = `Here are some practice questions to test your understanding:

**Practice Questions:**

**Question 1: Multiple Choice**
Which of the following best describes a binary search tree?
a) A tree where each node has exactly two children
b) A tree where left child ≤ parent ≤ right child ✓
c) A tree with binary data only
d) A balanced tree structure

**Question 2: Short Answer**
Explain the time complexity of searching in a binary search tree and why it can vary.

**Answer**: O(log n) in best/average case for balanced trees, O(n) in worst case for skewed trees.

**Question 3: Problem Solving**
Given the array [5, 3, 8, 1, 4, 7, 9], draw the binary search tree that would result from inserting these elements in order.

**Question 4: Application**
When would you choose a binary search tree over a simple array for storing data?

**Study Tips:**
- Practice drawing trees by hand
- Trace through algorithms step by step
- Understand both recursive and iterative approaches
- Connect concepts to real-world scenarios

Would you like more questions on this topic or a different subject?`;

      } else if (lowerInput.includes("study plan") || lowerInput.includes("schedule") || lowerInput.includes("exam")) {
        responseContent = `Here's a personalized study plan strategy:

**📅 2-Week Study Plan Framework:**

**Week 1: Foundation Building**
- **Days 1-2**: Review lecture notes and textbook chapters
- **Days 3-4**: Practice basic problems and examples
- **Days 5-6**: Create concept maps and summaries
- **Day 7**: First practice test and identify weak areas

**Week 2: Intensive Practice**
- **Days 8-9**: Focus on weak areas identified
- **Days 10-11**: Solve past papers and advanced problems
- **Days 12-13**: Group study and teach concepts to others
- **Day 14**: Final review and relaxation

**📚 Daily Study Structure (2-3 hours):**
1. **Warm-up** (15 min): Review previous day's notes
2. **New Content** (60 min): Learn new concepts
3. **Practice** (45 min): Solve problems
4. **Review** (15 min): Summarize key points
5. **Break** (15 min): Rest and recharge

**🎯 Study Techniques:**
- **Active Recall**: Test yourself without looking at notes
- **Spaced Repetition**: Review material at increasing intervals
- **Feynman Technique**: Explain concepts in simple terms
- **Practice Testing**: Simulate exam conditions

**📝 Resources to Use:**
- Lecture slides and recordings
- Textbook exercises
- Online practice platforms
- Study groups and discussion forums

Would you like me to customize this plan for a specific subject or timeframe?`;

      } else if (lowerInput.includes("assignment") || lowerInput.includes("project") || lowerInput.includes("homework")) {
        responseContent = `I can help you approach your assignment systematically:

**🎯 Assignment Strategy Framework:**

**Step 1: Understanding Requirements**
- Read the assignment brief carefully
- Identify key deliverables and deadlines
- Note grading criteria and expectations
- Clarify any unclear points with your lecturer

**Step 2: Planning & Research**
- Break down the assignment into smaller tasks
- Create a timeline with milestones
- Gather relevant resources and references
- Outline your approach and methodology

**Step 3: Implementation**
- Start with the easiest parts to build momentum
- Follow academic writing/coding standards
- Document your work as you progress
- Regular check-ins against requirements

**Step 4: Review & Polish**
- Proofread for errors and clarity
- Ensure all requirements are met
- Get feedback from peers if possible
- Submit before the deadline

**💡 Common Assignment Types & Tips:**

**Research Papers:**
- Start with a strong thesis statement
- Use credible academic sources
- Follow proper citation format
- Structure: Introduction → Body → Conclusion

**Programming Projects:**
- Plan your code structure first
- Write clean, commented code
- Test thoroughly with different inputs
- Include proper documentation

**Case Studies:**
- Analyze the problem systematically
- Apply theoretical concepts to real situations
- Support arguments with evidence
- Provide actionable recommendations

What specific type of assignment are you working on? I can provide more targeted guidance!`;

      } else {
        responseContent = `I'm here to support your learning journey! Here's how I can help:

**📚 Study Support:**
- Explain complex concepts in simple terms
- Generate practice questions and quizzes
- Create personalized study plans
- Provide exam preparation strategies

**🎯 Academic Assistance:**
- Assignment guidance and structure
- Research methodology tips
- Time management strategies
- Learning technique recommendations

**💡 Quick Help:**
- Concept clarification
- Formula explanations
- Problem-solving approaches
- Study resource suggestions

**🔍 Subject Areas I Cover:**
- Computer Science & Programming
- Mathematics & Statistics
- Database Systems
- Software Engineering
- And many more!

**How to Get the Best Help:**
1. Be specific about what you're struggling with
2. Mention your current level of understanding
3. Let me know your learning preferences
4. Ask for examples when needed

What would you like to explore today? Feel free to ask about any concept, request practice questions, or get help with your assignments!`;
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
          <h1 className="text-3xl font-bold tracking-tight text-primary">Study AI Assistant</h1>
          <p className="text-muted-foreground">Your intelligent study companion for academic success and learning support</p>
        </div>
        <div className="flex items-center space-x-2">
          {unitsLoading ? (
            <Skeleton className="h-10 w-64" />
          ) : (
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder={enrolledUnits.length > 0 ? "Select unit context" : "No units enrolled"} />
              </SelectTrigger>
              <SelectContent>
                {enrolledUnits.length > 0 ? (
                  enrolledUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No enrolled units found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 h-[calc(100vh-16rem)] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-[85%] ${
                        message.role === 'user'
                          ? 'flex-row-reverse space-x-reverse'
                          : 'flex-row'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        message.role === 'user'
                          ? 'bg-primary/10'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {message.role === 'user'
                          ? <User className="h-4 w-4 text-primary" />
                          : <Brain className="h-4 w-4 text-white" />
                        }
                      </div>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[85%]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                        <Brain className="h-4 w-4 text-white animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Ask me to explain concepts, generate practice questions, create study plans, or help with assignments..."
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
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    size="lg"
                    className="px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Study AI uses advanced AI to provide academic assistance. Always verify important information with your course materials.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {action.icon}
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      handleQuickAction(action.prompt);
                      setActiveTab("chat");
                    }}
                  >
                    Try This
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Study Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle>Study Tips & Strategies</CardTitle>
              <CardDescription>Proven techniques to enhance your learning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Management
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use the Pomodoro Technique (25 min focus + 5 min break)</li>
                    <li>• Create a study schedule and stick to it</li>
                    <li>• Prioritize difficult subjects when you're most alert</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Active Learning
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Teach concepts to others or explain them aloud</li>
                    <li>• Create mind maps and visual summaries</li>
                    <li>• Practice retrieval instead of just re-reading</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Request */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Study Request</CardTitle>
              <CardDescription>Describe what you need help with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your study challenge, what you're struggling with, or what you'd like to learn..."
                rows={3}
              />
              <div className="flex space-x-2">
                <Select>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Help type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept Explanation</SelectItem>
                    <SelectItem value="practice">Practice Questions</SelectItem>
                    <SelectItem value="study-plan">Study Plan</SelectItem>
                    <SelectItem value="assignment">Assignment Help</SelectItem>
                    <SelectItem value="exam-prep">Exam Preparation</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Help
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyAI;
