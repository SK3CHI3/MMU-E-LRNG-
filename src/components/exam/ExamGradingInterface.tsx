import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  Save,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react';

interface ExamSubmission {
  id: string;
  student_name: string;
  student_id: string;
  submitted_at: string;
  total_score?: number;
  percentage?: number;
  is_graded: boolean;
  answers: Array<{
    question_id: string;
    question_text: string;
    question_type: string;
    points: number;
    answer_text?: string;
    selected_options?: number[];
    points_earned: number;
    is_correct?: boolean;
    auto_graded: boolean;
    manual_feedback?: string;
    options?: Array<{ text: string; is_correct: boolean }>;
  }>;
}

interface ExamGradingInterfaceProps {
  assignmentId: string;
  submissions: ExamSubmission[];
  onGradeSubmission: (submissionId: string, grades: any) => Promise<void>;
  onClose: () => void;
}

const ExamGradingInterface: React.FC<ExamGradingInterfaceProps> = ({
  assignmentId,
  submissions,
  onGradeSubmission,
  onClose
}) => {
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [grades, setGrades] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const currentSubmission = submissions[currentSubmissionIndex];
  const totalSubmissions = submissions.length;

  // Filter submissions based on active tab
  const filteredSubmissions = submissions.filter(submission => {
    switch (activeTab) {
      case 'graded':
        return submission.is_graded;
      case 'ungraded':
        return !submission.is_graded;
      case 'auto':
        return submission.answers.every(a => a.auto_graded);
      default:
        return true;
    }
  });

  // Initialize grades for current submission
  useEffect(() => {
    if (currentSubmission) {
      const submissionGrades: Record<string, any> = {};
      currentSubmission.answers.forEach(answer => {
        submissionGrades[answer.question_id] = {
          points_earned: answer.points_earned,
          manual_feedback: answer.manual_feedback || ''
        };
      });
      setGrades(submissionGrades);
    }
  }, [currentSubmission]);

  const handleGradeChange = (questionId: string, field: string, value: any) => {
    setGrades(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const handleSaveGrades = async () => {
    if (!currentSubmission) return;

    try {
      setSaving(true);
      await onGradeSubmission(currentSubmission.id, grades);
      
      // Move to next ungraded submission
      const nextUngraded = submissions.findIndex((sub, index) => 
        index > currentSubmissionIndex && !sub.is_graded
      );
      if (nextUngraded !== -1) {
        setCurrentSubmissionIndex(nextUngraded);
      }
    } catch (error) {
      console.error('Error saving grades:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalScore = () => {
    if (!currentSubmission) return 0;
    return Object.values(grades).reduce((total: number, grade: any) => 
      total + (parseFloat(grade.points_earned) || 0), 0
    );
  };

  const calculateMaxScore = () => {
    if (!currentSubmission) return 0;
    return currentSubmission.answers.reduce((total, answer) => total + answer.points, 0);
  };

  const goToSubmission = (index: number) => {
    if (index >= 0 && index < totalSubmissions) {
      setCurrentSubmissionIndex(index);
    }
  };

  const renderQuestionGrading = (answer: any) => {
    const grade = grades[answer.question_id] || {};

    return (
      <Card key={answer.question_id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{answer.question_text}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{answer.question_type.toUpperCase()}</Badge>
                <Badge variant="secondary">{answer.points} pts</Badge>
                {answer.auto_graded && (
                  <Badge variant="outline" className="text-green-600">Auto-graded</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show correct answer for MCQ */}
          {answer.question_type === 'mcq' && answer.options && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Answer Options</Label>
              {answer.options.map((option: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-2 border rounded ${
                    option.is_correct 
                      ? 'bg-green-50 border-green-200' 
                      : answer.selected_options?.includes(index)
                      ? 'bg-red-50 border-red-200'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{String.fromCharCode(65 + index)}. {option.text}</span>
                    <div className="flex gap-1">
                      {option.is_correct && (
                        <Badge variant="secondary" className="text-green-600">Correct</Badge>
                      )}
                      {answer.selected_options?.includes(index) && (
                        <Badge variant="outline" className="text-blue-600">Selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show student answer for text-based questions */}
          {(answer.question_type === 'essay' || answer.question_type === 'short_answer') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Student Answer</Label>
              <div className="p-3 bg-gray-50 border rounded">
                <p className="text-sm whitespace-pre-wrap">
                  {answer.answer_text || 'No answer provided'}
                </p>
              </div>
            </div>
          )}

          {/* Grading section */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor={`points-${answer.question_id}`}>Points Earned</Label>
              <Input
                id={`points-${answer.question_id}`}
                type="number"
                min="0"
                max={answer.points}
                step="0.5"
                value={grade.points_earned || 0}
                onChange={(e) => handleGradeChange(
                  answer.question_id, 
                  'points_earned', 
                  parseFloat(e.target.value) || 0
                )}
                disabled={answer.auto_graded && answer.question_type === 'mcq'}
              />
              <p className="text-xs text-muted-foreground">
                Max: {answer.points} points
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`feedback-${answer.question_id}`}>Feedback</Label>
              <Textarea
                id={`feedback-${answer.question_id}`}
                value={grade.manual_feedback || ''}
                onChange={(e) => handleGradeChange(
                  answer.question_id, 
                  'manual_feedback', 
                  e.target.value
                )}
                placeholder="Optional feedback for the student..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!currentSubmission) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No submissions to grade</h3>
        <p className="text-muted-foreground">All submissions have been graded.</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  const totalScore = calculateTotalScore();
  const maxScore = calculateMaxScore();
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Grading</h2>
          <p className="text-muted-foreground">
            Submission {currentSubmissionIndex + 1} of {totalSubmissions}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Submission Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{currentSubmission.student_name}</CardTitle>
              <CardDescription>
                Student ID: {currentSubmission.student_id} • 
                Submitted: {new Date(currentSubmission.submitted_at).toLocaleString()}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {totalScore.toFixed(1)} / {maxScore}
              </div>
              <div className="text-sm text-muted-foreground">
                {percentage.toFixed(1)}%
              </div>
            </div>
          </div>
          <Progress value={percentage} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => goToSubmission(currentSubmissionIndex - 1)}
              disabled={currentSubmissionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {submissions.slice(0, 10).map((submission, index) => (
                <button
                  key={submission.id}
                  onClick={() => goToSubmission(index)}
                  className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                    index === currentSubmissionIndex
                      ? 'bg-primary text-primary-foreground'
                      : submission.is_graded
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-muted text-muted-foreground border'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              {submissions.length > 10 && (
                <span className="text-muted-foreground">...</span>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => goToSubmission(currentSubmissionIndex + 1)}
              disabled={currentSubmissionIndex === totalSubmissions - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {currentSubmission.answers.map(renderQuestionGrading)}
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSaveGrades}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Grades'}
        </Button>
      </div>
    </div>
  );
};

export default ExamGradingInterface;
