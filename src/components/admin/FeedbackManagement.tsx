import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Star, Clock, CheckCircle, XCircle, User, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  subject: string;
  message: string;
  rating: number;
  email: string | null;
  user_id: string | null;
  user_role: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch feedback submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string, response?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (response) {
        updateData.admin_response = response;
      }

      const { error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Feedback status updated successfully.",
      });

      fetchFeedbacks();
      setSelectedFeedback(null);
      setAdminResponse('');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback status.",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'improvement': return '🚀';
      default: return '💬';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feedback Management</h2>
          <p className="text-muted-foreground">Manage user feedback and suggestions</p>
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          fetchFeedbacks();
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No feedback found</h3>
                <p className="text-muted-foreground">No feedback submissions match your current filter.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          feedbacks.map((feedback) => (
            <Card key={feedback.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(feedback.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{feedback.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                        </span>
                        {feedback.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {feedback.email}
                          </span>
                        )}
                        {feedback.user_role && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {feedback.user_role}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(feedback.rating)}</div>
                    <Badge className={getStatusColor(feedback.status)}>
                      {feedback.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{feedback.message}</p>
                
                {feedback.admin_response && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                    <h4 className="font-medium text-sm mb-1">Admin Response:</h4>
                    <p className="text-sm">{feedback.admin_response}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {feedback.status === 'open' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFeedbackStatus(feedback.id, 'in_progress')}
                      >
                        Mark In Progress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        Respond & Resolve
                      </Button>
                    </>
                  )}
                  
                  {feedback.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => setSelectedFeedback(feedback)}
                    >
                      Resolve
                    </Button>
                  )}
                  
                  {feedback.status === 'resolved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateFeedbackStatus(feedback.id, 'closed')}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Respond to Feedback</CardTitle>
              <CardDescription>{selectedFeedback.subject}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">{selectedFeedback.message}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Admin Response (Optional)</label>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Provide a response to the user..."
                  rows={3}
                  autoComplete="off"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => updateFeedbackStatus(selectedFeedback.id, 'resolved', adminResponse)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFeedback(null);
                    setAdminResponse('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
