import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Lightbulb,
  BarChart3,
  MessageSquare,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  PieChart,
  Activity,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDeanStats, getFacultyDepartments, getFacultyPerformance } from '@/services/deanService';

interface AIInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'opportunity' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  category: 'performance' | 'resources' | 'students' | 'faculty';
  actionable: boolean;
  timestamp: string;
}

interface AIAnalysis {
  facultyHealth: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
  riskFactors: string[];
  opportunities: string[];
  recommendations: string[];
}

const ManagementAI = () => {
  const { dbUser } = useAuth();
  const [activeTab, setActiveTab] = useState('insights');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    graduationRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!dbUser?.faculty) return;

      try {
        setLoading(true);
        const [deanStats, departments, performance] = await Promise.all([
          getDeanStats(dbUser.faculty),
          getFacultyDepartments(dbUser.faculty),
          getFacultyPerformance(dbUser.faculty)
        ]);

        setStats(deanStats);

        // Generate AI insights based on real data
        generateAIInsights(deanStats, departments, performance);
        generateAIAnalysis(deanStats, departments, performance);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dbUser?.faculty]);

  const generateAIInsights = (stats: any, departments: any[], performance: any[]) => {
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'recommendation',
        title: 'Optimize Faculty Workload Distribution',
        description: `With ${stats.totalCourses} courses and ${stats.totalLecturers} lecturers, consider redistributing teaching loads to improve efficiency.`,
        impact: 'high',
        confidence: 87,
        category: 'faculty',
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'opportunity',
        title: 'Increase Student Enrollment',
        description: `Current enrollment of ${stats.totalStudents} students shows potential for 15% growth based on faculty capacity.`,
        impact: 'medium',
        confidence: 73,
        category: 'students',
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        type: 'alert',
        title: 'Monitor Graduation Rate',
        description: `Current graduation rate of ${stats.graduationRate}% requires attention to meet institutional targets.`,
        impact: stats.graduationRate < 85 ? 'high' : 'medium',
        confidence: 92,
        category: 'performance',
        actionable: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        type: 'prediction',
        title: 'Research Output Forecast',
        description: 'Based on current trends, research publications are expected to increase by 20% next quarter.',
        impact: 'medium',
        confidence: 68,
        category: 'performance',
        actionable: false,
        timestamp: new Date().toISOString()
      }
    ];

    setInsights(mockInsights);
  };

  const generateAIAnalysis = (stats: any, departments: any[], performance: any[]) => {
    const facultyHealth = Math.round((stats.graduationRate + (stats.totalStudents / 10) + (stats.totalCourses / 2)) / 3);

    const mockAnalysis: AIAnalysis = {
      facultyHealth: Math.min(facultyHealth, 100),
      performanceTrend: stats.graduationRate >= 85 ? 'improving' : stats.graduationRate >= 75 ? 'stable' : 'declining',
      riskFactors: [
        stats.graduationRate < 85 ? 'Below-target graduation rate' : null,
        stats.totalLecturers < 20 ? 'Limited faculty size' : null,
        'Potential resource constraints'
      ].filter(Boolean) as string[],
      opportunities: [
        'Expand online course offerings',
        'Develop industry partnerships',
        'Implement mentorship programs',
        'Enhance research collaboration'
      ],
      recommendations: [
        'Increase faculty development programs',
        'Implement student retention strategies',
        'Optimize course scheduling',
        'Enhance technology infrastructure'
      ]
    };

    setAnalysis(mockAnalysis);
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        `Based on your faculty data, I recommend focusing on improving student retention rates. With ${stats.totalStudents} students and a ${stats.graduationRate}% graduation rate, implementing early intervention programs could increase success rates by 10-15%.`,
        `Your faculty has ${stats.totalLecturers} lecturers managing ${stats.totalCourses} courses. The optimal ratio suggests you could handle 20% more students with current resources by optimizing course scheduling.`,
        `Analysis shows strong potential for research growth. Consider establishing cross-departmental research teams to leverage your ${stats.totalLecturers} faculty members more effectively.`,
        `Student performance data indicates that departments with higher faculty-to-student ratios show 25% better outcomes. Consider redistributing resources accordingly.`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiResponse(randomResponse);
      setIsProcessing(false);
    }, 2000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'opportunity':
        return <Target className="h-5 w-5 text-green-600" />;
      case 'prediction':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Management AI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">AI-powered insights and recommendations for {dbUser?.faculty}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">AI Powered</span>
        </div>
      </div>

      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faculty Health Score</p>
                <p className="text-2xl font-bold text-green-600">{analysis?.facultyHealth || 0}%</p>
                <p className="text-xs text-gray-500">AI Assessment</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance Trend</p>
                <p className="text-2xl font-bold text-blue-600 capitalize">{analysis?.performanceTrend || 'Stable'}</p>
                <p className="text-xs text-gray-500">Based on analytics</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Insights</p>
                <p className="text-2xl font-bold text-purple-600">{insights.length}</p>
                <p className="text-xs text-gray-500">Active recommendations</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main AI Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          <TabsTrigger value="analytics">Smart Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Real-time analysis of your faculty performance and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          <Badge variant="outline">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 capitalize">{insight.category} • {insight.type}</span>
                        {insight.actionable && (
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Take Action
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Management Assistant</CardTitle>
              <CardDescription>Ask questions about your faculty management and get AI-powered insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiQuery("How can I improve student retention rates?")}
                >
                  Student Retention
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiQuery("What's the optimal faculty-to-student ratio?")}
                >
                  Faculty Ratio
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiQuery("How to increase research output?")}
                >
                  Research Growth
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiQuery("Budget optimization strategies?")}
                >
                  Budget Tips
                </Button>
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Ask about faculty performance, resource allocation, student outcomes..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIQuery()}
                />
                <Button onClick={handleAIQuery} disabled={isProcessing}>
                  {isProcessing ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Ask AI
                </Button>
              </div>

              {aiResponse && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">AI Assistant</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{aiResponse}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Suggested Questions</h4>
                <div className="space-y-2">
                  {[
                    "What departments need more resources?",
                    "How to improve graduation rates?",
                    "Which courses have low enrollment?",
                    "Faculty workload distribution analysis",
                    "Student satisfaction improvement strategies"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setAiQuery(suggestion)}
                      className="text-left w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Health Analysis</CardTitle>
                <CardDescription>AI-powered assessment of overall faculty performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Health Score</span>
                    <span>{analysis?.facultyHealth}%</span>
                  </div>
                  <Progress value={analysis?.facultyHealth || 0} className="h-2" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Risk Factors</h4>
                  {analysis?.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Students</span>
                      <p className="font-semibold">{stats.totalStudents}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Lecturers</span>
                      <p className="font-semibold">{stats.totalLecturers}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Courses</span>
                      <p className="font-semibold">{stats.totalCourses}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Grad Rate</span>
                      <p className="font-semibold">{stats.graduationRate}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
                <CardDescription>AI-identified areas for improvement and expansion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis?.opportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>{opportunity}</span>
                  </div>
                ))}

                {/* Predictive Analytics */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">AI Predictions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Next Quarter Enrollment</span>
                      <Badge variant="outline" className="text-green-600">
                        +12% ↗
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Faculty Retention</span>
                      <Badge variant="outline" className="text-blue-600">
                        95% ↗
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Research Output</span>
                      <Badge variant="outline" className="text-purple-600">
                        +20% ↗
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resource Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI Efficiency Score</p>
                  <Progress value={87} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">4.2/5</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Predicted Rating</p>
                  <Progress value={84} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Innovation Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">92</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI Innovation Score</p>
                  <Progress value={92} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Actionable suggestions to improve faculty performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis?.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <span>{recommendation}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                      <Button size="sm">
                        Implement
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagementAI;
