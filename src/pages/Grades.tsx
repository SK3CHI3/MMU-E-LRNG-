
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

const Grades = () => {
  // This would come from an API in a real app
  const grades = [
    {
      id: 1,
      unit: "MCS 101: Introduction to Media Studies",
      assignment: "Media Analysis Report",
      score: 85,
      feedback: "Good analysis, could improve on theoretical application.",
      status: "passed"
    },
    {
      id: 2,
      unit: "MCS 204: Digital Communications",
      assignment: "Social Media Strategy",
      score: 92,
      feedback: "Excellent work! Creative and well-researched strategy.",
      status: "passed"
    },
    {
      id: 3,
      unit: "MCS 305: Media Ethics",
      assignment: "Ethics Case Study",
      score: 78,
      feedback: "Adequate analysis but lacks depth in ethical considerations.",
      status: "passed"
    },
    {
      id: 4,
      unit: "MCS 202: Research Methods",
      assignment: "Research Proposal",
      score: 65,
      feedback: "Needs significant improvement in methodology section.",
      status: "failed"
    },
  ];

  // Calculate GPA (simplified version)
  const totalPoints = grades.reduce((sum, grade) => sum + grade.score, 0);
  const gpa = (totalPoints / (grades.length * 100)) * 4.0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grades</h1>
        <p className="text-muted-foreground">View your academic performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Current GPA</CardTitle>
            <CardDescription>Semester 2, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gpa.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Out of 4.0 scale
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average Score</CardTitle>
            <CardDescription>Across all assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(totalPoints / grades.length).toFixed(1)}%
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-secondary">
              <div 
                className="h-full rounded-full bg-primary" 
                style={{ width: `${totalPoints / grades.length}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Supplementary Exams</CardTitle>
            <CardDescription>Retake attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-sm text-muted-foreground mt-1">
              Maximum allowed: 3
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Details</CardTitle>
          <CardDescription>
            View detailed breakdown of your grades by assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell className="font-medium">{grade.unit}</TableCell>
                  <TableCell>{grade.assignment}</TableCell>
                  <TableCell className="text-center">{grade.score}%</TableCell>
                  <TableCell className="max-w-[300px]">{grade.feedback}</TableCell>
                  <TableCell className="text-center">
                    {grade.status === "passed" ? (
                      <Badge className="bg-green-500 flex items-center mx-auto gap-1">
                        <CheckCircle className="h-3 w-3" /> Passed
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 flex items-center mx-auto gap-1">
                        <AlertCircle className="h-3 w-3" /> Failed
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Grades;
