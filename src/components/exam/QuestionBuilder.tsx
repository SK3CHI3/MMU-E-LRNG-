import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Eye } from 'lucide-react';
import { ExamQuestion } from '@/services/examService';

interface QuestionBuilderProps {
  questions: Partial<ExamQuestion>[];
  onQuestionsChange: (questions: Partial<ExamQuestion>[]) => void;
  onPreview?: (question: Partial<ExamQuestion>) => void;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  questions,
  onQuestionsChange,
  onPreview
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addQuestion = (type: 'mcq' | 'essay' | 'short_answer' | 'true_false') => {
    const newQuestion: Partial<ExamQuestion> = {
      question_text: '',
      question_type: type,
      question_order: questions.length + 1,
      points: 1,
      is_required: true,
      ...(type === 'mcq' && {
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ],
        correct_answers: []
      }),
      ...(type === 'true_false' && {
        options: [
          { text: 'True', is_correct: false },
          { text: 'False', is_correct: false }
        ],
        correct_answers: []
      }),
      ...(type === 'essay' && {
        max_words: 500
      }),
      ...(type === 'short_answer' && {
        expected_keywords: [],
        case_sensitive: false
      })
    };

    onQuestionsChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<ExamQuestion>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...updates };
    onQuestionsChange(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Reorder remaining questions
    updatedQuestions.forEach((q, i) => {
      q.question_order = i + 1;
    });
    onQuestionsChange(updatedQuestions);
  };

  const addMCQOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options) {
      const newOptions = [...question.options, { text: '', is_correct: false }];
      updateQuestion(questionIndex, { options: newOptions });
    }
  };

  const updateMCQOption = (questionIndex: number, optionIndex: number, text: string) => {
    const question = questions[questionIndex];
    if (question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = { ...newOptions[optionIndex], text };
      updateQuestion(questionIndex, { options: newOptions });
    }
  };

  const toggleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex].is_correct = !newOptions[optionIndex].is_correct;
      
      // Update correct_answers array
      const correctAnswers = newOptions
        .map((option, index) => option.is_correct ? index : -1)
        .filter(index => index !== -1);
      
      updateQuestion(questionIndex, { 
        options: newOptions,
        correct_answers: correctAnswers
      });
    }
  };

  const removeMCQOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      const correctAnswers = newOptions
        .map((option, index) => option.is_correct ? index : -1)
        .filter(index => index !== -1);
      
      updateQuestion(questionIndex, { 
        options: newOptions,
        correct_answers: correctAnswers
      });
    }
  };

  const renderQuestionEditor = (question: Partial<ExamQuestion>, index: number) => {
    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              <CardTitle className="text-lg">Question {index + 1}</CardTitle>
              <Badge variant="outline">{question.question_type?.toUpperCase()}</Badge>
              <Badge variant="secondary">{question.points} pts</Badge>
            </div>
            <div className="flex items-center gap-2">
              {onPreview && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPreview(question)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeQuestion(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label>Question Text</Label>
            <Textarea
              value={question.question_text || ''}
              onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
            />
          </div>

          {/* Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={question.points || 1}
                onChange={(e) => updateQuestion(index, { points: parseFloat(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Time Limit (seconds)</Label>
              <Input
                type="number"
                min="0"
                value={question.time_limit || ''}
                onChange={(e) => updateQuestion(index, { time_limit: parseInt(e.target.value) || undefined })}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* MCQ Options */}
          {(question.question_type === 'mcq' || question.question_type === 'true_false') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Answer Options</Label>
                {question.question_type === 'mcq' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addMCQOption(index)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Checkbox
                    checked={option.is_correct}
                    onCheckedChange={() => toggleCorrectAnswer(index, optionIndex)}
                  />
                  <Input
                    value={option.text}
                    onChange={(e) => updateMCQOption(index, optionIndex, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    className="flex-1"
                  />
                  {question.question_type === 'mcq' && question.options && question.options.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMCQOption(index, optionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Check the box(es) next to the correct answer(s)
              </p>
            </div>
          )}

          {/* Essay Settings */}
          {question.question_type === 'essay' && (
            <div className="space-y-2">
              <Label>Maximum Words</Label>
              <Input
                type="number"
                min="50"
                value={question.max_words || 500}
                onChange={(e) => updateQuestion(index, { max_words: parseInt(e.target.value) || 500 })}
              />
            </div>
          )}

          {/* Short Answer Settings */}
          {question.question_type === 'short_answer' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Expected Keywords (for auto-grading)</Label>
                <Textarea
                  value={question.expected_keywords?.join(', ') || ''}
                  onChange={(e) => updateQuestion(index, { 
                    expected_keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                  })}
                  placeholder="Enter keywords separated by commas"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={question.case_sensitive || false}
                  onCheckedChange={(checked) => updateQuestion(index, { case_sensitive: !!checked })}
                />
                <Label>Case sensitive matching</Label>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-2">
            <Label>Explanation (shown after submission)</Label>
            <Textarea
              value={question.explanation || ''}
              onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
              placeholder="Optional explanation for the correct answer..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Add Question Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => addQuestion('mcq')} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Multiple Choice
        </Button>
        <Button onClick={() => addQuestion('true_false')} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          True/False
        </Button>
        <Button onClick={() => addQuestion('short_answer')} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Short Answer
        </Button>
        <Button onClick={() => addQuestion('essay')} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Essay
        </Button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">No questions added yet</h3>
              <p>Click one of the buttons above to add your first question</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        questions.map((question, index) => renderQuestionEditor(question, index))
      )}
    </div>
  );
};

export default QuestionBuilder;
