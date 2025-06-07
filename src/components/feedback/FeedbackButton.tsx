import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackFormData {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  subject: string;
  message: string;
  rating: number;
  email: string;
}

const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'general',
    subject: '',
    message: '',
    rating: 5,
    email: ''
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, dbUser } = useAuth();

  // Pre-fill email if user is logged in
  React.useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit feedback to database
      const { error } = await supabase
        .from('feedback')
        .insert({
          type: formData.type,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          rating: formData.rating,
          email: formData.email.trim() || null,
          user_id: user?.id || null,
          user_role: dbUser?.role || null,
          status: 'open',
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback. We'll review it and get back to you if needed.",
      });

      // Reset form
      setFormData({
        type: 'general',
        subject: '',
        message: '',
        rating: 5,
        email: user?.email || ''
      });

      setOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FeedbackForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Feedback Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select feedback type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug">🐛 Bug Report</SelectItem>
            <SelectItem value="feature">✨ Feature Request</SelectItem>
            <SelectItem value="improvement">🚀 Improvement Suggestion</SelectItem>
            <SelectItem value="general">💬 General Feedback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Brief description of your feedback"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Please provide detailed feedback..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {formData.message.length}/1000 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
              className={`p-1 rounded transition-colors ${
                star <= formData.rating 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              <Star className="h-5 w-5 fill-current" />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {formData.rating}/5
          </span>
        </div>
      </div>

      {!user && (
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@example.com"
          />
          <p className="text-xs text-muted-foreground">
            Provide your email if you'd like us to follow up with you.
          </p>
        </div>
      )}
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            className="bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs px-2 py-2 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full sm:rounded-md"
            size="sm"
          >
            <MessageSquare className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline text-xs">Feedback</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-center">
            <DrawerTitle>Share Your Feedback</DrawerTitle>
            <DrawerDescription>
              Help us improve the MMU Learning Management System
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto flex-1">
            <FeedbackForm />
          </div>
          <DrawerFooter>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs md:text-sm px-2 py-2 md:px-3 md:py-2 h-auto min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full sm:rounded-md"
          size="sm"
        >
          <MessageSquare className="h-4 w-4 sm:mr-1 md:mr-2" />
          <span className="hidden sm:inline text-xs md:text-sm">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve the MMU Learning Management System
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <FeedbackForm />
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackButton;
