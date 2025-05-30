import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Save, Send, Eye, FileText } from 'lucide-react';
import QuestionBuilder from './QuestionBuilder';
import { ExamQuestion } from '@/services/examService';

interface CreateExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Array<{ id: string; name: string; students: number }>;
  onCreateExam: (examData: any) => Promise<void>;
}

const CreateExamDialog: React.FC<CreateExamDialogProps> = ({
  open,
  onOpenChange,
  courses,
  onCreateExam
}) => {
  const [currentTab, setCurrentTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  
  // Basic exam details
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    instructions: '',
    course_id: '',
    assignment_type: 'exam' as 'exam' | 'quiz' | 'cat',
    total_points: 100,
    due_date: '',
    due_time: '23:59',
    duration_minutes: 60,
    max_attempts: 1,
    available_from: '',
    available_until: '',
    shuffle_questions: false,
    shuffle_options: false,
    show_results_immediately: false,
    show_correct_answers: false,
    allow_backtrack: true,
    question_per_page: 1,
    passing_score: 60
  });

  const [questions, setQuestions] = useState<Partial<ExamQuestion>[]>([]);
  const [previewQuestion, setPreviewQuestion] = useState<Partial<ExamQuestion> | null>(null);

  const handleBasicDataChange = (field: string, value: any) => {
    setExamData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateExam = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!examData.title || !examData.course_id || questions.length === 0) {
        throw new Error('Please fill in all required fields and add at least one question');
      }

      // Calculate total points from questions
      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

      const examPayload = {
        ...examData,
        total_points: totalPoints,
        submission_format: 'online_exam',
        questions: questions.map((q, index) => ({
          ...q,
          question_order: index + 1
        }))
      };

      await onCreateExam(examPayload);
      
      // Reset form
      setExamData({
        title: '',
        description: '',
        instructions: '',
        course_id: '',
        assignment_type: 'exam',
        total_points: 100,
        due_date: '',
        due_time: '23:59',
        duration_minutes: 60,
        max_attempts: 1,
        available_from: '',
        available_until: '',
        shuffle_questions: false,
        shuffle_options: false,
        show_results_immediately: false,
        show_correct_answers: false,
        allow_backtrack: true,
        question_per_page: 1,
        passing_score: 60
      });
      setQuestions([]);
      setCurrentTab('basic');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating exam:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);
  const questionCount = questions.length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New {examData.assignment_type.toUpperCase()}</DialogTitle>
            <DialogDescription>
              Create a comprehensive assessment for your students
            </DialogDescription>
          </DialogHeader>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="questions">Questions ({questionCount})</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select value={examData.course_id} onValueChange={(value) => handleBasicDataChange('course_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} ({course.students} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Assessment Type *</Label>
                  <Select value={examData.assignment_type} onValueChange={(value: any) => handleBasicDataChange('assignment_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Final Exam</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="cat">CAT (Continuous Assessment)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={examData.title}
                  onChange={(e) => handleBasicDataChange('title', e.target.value)}
                  placeholder="e.g., Midterm Exam - Data Structures"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={examData.description}
                  onChange={(e) => handleBasicDataChange('description', e.target.value)}
                  placeholder="Brief description of the assessment"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions for Students</Label>
                <Textarea
                  id="instructions"
                  value={examData.instructions}
                  onChange={(e) => handleBasicDataChange('instructions', e.target.value)}
                  placeholder="Detailed instructions for taking this assessment..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    value={examData.duration_minutes}
                    onChange={(e) => handleBasicDataChange('duration_minutes', parseInt(e.target.value) || 60)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attempts">Max Attempts</Label>
                  <Input
                    id="attempts"
                    type="number"
                    min="1"
                    max="5"
                    value={examData.max_attempts}
                    onChange={(e) => handleBasicDataChange('max_attempts', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passing">Passing Score (%)</Label>
                  <Input
                    id="passing"
                    type="number"
                    min="0"
                    max="100"
                    value={examData.passing_score}
                    onChange={(e) => handleBasicDataChange('passing_score', parseInt(e.target.value) || 60)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={examData.due_date}
                    onChange={(e) => handleBasicDataChange('due_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={examData.due_time}
                    onChange={(e) => handleBasicDataChange('due_time', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Exam Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Add and configure questions for your assessment
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{questionCount} questions</Badge>
                  <Badge variant="outline">{totalPoints} total points</Badge>
                </div>
              </div>
              
              <QuestionBuilder
                questions={questions}
                onQuestionsChange={setQuestions}
                onPreview={setPreviewQuestion}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Question Display</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={examData.shuffle_questions}
                        onCheckedChange={(checked) => handleBasicDataChange('shuffle_questions', !!checked)}
                      />
                      <Label>Randomize question order</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={examData.shuffle_options}
                        onCheckedChange={(checked) => handleBasicDataChange('shuffle_options', !!checked)}
                      />
                      <Label>Randomize answer options</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Questions per page</Label>
                      <Select value={examData.question_per_page.toString()} onValueChange={(value) => handleBasicDataChange('question_per_page', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">One question per page</SelectItem>
                          <SelectItem value="5">5 questions per page</SelectItem>
                          <SelectItem value="10">10 questions per page</SelectItem>
                          <SelectItem value="0">All questions on one page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Student Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={examData.allow_backtrack}
                        onCheckedChange={(checked) => handleBasicDataChange('allow_backtrack', !!checked)}
                      />
                      <Label>Allow going back to previous questions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={examData.show_results_immediately}
                        onCheckedChange={(checked) => handleBasicDataChange('show_results_immediately', !!checked)}
                      />
                      <Label>Show results immediately after submission</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={examData.show_correct_answers}
                        onCheckedChange={(checked) => handleBasicDataChange('show_correct_answers', !!checked)}
                      />
                      <Label>Show correct answers after submission</Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Availability Window</CardTitle>
                  <CardDescription>Set when students can access this assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Available From</Label>
                      <Input
                        type="datetime-local"
                        value={examData.available_from}
                        onChange={(e) => handleBasicDataChange('available_from', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Available Until</Label>
                      <Input
                        type="datetime-local"
                        value={examData.available_until}
                        onChange={(e) => handleBasicDataChange('available_until', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-sm">{examData.title || 'Untitled Assessment'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <p className="text-sm">{examData.assignment_type.toUpperCase()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm">{examData.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total Points</Label>
                      <p className="text-sm">{totalPoints} points</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Questions</Label>
                      <p className="text-sm">{questionCount} questions</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Passing Score</Label>
                      <p className="text-sm">{examData.passing_score}%</p>
                    </div>
                  </div>
                  
                  {examData.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm">{examData.description}</p>
                    </div>
                  )}
                  
                  {examData.instructions && (
                    <div>
                      <Label className="text-sm font-medium">Instructions</Label>
                      <p className="text-sm">{examData.instructions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="outline" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button onClick={handleCreateExam} disabled={loading || questionCount === 0}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Publish Assessment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Preview Dialog */}
      {previewQuestion && (
        <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Question Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Question</Label>
                <p className="text-sm mt-1">{previewQuestion.question_text}</p>
              </div>
              
              {previewQuestion.question_type === 'mcq' && previewQuestion.options && (
                <div>
                  <Label className="text-sm font-medium">Options</Label>
                  <div className="space-y-2 mt-1">
                    {previewQuestion.options.map((option, index) => (
                      <div key={index} className={`p-2 border rounded ${option.is_correct ? 'bg-green-50 border-green-200' : ''}`}>
                        <span className="text-sm">{String.fromCharCode(65 + index)}. {option.text}</span>
                        {option.is_correct && <Badge className="ml-2" variant="secondary">Correct</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Points: {previewQuestion.points}</span>
                <span>Type: {previewQuestion.question_type?.toUpperCase()}</span>
                {previewQuestion.time_limit && <span>Time Limit: {previewQuestion.time_limit}s</span>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CreateExamDialog;
