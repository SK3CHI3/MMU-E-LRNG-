import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Send, 
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { ExamQuestion, ExamAttempt, submitExamAnswer, completeExamAttempt } from '@/services/examService';

interface ExamInterfaceProps {
  attempt: ExamAttempt;
  questions: ExamQuestion[];
  onExamComplete: (attempt: ExamAttempt) => void;
  onAutoSave?: (questionId: string, answer: any) => void;
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({
  attempt,
  questions,
  onExamComplete,
  onAutoSave
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(attempt.time_remaining || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredQuestions = Object.keys(answers).length;

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-save functionality
  const autoSave = useCallback(async (questionId: string, answer: any) => {
    if (!onAutoSave) return;

    try {
      setAutoSaveStatus('saving');
      await submitExamAnswer(attempt.id, questionId, answer);
      setAutoSaveStatus('saved');
      onAutoSave(questionId, answer);
      
      // Clear status after 2 seconds
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    }
  }, [attempt.id, onAutoSave]);

  // Handle answer changes
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-save after 2 seconds of inactivity
    const timeoutId = setTimeout(() => {
      autoSave(questionId, answer);
    }, 2000);

    return () => clearTimeout(timeoutId);
  };

  // Navigation functions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  };

  const goToPrevious = () => goToQuestion(currentQuestionIndex - 1);
  const goToNext = () => goToQuestion(currentQuestionIndex + 1);

  // Submit exam
  const handleSubmitExam = async (autoSubmitted = false) => {
    try {
      setIsSubmitting(true);
      
      // Save all current answers
      for (const [questionId, answer] of Object.entries(answers)) {
        await submitExamAnswer(attempt.id, questionId, answer);
      }

      // Complete the attempt
      const completedAttempt = await completeExamAttempt(attempt.id, autoSubmitted);
      onExamComplete(completedAttempt);
    } catch (error) {
      console.error('Error submitting exam:', error);
      setIsSubmitting(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Render question based on type
  const renderQuestion = (question: ExamQuestion) => {
    const questionAnswer = answers[question.id] || {};

    switch (question.question_type) {
      case 'mcq':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={questionAnswer.selected_options?.[0]?.toString() || ''}
              onValueChange={(value) => 
                handleAnswerChange(question.id, { selected_options: [parseInt(value)] })
              }
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {String.fromCharCode(65 + index)}. {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            <RadioGroup
              value={questionAnswer.selected_options?.[0]?.toString() || ''}
              onValueChange={(value) => 
                handleAnswerChange(question.id, { selected_options: [parseInt(value)] })
              }
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`tf-${index}`} />
                  <Label htmlFor={`tf-${index}`} className="cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'short_answer':
        return (
          <Textarea
            value={questionAnswer.answer_text || ''}
            onChange={(e) => 
              handleAnswerChange(question.id, { answer_text: e.target.value })
            }
            placeholder="Enter your answer here..."
            rows={3}
            className="w-full"
          />
        );

      case 'essay':
        return (
          <div className="space-y-2">
            <Textarea
              value={questionAnswer.answer_text || ''}
              onChange={(e) => 
                handleAnswerChange(question.id, { answer_text: e.target.value })
              }
              placeholder="Write your essay here..."
              rows={8}
              className="w-full"
            />
            {question.max_words && (
              <div className="text-sm text-muted-foreground text-right">
                Word limit: {question.max_words} words
              </div>
            )}
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with timer and progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Question {currentQuestionIndex + 1} of {totalQuestions}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{answeredQuestions} answered</span>
                <Badge variant="outline">{currentQuestion.points} points</Badge>
                {autoSaveStatus && (
                  <div className="flex items-center gap-1">
                    {autoSaveStatus === 'saved' && <CheckCircle className="h-3 w-3 text-green-500" />}
                    {autoSaveStatus === 'saving' && <Clock className="h-3 w-3 text-blue-500" />}
                    {autoSaveStatus === 'error' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    <span className="text-xs">
                      {autoSaveStatus === 'saved' && 'Saved'}
                      {autoSaveStatus === 'saving' && 'Saving...'}
                      {autoSaveStatus === 'error' && 'Save failed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {timeRemaining > 0 && (
              <div className="text-right">
                <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-primary'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-muted-foreground">Time remaining</div>
              </div>
            )}
          </div>
          <Progress value={(answeredQuestions / totalQuestions) * 100} className="h-2" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          {currentQuestion.is_required && (
            <Badge variant="destructive" className="w-fit">Required</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {renderQuestion(currentQuestion)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {/* Question navigation dots */}
          <div className="flex gap-1">
            {questions.slice(0, 10).map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers[questions[index].id]
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-muted text-muted-foreground border'
                }`}
              >
                {index + 1}
              </button>
            ))}
            {questions.length > 10 && (
              <span className="text-muted-foreground">...</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={goToNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSubmitExam(false)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          )}
        </div>
      </div>

      {/* Warning for time running out */}
      {timeRemaining > 0 && timeRemaining < 300 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: Less than 5 minutes remaining! Your exam will be automatically submitted when time runs out.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExamInterface;
