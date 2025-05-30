
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Brain, Send, User } from "lucide-react";

const ComradeAI = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! I'm Comrade AI, your learning assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simulated chat response
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate API response delay
    setTimeout(() => {
      // Mock responses based on keywords in the input
      let responseContent = "";
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes("assignment") || lowerInput.includes("homework")) {
        responseContent = "I can help you understand your assignment requirements. What specific part are you struggling with? I can explain concepts, suggest resources, or help you structure your approach.";
      } else if (lowerInput.includes("exam") || lowerInput.includes("test")) {
        responseContent = "Preparing for exams? I recommend creating a study schedule, focusing on the most important concepts, and practicing with past papers. Would you like me to generate some practice questions on a specific topic?";
      } else if (lowerInput.includes("concept") || lowerInput.includes("understand") || lowerInput.includes("explain")) {
        responseContent = "I'd be happy to explain that concept to you. To give you the most helpful explanation, could you provide more details about what you're trying to understand?";
      } else {
        responseContent = "Thanks for your message. I'm here to help with your studies, explain concepts, generate practice questions, or suggest resources. Feel free to ask me about anything related to your courses!";
      }
      
      // Add AI response
      setMessages(prev => [...prev, { role: "assistant", content: responseContent }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comrade AI Assistant</h1>
          <p className="text-muted-foreground">Your 24/7 learning companion</p>
        </div>
      </div>
      
      <Card className="border-none">
        <CardContent className="p-6 h-[calc(100vh-14rem)] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === 'user' 
                      ? 'flex-row-reverse space-x-reverse' 
                      : 'flex-row'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    message.role === 'user' 
                      ? 'bg-primary/10' 
                      : 'bg-secondary'
                  }`}>
                    {message.role === 'user' 
                      ? <User className="h-5 w-5 text-primary" /> 
                      : <Brain className="h-5 w-5" />
                    }
                  </div>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div className="bg-secondary rounded-lg px-4 py-2">
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
          
          <div className="flex space-x-2">
            <Input
              placeholder="Ask me anything about your courses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Comrade AI uses GPT to provide academic assistance. Responses are AI-generated and may require verification.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComradeAI;
